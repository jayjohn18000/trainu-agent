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

    // Get all active GHL configs
    const { data: configs, error: configError } = await supabase
      .from('ghl_config')
      .select('*')
      .eq('is_active', true);

    if (configError) {
      console.error('Error fetching GHL configs:', configError);
      return errorResponse(configError.message, 500);
    }

    if (!configs || configs.length === 0) {
      console.log('No active GHL configs found');
      return jsonResponse({ synced: 0, message: 'No active configs' });
    }

    let totalSynced = 0;

    for (const config of configs) {
      const { trainer_id, location_id, ghl_api_key } = config;
      
      if (!ghl_api_key || !location_id) {
        console.log(`Skipping trainer ${trainer_id}: missing credentials`);
        continue;
      }

      console.log(`Syncing data for trainer ${trainer_id}, location ${location_id}`);

      try {
        // Sync contacts
        const contactsUrl = `${GHL_API_BASE}/contacts/?locationId=${location_id}`;
        const contactsResponse = await fetch(contactsUrl, {
          headers: {
            'Authorization': `Bearer ${ghl_api_key}`,
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
              last_contacted_at: contact.dateAdded ? new Date(contact.dateAdded).toISOString() : null,
            }, {
              onConflict: 'ghl_contact_id',
              ignoreDuplicates: false,
            });
          }

          console.log(`Synced ${contacts.length} contacts for trainer ${trainer_id}`);
          totalSynced += contacts.length;
        } else {
          console.error(`Failed to fetch contacts for trainer ${trainer_id}:`, await contactsResponse.text());
        }

        // Sync conversations/messages
        const conversationsUrl = `${GHL_API_BASE}/conversations/search?locationId=${location_id}`;
        const conversationsResponse = await fetch(conversationsUrl, {
          headers: {
            'Authorization': `Bearer ${ghl_api_key}`,
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

          console.log(`Synced ${conversations.length} conversations for trainer ${trainer_id}`);
        }

        // Sync appointments
        const appointmentsUrl = `${GHL_API_BASE}/calendars/events?locationId=${location_id}`;
        const appointmentsResponse = await fetch(appointmentsUrl, {
          headers: {
            'Authorization': `Bearer ${ghl_api_key}`,
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
              }, {
                onConflict: 'ghl_appointment_id',
                ignoreDuplicates: false,
              });
            }
          }

          console.log(`Synced ${appointments.length} appointments for trainer ${trainer_id}`);
        }

        // Update last sync timestamp
        await supabase
          .from('ghl_config')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('trainer_id', trainer_id);

      } catch (error) {
        console.error(`Error syncing trainer ${trainer_id}:`, error);
        continue;
      }
    }

    console.log(`GHL sync completed. Total records synced: ${totalSynced}`);
    return jsonResponse({ 
      synced: totalSynced,
      trainers: configs.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('GHL sync error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
});
