import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { corsHeaders } from '../_shared/responses.ts';

// Zod validation schemas for GHL API data
const contactSchema = z.object({
  id: z.string().max(100),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email().max(255).optional().or(z.literal('')),
  phone: z.string().regex(/^[\+]?[0-9\s\-\(\)]{0,20}$/).max(20).optional().or(z.literal('')),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

const appointmentSchema = z.object({
  id: z.string().max(100),
  contactId: z.string().max(100).optional(),
  startTime: z.string().optional(),
  start_time: z.string().optional(),
  title: z.string().max(200).optional(),
  name: z.string().max(200).optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  status: z.string().max(50).optional(),
});

const messageSchema = z.object({
  id: z.string().max(100),
  body: z.string().max(1600).optional(),
  content: z.string().max(1600).optional(),
  type: z.string().max(50).optional(),
  direction: z.string().max(50).optional(),
  status: z.string().max(50).optional(),
  dateAdded: z.string().optional(),
  createdAt: z.string().optional(),
});

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GHL_API_BASE = Deno.env.get('GHL_API_BASE') || 'https://services.leadconnectorhq.com';

/**
 * Periodic backup sync from GHL to TrainU
 * Runs every 30 minutes as a safety net for missed webhooks
 * 
 * Uses GHL_PRIVATE_API_KEY (agency-level) + per-trainer location_id
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Use GHL_PRIVATE_API_KEY for all API calls
    const ghlPrivateApiKey = Deno.env.get('GHL_PRIVATE_API_KEY');
    if (!ghlPrivateApiKey) {
      console.error('[ghl-periodic-sync] GHL_PRIVATE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'GHL_PRIVATE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[ghl-periodic-sync] Starting periodic sync', {
      timestamp: new Date().toISOString()
    });

    // Get all GHL configurations with location_id set
    const { data: configs, error: configError } = await supabase
      .from('ghl_config')
      .select('*')
      .not('location_id', 'is', null);

    if (configError) {
      console.error('[ghl-periodic-sync] Error fetching configs:', configError);
      throw configError;
    }

    if (!configs || configs.length === 0) {
      console.log('[ghl-periodic-sync] No GHL configurations found');
      return new Response(
        JSON.stringify({ success: true, message: 'No configurations to sync' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const config of configs) {
      try {
        const result = await syncTrainerData(supabase, config, ghlPrivateApiKey);
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

async function syncTrainerData(supabase: any, config: any, ghlPrivateApiKey: string) {
  const { trainer_id, location_id } = config;
  
  console.log(`[ghl-periodic-sync] Syncing trainer ${trainer_id}, location ${location_id}`);

  // Use GHL_PRIVATE_API_KEY for all requests
  const headers = {
    'Authorization': `Bearer ${ghlPrivateApiKey}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json'
  };

  let contactsSynced = 0;
  let contactsSkipped = 0;
  let appointmentsSynced = 0;
  let appointmentsSkipped = 0;
  let messagesSynced = 0;
  let messagesSkipped = 0;

  // Sync contacts
  try {
    const contactsUrl = `${GHL_API_BASE}/contacts/?locationId=${location_id}&limit=100`;
    const contactsRes = await fetch(contactsUrl, { headers });
    
    if (contactsRes.ok) {
      const contactsData = await contactsRes.json();
      const contacts = contactsData.contacts || [];
      
      for (const contact of contacts) {
        // Validate contact data
        const validation = contactSchema.safeParse(contact);
        if (!validation.success) {
          console.warn('[ghl-periodic-sync] Invalid contact data', { 
            contactId: contact.id,
            errors: validation.error.errors.map(e => e.message)
          });
          contactsSkipped++;
          continue;
        }

        const validContact = validation.data;
        
        await supabase.from('contacts').upsert({
          trainer_id,
          ghl_contact_id: String(validContact.id),
          first_name: validContact.firstName || null,
          last_name: validContact.lastName || null,
          email: validContact.email || null,
          phone: validContact.phone || null,
          tags: validContact.tags || null,
          sync_source: 'ghl',
        }, { onConflict: 'ghl_contact_id' });
        
        contactsSynced++;
      }
    } else {
      console.error(`[ghl-periodic-sync] Failed to fetch contacts:`, await contactsRes.text());
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

        // Validate appointment data
        const validation = appointmentSchema.safeParse(appt);
        if (!validation.success) {
          console.warn('[ghl-periodic-sync] Invalid appointment data', { 
            appointmentId: appt.id,
            errors: validation.error.errors.map(e => e.message)
          });
          appointmentsSkipped++;
          continue;
        }

        const validAppt = validation.data;
        
        // Find contact
        const { data: contact } = await supabase
          .from('contacts')
          .select('id')
          .eq('ghl_contact_id', String(validAppt.contactId))
          .eq('trainer_id', trainer_id)
          .maybeSingle();

        if (contact) {
          await supabase.from('bookings').upsert({
            trainer_id,
            contact_id: contact.id,
            ghl_appointment_id: String(validAppt.id),
            scheduled_at: new Date(validAppt.startTime || validAppt.start_time!).toISOString(),
            status: (validAppt.status || 'scheduled').toLowerCase(),
            session_type: validAppt.title || validAppt.name || 'Session',
            notes: validAppt.notes || null,
            sync_source: 'ghl',
          }, { onConflict: 'ghl_appointment_id' });
          
          appointmentsSynced++;
        }
      }
    } else {
      console.error(`[ghl-periodic-sync] Failed to fetch appointments:`, await appointmentsRes.text());
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
        if (!contact.ghl_contact_id) continue;
        
        const messagesUrl = `${GHL_API_BASE}/conversations/messages?contactId=${contact.ghl_contact_id}&startDate=${since.toISOString()}`;
        const messagesRes = await fetch(messagesUrl, { headers });
        
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          const messages = messagesData.messages || [];
          
          for (const msg of messages) {
            // Validate message data
            const validation = messageSchema.safeParse(msg);
            if (!validation.success) {
              console.warn('[ghl-periodic-sync] Invalid message data', { 
                messageId: msg.id,
                errors: validation.error.errors.map(e => e.message)
              });
              messagesSkipped++;
              continue;
            }

            const validMsg = validation.data;

            // Determine direction and channel
            const direction = validMsg.direction || (validMsg.type === 'TYPE_SMS' || validMsg.type === 'SMS' ? 'outbound' : 'inbound');
            let channel = 'sms';
            if (validMsg.type && typeof validMsg.type === 'string') {
              const type = validMsg.type.toLowerCase();
              if (type.includes('email')) channel = 'email';
              else if (type.includes('sms')) channel = 'sms';
            }

            await supabase.from('messages').upsert({
              trainer_id,
              contact_id: contact.id,
              ghl_message_id: String(validMsg.id),
              direction,
              content: validMsg.body || validMsg.content || '',
              channel,
              status: validMsg.status || 'sent',
              ghl_status: validMsg.status,
              ghl_delivered_at: validMsg.dateAdded || validMsg.createdAt || new Date().toISOString(),
              created_at: validMsg.dateAdded || validMsg.createdAt || new Date().toISOString(),
            }, { onConflict: 'ghl_message_id' });
            
            messagesSynced++;
          }
        }
      }
    }
  } catch (error) {
    console.error(`[ghl-periodic-sync] Messages sync error for ${trainer_id}:`, error);
  }

  // Update last sync time
  await supabase
    .from('ghl_config')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('trainer_id', trainer_id);

  console.log(`[ghl-periodic-sync] Completed for trainer ${trainer_id}:`, {
    contacts: { synced: contactsSynced, skipped: contactsSkipped },
    appointments: { synced: appointmentsSynced, skipped: appointmentsSkipped },
    messages: { synced: messagesSynced, skipped: messagesSkipped }
  });

  return {
    success: true,
    contactsSynced,
    contactsSkipped,
    appointmentsSynced,
    appointmentsSkipped,
    messagesSynced,
    messagesSkipped
  };
}