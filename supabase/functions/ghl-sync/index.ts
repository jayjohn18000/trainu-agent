import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { jsonResponse, errorResponse, optionsResponse } from '../_shared/responses.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { getEffectiveToken } from '../_shared/ghl-location-token.ts'

const GHL_API_BASE = Deno.env.get('GHL_API_BASE') || 'https://services.leadconnectorhq.com';

// Required GHL scopes for full functionality
const REQUIRED_SCOPES = {
  contacts: ['contacts.readonly', 'contacts.write'],
  conversations: ['conversations.readonly'],
  calendars: ['calendars.readonly', 'calendars/events.readonly'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse();
  }

  const syncStartTime = Date.now();
  
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
      // If no body, try to get all configs
      console.log('No trainer_id specified, syncing all trainers');
    }

    console.log(`Starting GHL sync${trainerId ? ` for trainer ${trainerId}` : ''}...`);

    // Get agency-level token as fallback
    const ghlPrivateApiKey = Deno.env.get('GHL_PRIVATE_API_KEY');
    if (!ghlPrivateApiKey) {
      console.error('GHL_PRIVATE_API_KEY not configured');
      return errorResponse('GHL_PRIVATE_API_KEY not configured', 500);
    }

    // Get GHL configs (filter by trainer_id if provided)
    let query = supabase
      .from('ghl_config')
      .select('*')
      .not('location_id', 'is', null);

    if (trainerId) {
      query = query.eq('trainer_id', trainerId);
    }

    const { data: configs, error: configError } = await query;

    if (configError) {
      console.error('Error fetching GHL configs:', configError);
      return errorResponse(configError.message, 500);
    }

    if (!configs || configs.length === 0) {
      console.log('No GHL configs found');
      return jsonResponse({ synced: 0, message: 'No configs' });
    }

    let totalSynced = 0;
    const results = [];
    const allScopeErrors: string[] = [];

    for (const config of configs) {
      const { trainer_id, location_id, access_token, token_expires_at } = config;
      
      if (!location_id) {
        console.log(`Skipping trainer ${trainer_id}: missing location_id`);
        continue;
      }

      // Get the best available token - prioritize location token over agency token
      const { token: effectiveToken, tokenType } = getEffectiveToken(
        access_token,
        ghlPrivateApiKey,
        token_expires_at
      );
      
      console.log(`Using ${tokenType} token for trainer ${trainer_id}`);

      let contactsCount = 0;
      let conversationsCount = 0;
      let appointmentsCount = 0;
      let syncStatus = 'success';
      let syncError: string | null = null;
      let conflictsDetected = 0;
      const scopeErrors: string[] = [];
      const trainerSyncStart = Date.now();

      console.log(`Syncing data for trainer ${trainer_id}, location ${location_id}`);

      try {
        // Sync contacts using effective token (location or agency) + locationId
        const contactsUrl = `${GHL_API_BASE}/contacts/?locationId=${location_id}`;
        console.log(`Fetching contacts from: ${contactsUrl}`);
        
        const contactsResponse = await fetch(contactsUrl, {
          headers: {
            'Authorization': `Bearer ${effectiveToken}`,
            'Version': '2021-07-28',
          },
        });

        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          const contacts = contactsData.contacts || [];

          // Validate GHL contact data
          const ghlContactSchema = z.object({
            id: z.string().max(100),
            firstName: z.string().max(100).optional(),
            lastName: z.string().max(100).optional(),
            email: z.string().email().max(255).optional().nullable(),
            phone: z.string().max(20).optional().nullable(),
            tags: z.array(z.string().max(50)).max(50).optional(),
            dateAdded: z.string().optional(),
            dateUpdated: z.string().optional()
          });

          for (const contact of contacts) {
            // Validate contact data before inserting
            const validation = ghlContactSchema.safeParse(contact);
            if (!validation.success) {
              console.warn(`Invalid contact data from GHL:`, validation.error);
              continue; // Skip invalid contacts
            }
            const validContact = validation.data;
            
            // Check for conflicts - if record exists and was modified in TrainU since last sync
            const { data: existing } = await supabase
              .from('contacts')
              .select('id, updated_at, sync_source, last_synced_to_ghl_at')
              .eq('ghl_contact_id', contact.id)
              .eq('trainer_id', trainer_id)
              .maybeSingle();

            if (existing && existing.sync_source === 'trainu' && 
                existing.last_synced_to_ghl_at && 
                new Date(existing.updated_at) > new Date(existing.last_synced_to_ghl_at)) {
              // Conflict detected - record modified in both systems
              conflictsDetected++;
              await supabase.from('ghl_sync_conflicts').insert({
                trainer_id,
                entity_type: 'contact',
                entity_id: existing.id,
                trainu_data: existing,
                ghl_data: contact,
                trainu_updated_at: existing.updated_at,
                ghl_updated_at: contact.dateUpdated || contact.dateAdded,
                resolution_strategy: 'ghl_wins', // GHL data wins by default
              });
            }

            await supabase.from('contacts').upsert({
              trainer_id,
              ghl_contact_id: validContact.id,
              first_name: validContact.firstName || null,
              last_name: validContact.lastName || null,
              email: validContact.email || null,
              phone: validContact.phone || null,
              tags: validContact.tags || [],
              sync_source: 'ghl',
              last_contacted_at: validContact.dateAdded ? new Date(validContact.dateAdded).toISOString() : null,
            }, {
              onConflict: 'ghl_contact_id',
              ignoreDuplicates: false,
            });
          }

          contactsCount = contacts.length;
          console.log(`Synced ${contactsCount} contacts for trainer ${trainer_id}`);
          totalSynced += contactsCount;
        } else if (contactsResponse.status === 401 || contactsResponse.status === 403) {
          const errorText = await contactsResponse.text();
          console.error(`Contacts API 401/403 - Missing scope. Response: ${errorText}`);
          scopeErrors.push(`contacts: Missing scope (${REQUIRED_SCOPES.contacts.join(' or ')})`);
        } else {
          const errorText = await contactsResponse.text();
          console.error(`Failed to fetch contacts for trainer ${trainer_id}: ${contactsResponse.status} - ${errorText}`);
        }

        // Sync conversations/messages
        const conversationsUrl = `${GHL_API_BASE}/conversations/search?locationId=${location_id}`;
        console.log(`Fetching conversations from: ${conversationsUrl}`);
        
        const conversationsResponse = await fetch(conversationsUrl, {
          headers: {
            'Authorization': `Bearer ${effectiveToken}`,
            'Version': '2021-07-28',
          },
        });

        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          const conversations = conversationsData.conversations || [];

          for (const conversation of conversations) {
            // Get contact from our DB
            const { data: contact } = await supabase
              .from('contacts')
              .select('id')
              .eq('ghl_contact_id', conversation.contactId)
              .eq('trainer_id', trainer_id)
              .maybeSingle();

            if (contact && conversation.lastMessageBody) {
              await supabase.from('activity_feed').upsert({
                trainer_id,
                contact_id: contact.id,
                type: conversation.lastMessageType === 'SMS' ? 'sms_received' : 'email_received',
                title: `Message from ${conversation.contactName || 'Contact'}`,
                description: conversation.lastMessageBody,
                metadata: {
                  ghl_conversation_id: conversation.id,
                  message_date: conversation.lastMessageDate,
                },
              }, {
                onConflict: 'id',
                ignoreDuplicates: true,
              });
            }
          }

          conversationsCount = conversations.length;
          console.log(`Synced ${conversationsCount} conversations for trainer ${trainer_id}`);
        } else if (conversationsResponse.status === 401 || conversationsResponse.status === 403) {
          const errorText = await conversationsResponse.text();
          console.error(`Conversations API 401/403 - Missing scope. Response: ${errorText}`);
          scopeErrors.push(`conversations: Missing scope (${REQUIRED_SCOPES.conversations.join(' or ')})`);
        } else {
          const errorText = await conversationsResponse.text();
          console.error(`Failed to fetch conversations for trainer ${trainer_id}: ${conversationsResponse.status} - ${errorText}`);
        }

        // Sync appointments
        const appointmentsUrl = `${GHL_API_BASE}/calendars/events?locationId=${location_id}`;
        console.log(`Fetching appointments from: ${appointmentsUrl}`);
        
        const appointmentsResponse = await fetch(appointmentsUrl, {
          headers: {
            'Authorization': `Bearer ${effectiveToken}`,
            'Version': '2021-07-28',
          },
        });

        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          const appointments = appointmentsData.events || [];

          for (const appointment of appointments) {
            const { data: contact } = await supabase
              .from('contacts')
              .select('id')
              .eq('ghl_contact_id', appointment.contactId)
              .eq('trainer_id', trainer_id)
              .maybeSingle();

            if (contact) {
              await supabase.from('bookings').upsert({
                trainer_id,
                contact_id: contact.id,
                ghl_appointment_id: appointment.id,
                scheduled_at: appointment.startTime,
                status: appointment.status === 'confirmed' ? 'confirmed' : 'scheduled',
                session_type: appointment.title || 'Training Session',
                notes: appointment.notes || null,
                sync_source: 'ghl', // Mark as coming from GHL
              }, {
                onConflict: 'ghl_appointment_id',
                ignoreDuplicates: false,
              });
            }
          }

          appointmentsCount = appointments.length;
          console.log(`Synced ${appointmentsCount} appointments for trainer ${trainer_id}`);
        } else if (appointmentsResponse.status === 401 || appointmentsResponse.status === 403) {
          const errorText = await appointmentsResponse.text();
          console.error(`Appointments API 401/403 - Missing scope. Response: ${errorText}`);
          scopeErrors.push(`calendars: Missing scope (${REQUIRED_SCOPES.calendars.join(' or ')})`);
        } else {
          const errorText = await appointmentsResponse.text();
          console.error(`Failed to fetch appointments for trainer ${trainer_id}: ${appointmentsResponse.status} - ${errorText}`);
        }

        // Determine sync status based on scope errors
        if (scopeErrors.length > 0) {
          syncStatus = 'partial';
          syncError = `Missing GHL API scopes: ${scopeErrors.join('; ')}. Update your Private Integration permissions in GHL.`;
          allScopeErrors.push(...scopeErrors);
        }

      } catch (error) {
        console.error(`Error syncing trainer ${trainer_id}:`, error);
        syncStatus = 'error';
        syncError = error instanceof Error ? error.message : 'Unknown error';
      }

      // Calculate performance metrics
      const trainerSyncDuration = Date.now() - trainerSyncStart;
      const totalRecords = contactsCount + conversationsCount + appointmentsCount;
      const throughput = totalRecords > 0 ? (totalRecords / (trainerSyncDuration / 1000 / 60)) : 0;

      // Update sync statistics and performance metrics
      const { error: updateError } = await supabase
        .from('ghl_config')
        .update({ 
          last_sync_at: new Date().toISOString(),
          last_sync_status: syncStatus,
          last_sync_error: syncError,
          contacts_synced: contactsCount,
          conversations_synced: conversationsCount,
          appointments_synced: appointmentsCount,
          total_sync_count: config.total_sync_count ? config.total_sync_count + 1 : 1,
          avg_sync_duration_ms: trainerSyncDuration,
          sync_throughput_per_min: throughput,
          conflict_count: conflictsDetected,
        })
        .eq('trainer_id', trainer_id);

      // Log performance metrics
      await supabase.from('ghl_sync_metrics').insert({
        trainer_id,
        sync_type: 'pull',
        started_at: new Date(trainerSyncStart).toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: trainerSyncDuration,
        records_processed: totalRecords,
        records_succeeded: totalRecords,
        records_failed: 0,
        throughput_per_min: throughput,
      });

      if (updateError) {
        console.error(`Failed to update sync stats for trainer ${trainer_id}:`, updateError);
      }

      results.push({
        trainer_id,
        status: syncStatus,
        contacts: contactsCount,
        conversations: conversationsCount,
        appointments: appointmentsCount,
        error: syncError,
        scopeErrors: scopeErrors.length > 0 ? scopeErrors : undefined,
      });
    }

    const totalDuration = Date.now() - syncStartTime;
    console.log(`GHL sync completed. Total records synced: ${totalSynced}, Duration: ${totalDuration}ms`);
    
    return jsonResponse({ 
      synced: totalSynced,
      trainers: configs.length,
      duration_ms: totalDuration,
      timestamp: new Date().toISOString(),
      results,
      scopeErrors: allScopeErrors.length > 0 ? allScopeErrors : undefined,
    });

  } catch (error) {
    console.error('GHL sync error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
});
