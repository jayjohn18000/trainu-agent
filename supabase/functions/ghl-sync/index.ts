import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { jsonResponse, errorResponse } from '../_shared/responses.ts'

const GHL_API_BASE = Deno.env.get('GHL_API_BASE') || 'https://services.leadconnectorhq.com';

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Starting GHL sync...');

    // Get GHL access token from environment
    const ghlAccessToken = Deno.env.get('GHL_ACCESS_TOKEN');
    if (!ghlAccessToken) {
      console.error('GHL_ACCESS_TOKEN not configured');
      return errorResponse('GHL_ACCESS_TOKEN not configured', 500);
    }

    // Get all GHL configs with location IDs
    const { data: configs, error: configError } = await supabase
      .from('ghl_config')
      .select('*')
      .not('location_id', 'is', null);

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

    for (const config of configs) {
      const { trainer_id, location_id } = config;
      
      if (!location_id) {
        console.log(`Skipping trainer ${trainer_id}: missing location_id`);
        continue;
      }

      let contactsCount = 0;
      let conversationsCount = 0;
      let appointmentsCount = 0;
      let syncStatus = 'success';
      let syncError = null;

      console.log(`Syncing data for trainer ${trainer_id}, location ${location_id}`);

      try {
        // Sync contacts
        const contactsUrl = `${GHL_API_BASE}/contacts/?locationId=${location_id}`;
        const contactsResponse = await fetch(contactsUrl, {
          headers: {
            'Authorization': `Bearer ${ghlAccessToken}`,
            'Version': '2021-07-28',
          },
        });

        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          const contacts = contactsData.contacts || [];

          for (const contact of contacts) {
            await supabase.from('contacts').upsert({
              trainer_id,
              ghl_contact_id: contact.id,
              first_name: contact.firstName || null,
              last_name: contact.lastName || null,
              email: contact.email || null,
              phone: contact.phone || null,
              tags: contact.tags || [],
              sync_source: 'ghl', // Mark as coming from GHL
              last_contacted_at: contact.dateAdded ? new Date(contact.dateAdded).toISOString() : null,
            }, {
              onConflict: 'ghl_contact_id',
              ignoreDuplicates: false,
            });
          }

          contactsCount = contacts.length;
          console.log(`Synced ${contactsCount} contacts for trainer ${trainer_id}`);
          totalSynced += contactsCount;
        } else {
          console.error(`Failed to fetch contacts for trainer ${trainer_id}:`, await contactsResponse.text());
        }

        // Sync conversations/messages
        const conversationsUrl = `${GHL_API_BASE}/conversations/search?locationId=${location_id}`;
        const conversationsResponse = await fetch(conversationsUrl, {
          headers: {
            'Authorization': `Bearer ${ghlAccessToken}`,
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
        }

        // Sync appointments
        const appointmentsUrl = `${GHL_API_BASE}/calendars/events?locationId=${location_id}`;
        const appointmentsResponse = await fetch(appointmentsUrl, {
          headers: {
            'Authorization': `Bearer ${ghlAccessToken}`,
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
        }

      } catch (error) {
        console.error(`Error syncing trainer ${trainer_id}:`, error);
        syncStatus = 'error';
        syncError = error instanceof Error ? error.message : 'Unknown error';
      }

      // Update sync statistics
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
        })
        .eq('trainer_id', trainer_id);

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
      });
    }

    console.log(`GHL sync completed. Total records synced: ${totalSynced}`);
    return jsonResponse({ 
      synced: totalSynced,
      trainers: configs.length,
      timestamp: new Date().toISOString(),
      results,
    });

  } catch (error) {
    console.error('GHL sync error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
});
