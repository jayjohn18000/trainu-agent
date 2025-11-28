import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { jsonResponse, errorResponse } from '../_shared/responses.ts'
import { getEffectiveToken } from '../_shared/ghl-location-token.ts'

const GHL_API_BASE = Deno.env.get('GHL_API_BASE') || 'https://services.leadconnectorhq.com';

Deno.serve(async (req) => {
  const pushStartTime = Date.now();
  
  try {
    // Use service role client (no JWT required)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get trainer_id from request body for internal calls
    let trainerId: string | null = null;
    
    try {
      const body = await req.json();
      trainerId = body?.trainerId;
    } catch {
      // If no body, try to get all pending items
      console.log('No trainer_id specified, processing all pending items');
    }

    console.log(`Starting GHL push${trainerId ? ` for trainer ${trainerId}` : ''}...`);

    // Get agency-level token as fallback
    const ghlPrivateApiKey = Deno.env.get('GHL_PRIVATE_API_KEY');
    if (!ghlPrivateApiKey) {
      console.error('GHL_PRIVATE_API_KEY not configured');
      return errorResponse('GHL_PRIVATE_API_KEY not configured', 500);
    }

    // Get pending sync queue items (filter by trainer_id if provided)
    let query = supabase
      .from('ghl_sync_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3) // Max 3 retry attempts
      .order('created_at', { ascending: true })
      .limit(50);

    if (trainerId) {
      query = query.eq('trainer_id', trainerId);
    }

    const { data: queueItems, error: queueError } = await query;

    if (queueError) {
      console.error('Error fetching sync queue:', queueError);
      return errorResponse(queueError.message, 500);
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('No pending sync items');
      return jsonResponse({ processed: 0, message: 'No pending items' });
    }

    console.log(`Processing ${queueItems.length} sync items`);

    let successCount = 0;
    let failCount = 0;

    for (const item of queueItems) {
      // Mark as processing
      await supabase
        .from('ghl_sync_queue')
        .update({ status: 'processing', attempts: item.attempts + 1 })
        .eq('id', item.id);

      try {
        // Get trainer's GHL config for location_id and access_token
        const { data: config } = await supabase
          .from('ghl_config')
          .select('location_id, access_token, token_expires_at')
          .eq('trainer_id', item.trainer_id)
          .single();

        if (!config?.location_id) {
          throw new Error('No GHL location configured for trainer');
        }

        // Get the best available token - prioritize location token over agency token
        const { token: effectiveToken, tokenType } = getEffectiveToken(
          config.access_token,
          ghlPrivateApiKey,
          config.token_expires_at
        );
        
        console.log(`Using ${tokenType} token for push operation`);

        // Use effective token for all operations
        if (item.entity_type === 'contact') {
          await processContactSync(item, config.location_id, effectiveToken, supabase);
        } else if (item.entity_type === 'booking') {
          await processBookingSync(item, config.location_id, effectiveToken, supabase);
        }

        // Mark as completed
        await supabase
          .from('ghl_sync_queue')
          .update({ 
            status: 'completed', 
            processed_at: new Date().toISOString(),
            error_message: null 
          })
          .eq('id', item.id);

        successCount++;
        console.log(`Successfully processed ${item.entity_type} ${item.operation}`);

      } catch (error) {
        console.error(`Error processing sync item ${item.id}:`, error);
        
        // Mark as failed if max attempts reached, otherwise back to pending
        const newStatus = item.attempts + 1 >= 3 ? 'failed' : 'pending';
        await supabase
          .from('ghl_sync_queue')
          .update({ 
            status: newStatus,
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', item.id);

        failCount++;
      }
    }

    const totalDuration = Date.now() - pushStartTime;
    const throughput = queueItems.length > 0 ? (queueItems.length / (totalDuration / 1000 / 60)) : 0;
    
    console.log(`Push completed: ${successCount} succeeded, ${failCount} failed, Duration: ${totalDuration}ms`);
    
    // Log performance metrics
    if (queueItems.length > 0) {
      const trainerIds = [...new Set(queueItems.map(item => item.trainer_id))];
      for (const trainerId of trainerIds) {
        await supabase.from('ghl_sync_metrics').insert({
          trainer_id: trainerId,
          sync_type: 'push',
          started_at: new Date(pushStartTime).toISOString(),
          completed_at: new Date().toISOString(),
          duration_ms: totalDuration,
          records_processed: queueItems.filter(i => i.trainer_id === trainerId).length,
          records_succeeded: successCount,
          records_failed: failCount,
          throughput_per_min: throughput,
        });
      }
    }
    
    return jsonResponse({ 
      processed: queueItems.length,
      succeeded: successCount,
      failed: failCount,
      duration_ms: totalDuration,
      throughput_per_min: throughput,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('GHL push error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
});

async function processContactSync(
  item: any, 
  locationId: string, 
  apiKey: string,
  supabase: any
) {
  const payload = item.payload;

  if (item.operation === 'create') {
    // Create new contact in GHL
    if (!payload.ghl_contact_id) {
      const createUrl = `${GHL_API_BASE}/contacts/`;
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: locationId,
          firstName: payload.first_name,
          lastName: payload.last_name,
          email: payload.email,
          phone: payload.phone,
          tags: payload.tags || [],
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`GHL API error: ${errorText}`);
      }

      const createdContact = await createResponse.json();
      
      // Update local contact with GHL ID (mark as ghl source to avoid re-triggering)
      await supabase
        .from('contacts')
        .update({ 
          ghl_contact_id: createdContact.contact.id,
          sync_source: 'ghl',
          last_synced_to_ghl_at: new Date().toISOString()
        })
        .eq('id', item.entity_id);
      
      // Reset sync_source back to trainu for future changes
      await supabase
        .from('contacts')
        .update({ sync_source: 'trainu' })
        .eq('id', item.entity_id);
    }
  } else if (item.operation === 'update' && payload.ghl_contact_id) {
    // Update existing contact in GHL
    const updateUrl = `${GHL_API_BASE}/contacts/${payload.ghl_contact_id}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: payload.first_name,
        lastName: payload.last_name,
        email: payload.email,
        phone: payload.phone,
        tags: payload.tags || [],
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`GHL API error: ${errorText}`);
    }

    // Update sync timestamp
    await supabase
      .from('contacts')
      .update({ 
        sync_source: 'ghl',
        last_synced_to_ghl_at: new Date().toISOString()
      })
      .eq('id', item.entity_id);
    
    // Reset sync_source
    await supabase
      .from('contacts')
      .update({ sync_source: 'trainu' })
      .eq('id', item.entity_id);
  }
}

async function processBookingSync(
  item: any, 
  locationId: string, 
  apiKey: string,
  supabase: any
) {
  const payload = item.payload;

  // Get contact's GHL ID
  const { data: contact } = await supabase
    .from('contacts')
    .select('ghl_contact_id')
    .eq('id', payload.contact_id)
    .single();

  if (!contact?.ghl_contact_id) {
    throw new Error('Contact not synced to GHL');
  }

  if (item.operation === 'create') {
    // Create appointment in GHL
    if (!payload.ghl_appointment_id) {
      const createUrl = `${GHL_API_BASE}/calendars/events`;
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: locationId,
          contactId: contact.ghl_contact_id,
          startTime: payload.scheduled_at,
          title: payload.session_type || 'Training Session',
          appointmentStatus: payload.status === 'confirmed' ? 'confirmed' : 'scheduled',
          notes: payload.notes,
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`GHL API error: ${errorText}`);
      }

      const createdEvent = await createResponse.json();
      
      // Update local booking with GHL appointment ID
      await supabase
        .from('bookings')
        .update({ 
          ghl_appointment_id: createdEvent.id,
          sync_source: 'ghl',
          last_synced_to_ghl_at: new Date().toISOString()
        })
        .eq('id', item.entity_id);
      
      // Reset sync_source
      await supabase
        .from('bookings')
        .update({ sync_source: 'trainu' })
        .eq('id', item.entity_id);
    }
  } else if (item.operation === 'update' && payload.ghl_appointment_id) {
    // Update appointment in GHL
    const updateUrl = `${GHL_API_BASE}/calendars/events/${payload.ghl_appointment_id}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startTime: payload.scheduled_at,
        title: payload.session_type || 'Training Session',
        appointmentStatus: payload.status === 'confirmed' ? 'confirmed' : 'scheduled',
        notes: payload.notes,
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`GHL API error: ${errorText}`);
    }

    // Update sync timestamp
    await supabase
      .from('bookings')
      .update({ 
        sync_source: 'ghl',
        last_synced_to_ghl_at: new Date().toISOString()
      })
      .eq('id', item.entity_id);
    
    // Reset sync_source
    await supabase
      .from('bookings')
      .update({ sync_source: 'trainu' })
      .eq('id', item.entity_id);
  }
}