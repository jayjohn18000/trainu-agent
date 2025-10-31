import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { jsonResponse, errorResponse, optionsResponse } from '../_shared/responses.ts'
import { BACKFILL_BATCH_SIZE } from '../_shared/constants.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse();
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get checkpoint from ghl_config or start fresh
    const body = req.method === 'POST' ? await req.json() : {};
    const { trainer_id, batchSize = BACKFILL_BATCH_SIZE, checkpoint } = body;

    // Fetch clients missing ghl_contact_id (batch)
    let query = supabase
      .from('clients')
      .select('id, email, phone, trainer_id')
      .is('ghl_contact_id', null)
      .limit(batchSize);

    if (checkpoint) {
      query = query.gt('id', checkpoint);
    }

    if (trainer_id) {
      query = query.eq('trainer_id', trainer_id);
    }

    const { data: clients, error: clientsError } = await query;

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      return errorResponse(clientsError.message, 500);
    }

    if (!clients || clients.length === 0) {
      return jsonResponse({ 
        processed: 0, 
        mapped: 0,
        completed: true,
      });
    }

    // Group by trainer_id to batch API calls
    const byTrainer: Record<string, typeof clients> = {};
    for (const client of clients) {
      const tid = client.trainer_id;
      if (!byTrainer[tid]) byTrainer[tid] = [];
      byTrainer[tid].push(client);
    }

    let mapped = 0;
    let lastId: string | null = null;

    // Process each trainer's batch
    for (const [tid, trainerClients] of Object.entries(byTrainer)) {
      // Get trainer's GHL config
      const { data: ghlConfig } = await supabase
        .from('ghl_config')
        .select('*')
        .eq('trainer_id', tid)
        .single();

      if (!ghlConfig) continue;

      // Collect emails and phones
      const emails: string[] = [];
      const phones: string[] = [];
      const clientMap: Record<string, typeof clients[0]> = {};

      for (const client of trainerClients) {
        if (client.email) {
          emails.push(client.email);
          clientMap[client.email] = client;
        }
        if (client.phone) {
          phones.push(client.phone);
          clientMap[client.phone] = client;
        }
      }

      if (emails.length === 0 && phones.length === 0) continue;

      // Call ghl-integration getContactIds
      try {
        const { data: ghlResult, error: ghlError } = await supabase.functions.invoke('ghl-integration', {
          body: {
            action: 'getContactIds',
            emails,
            phones,
          },
          headers: {
            Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''}`,
          },
        });

        if (ghlError || !ghlResult?.mapping) {
          console.error(`Failed to get contact IDs for trainer ${tid}:`, ghlError);
          continue;
        }

        // OPTIMIZATION: Batch update clients (fix N+1)
        const updates = Object.entries(ghlResult.mapping)
          .filter(([key, contactId]) => clientMap[key] && contactId)
          .map(([key, contactId]) => ({
            id: clientMap[key].id,
            ghl_contact_id: String(contactId),
            trainer_id: clientMap[key].trainer_id,
            email: clientMap[key].email,
            phone: clientMap[key].phone,
          }));

        if (updates.length > 0) {
          // Use upsert for batch update (much faster than individual updates)
          const { error: updateError } = await supabase
            .from('clients')
            .upsert(updates, { onConflict: 'id' });
          
          if (updateError) {
            console.error(`Failed to batch update clients for trainer ${tid}:`, updateError);
          } else {
            mapped += updates.length;
          }
        }

        lastId = trainerClients[trainerClients.length - 1].id;
      } catch (err) {
        console.error(`Error processing trainer ${tid}:`, err);
      }
    }

    // Update checkpoint in ghl_config (store last processed client ID)
    if (lastId && trainer_id) {
      await supabase
        .from('ghl_config')
        .update({ backfill_checkpoint: lastId })
        .eq('trainer_id', trainer_id);
    }

    return jsonResponse({ 
      processed: clients.length,
      mapped,
      checkpoint: lastId,
      completed: clients.length < batchSize,
    });

  } catch (error) {
    console.error('GHL backfill error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
});
