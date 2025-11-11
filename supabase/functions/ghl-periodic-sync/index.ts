import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from '../_shared/responses.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GHL_API_BASE = Deno.env.get('GHL_API_BASE') || 'https://services.leadconnectorhq.com';

/**
 * Periodic backup sync from GHL to TrainU
 * Runs every 30 minutes as a safety net for missed webhooks
 * 
 * Schedule: Run via pg_cron or external scheduler
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log('[ghl-periodic-sync] Starting periodic sync', {
      timestamp: new Date().toISOString()
    });

    // Get all active GHL configurations
    const { data: configs, error: configError } = await supabase
      .from('ghl_config')
      .select('*')
      .eq('is_active', true);

    if (configError) {
      console.error('[ghl-periodic-sync] Error fetching configs:', configError);
      throw configError;
    }

    if (!configs || configs.length === 0) {
      console.log('[ghl-periodic-sync] No active GHL configurations found');
      return new Response(
        JSON.stringify({ success: true, message: 'No configurations to sync' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const config of configs) {
      try {
        const result = await syncTrainerData(supabase, config);
        results.push({
          trainerId: config.trainer_id,
          locationId: config.location_id,
          ...result
        });
      } catch (error) {
        console.error(`[ghl-periodic-sync] Error syncing trainer ${config.trainer_id}:`, error);
        results.push({
          trainerId: config.trainer_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('[ghl-periodic-sync] Sync completed', {
      totalConfigs: configs.length,
      successful: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length
    });

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[ghl-periodic-sync] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function syncTrainerData(supabase: any, config: any) {
  const { trainer_id, location_id, access_token } = config;
  
  console.log(`[ghl-periodic-sync] Syncing trainer ${trainer_id}, location ${location_id}`);

  const headers = {
    'Authorization': `Bearer ${access_token}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json'
  };

  let contactsSynced = 0;
  let appointmentsSynced = 0;
  let messagesSynced = 0;

  // Sync contacts
  try {
    const contactsUrl = `${GHL_API_BASE}/contacts/?locationId=${location_id}&limit=100`;
    const contactsRes = await fetch(contactsUrl, { headers });
    
    if (contactsRes.ok) {
      const contactsData = await contactsRes.json();
      const contacts = contactsData.contacts || [];
      
      for (const contact of contacts) {
        await supabase.from('contacts').upsert({
          trainer_id,
          ghl_contact_id: String(contact.id),
          first_name: contact.firstName || null,
          last_name: contact.lastName || null,
          email: contact.email || null,
          phone: contact.phone || null,
          tags: Array.isArray(contact.tags) ? contact.tags : null,
          sync_source: 'ghl',
          last_synced_at: new Date().toISOString(),
        }, { onConflict: 'ghl_contact_id' });
        
        contactsSynced++;
      }
    }
  } catch (error) {
    console.error(`[ghl-periodic-sync] Contacts sync error for ${trainer_id}:`, error);
  }

  // Sync appointments (last 7 days to current + 30 days future)
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const appointmentsUrl = `${GHL_API_BASE}/calendars/events?locationId=${location_id}&startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`;
    const appointmentsRes = await fetch(appointmentsUrl, { headers });
    
    if (appointmentsRes.ok) {
      const appointmentsData = await appointmentsRes.json();
      const appointments = appointmentsData.events || appointmentsData.appointments || [];
      
      for (const appt of appointments) {
        if (!appt.contactId) continue;
        
        // Find contact
        const { data: contact } = await supabase
          .from('contacts')
          .select('id')
          .eq('ghl_contact_id', String(appt.contactId))
          .eq('trainer_id', trainer_id)
          .single();

        if (contact) {
          await supabase.from('bookings').upsert({
            trainer_id,
            contact_id: contact.id,
            ghl_appointment_id: String(appt.id),
            scheduled_at: new Date(appt.startTime || appt.start_time).toISOString(),
            status: (appt.status || 'scheduled').toLowerCase(),
            session_type: appt.title || appt.name || 'Session',
            notes: appt.notes || null,
            sync_source: 'ghl',
            last_synced_at: new Date().toISOString(),
          }, { onConflict: 'ghl_appointment_id' });
          
          appointmentsSynced++;
        }
      }
    }
  } catch (error) {
    console.error(`[ghl-periodic-sync] Appointments sync error for ${trainer_id}:`, error);
  }

  // Sync recent messages (last 24 hours)
  try {
    const since = new Date();
    since.setHours(since.getHours() - 24);

    // Get contacts for this trainer
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, ghl_contact_id')
      .eq('trainer_id', trainer_id)
      .limit(50); // Limit to prevent too many API calls

    if (contacts) {
      for (const contact of contacts) {
        const messagesUrl = `${GHL_API_BASE}/conversations/messages?contactId=${contact.ghl_contact_id}&startDate=${since.toISOString()}`;
        const messagesRes = await fetch(messagesUrl, { headers });
        
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          const messages = messagesData.messages || [];
          
          for (const msg of messages) {
            // Determine direction and channel
            const direction = msg.direction || (msg.type === 'TYPE_SMS' || msg.type === 'SMS' ? 'outbound' : 'inbound');
            let channel = 'sms';
            if (msg.type && typeof msg.type === 'string') {
              const type = msg.type.toLowerCase();
              if (type.includes('email')) channel = 'email';
              else if (type.includes('sms')) channel = 'sms';
            }

            await supabase.from('messages').upsert({
              trainer_id,
              contact_id: contact.id,
              ghl_message_id: String(msg.id),
              direction,
              content: msg.body || msg.content || '',
              channel,
              status: msg.status || 'sent',
              ghl_status: msg.status,
              ghl_delivered_at: msg.dateAdded || msg.createdAt || new Date().toISOString(),
              created_at: msg.dateAdded || msg.createdAt || new Date().toISOString(),
            }, { onConflict: 'ghl_message_id' });
            
            messagesSynced++;
          }
        }
      }
    }
  } catch (error) {
    console.error(`[ghl-periodic-sync] Messages sync error for ${trainer_id}:`, error);
  }

  console.log(`[ghl-periodic-sync] Completed for trainer ${trainer_id}:`, {
    contacts: contactsSynced,
    appointments: appointmentsSynced,
    messages: messagesSynced
  });

  return {
    success: true,
    contactsSynced,
    appointmentsSynced,
    messagesSynced
  };
}
