import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getGHLToken } from "../_shared/ghl-token.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const contactDataSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided",
});

const messageDataSchema = z.object({
  content: z.string().min(1).max(1600),
  subject: z.string().max(200).optional(),
});

const ghlIntegrationSchema = z.object({
  action: z.enum(['send_message', 'create_contact', 'update_contact', 'getContactIds', 'ensureTags', 'applyTags', 'webhook']),
  contactData: contactDataSchema.optional(),
  messageData: messageDataSchema.optional(),
  queueItemId: z.string().uuid().optional(),
}).refine(data => {
  if (data.action === 'send_message') {
    return data.contactData && data.messageData;
  }
  return true;
}, {
  message: "send_message action requires both contactData and messageData",
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    
    // Validate input
    const validation = ghlIntegrationSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.format() }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { action, contactData, messageData, queueItemId } = validation.data;

    const GHL_API_BASE = Deno.env.get('GHL_API_BASE') ?? 'https://services.leadconnectorhq.com';
    const GHL_ACCESS_TOKEN = Deno.env.get('GHL_ACCESS_TOKEN');

    // Get trainer's GHL config
    const { data: ghlConfig } = await supabase
      .from('ghl_config')
      .select('*')
      .eq('trainer_id', user.id)
      .single();

    // Get per-location token, fallback to global token
    let accessToken = ghlConfig?.access_token;
    if (!accessToken && ghlConfig) {
      accessToken = await getGHLToken(supabase, user.id, {
        info: (msg, data) => console.log(`[ghl-integration] ${msg}`, data),
        warn: (msg, data) => console.warn(`[ghl-integration] ${msg}`, data),
        error: (msg, data) => console.error(`[ghl-integration] ${msg}`, data),
        debug: (msg, data) => console.debug(`[ghl-integration] ${msg}`, data),
      });
    }
    if (!accessToken) {
      accessToken = GHL_ACCESS_TOKEN;
    }

    // DEMO MODE: If creds or config are missing, return mock success
    if (action === 'send_message' && (!GHL_API_BASE || !accessToken || !ghlConfig)) {
      const mockMessageId = `mock_${Date.now()}`;
      console.log(
        JSON.stringify({
          function: 'ghl-integration',
          action: 'demo_mode_send',
          note: 'DEMO MODE: Would have sent via GHL',
          to: contactData?.phone || contactData?.email,
          trainerId: user.id,
          messageId: mockMessageId,
          timestamp: new Date().toISOString(),
        })
      );
      return new Response(
        JSON.stringify({
          success: true,
          demo: true,
          results: { sms: { messageId: mockMessageId } },
          contactId: 'mock_contact',
          messageId: mockMessageId,
          channel: contactData?.phone ? 'sms' : 'email',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'send_message') {
      // Type guards to ensure required data exists
      if (!contactData || !messageData) {
        return new Response(
          JSON.stringify({ error: "contactData and messageData are required for send_message" }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      if (!ghlConfig) {
        throw new Error('GHL not configured for this trainer');
      }
      if (!GHL_API_BASE || !accessToken) {
        throw new Error('GHL credentials not configured');
      }
      console.log('Sending message via GHL:', { contactData, messageData });

      // Step 1: Find or create contact
      const contactPayload = {
        locationId: ghlConfig.location_id,
        firstName: contactData.firstName || '',
        lastName: contactData.lastName || '',
        email: contactData.email || '',
        phone: contactData.phone || '',
      };

      console.log('Creating contact with payload:', contactPayload);
      console.log('Using API Base:', GHL_API_BASE);

      const contactResponse = await fetch(`${GHL_API_BASE}/contacts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify(contactPayload),
      });

      let contact: any;
      
      if (!contactResponse.ok) {
        const errorData = await contactResponse.json();
        console.log('GHL contact response error:', errorData);
        
        // Handle duplicate contact - GHL returns existing contact ID in meta
        if (errorData.statusCode === 400 && errorData.meta?.contactId) {
          console.log('Duplicate contact found, using existing ID:', errorData.meta.contactId);
          contact = { contact: { id: errorData.meta.contactId } };
        } else {
          console.error('GHL contact creation failed:', errorData);
          throw new Error(`Failed to create/find contact: ${JSON.stringify(errorData)}`);
        }
      } else {
        contact = await contactResponse.json();
        console.log('Contact created/found:', contact.contact?.id);
      }

      // Step 2: Send message(s)
      const results: any = { sms: null, email: null };

      // Send SMS if enabled and phone available
      if (ghlConfig.sms_enabled && contactData.phone) {
        const smsPayload = {
          type: 'SMS',
          contactId: contact.contact.id,
          message: messageData.content,
        };

        console.log('Sending SMS:', smsPayload);
        const smsResponse = await fetch(`${GHL_API_BASE}/conversations/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
          body: JSON.stringify(smsPayload),
        });

        if (smsResponse.ok) {
          results.sms = await smsResponse.json();
          console.log('SMS sent successfully:', results.sms);
        } else {
          const errorText = await smsResponse.text();
          console.error('SMS send failed:', errorText);
        }
      }

      // Send Email if enabled and email available
      if (ghlConfig.email_enabled && contactData.email) {
        const emailPayload = {
          type: 'Email',
          contactId: contact.contact.id,
          subject: messageData.subject || 'Message from your trainer',
          html: `<p>${messageData.content.replace(/\n/g, '<br>')}</p>`,
        };

        console.log('Sending Email:', emailPayload);
        const emailResponse = await fetch(`${GHL_API_BASE}/conversations/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
          body: JSON.stringify(emailPayload),
        });

        if (emailResponse.ok) {
          results.email = await emailResponse.json();
          console.log('Email sent successfully:', results.email);
        } else {
          const errorText = await emailResponse.text();
          console.error('Email send failed:', errorText);
        }
      }

      // Update activity feed with GHL tracking
      const messageId = results.sms?.messageId || results.email?.messageId;
      const channel = results.sms && results.email ? 'both' : results.sms ? 'sms' : 'email';

      if (queueItemId) {
        await supabase
          .from('activity_feed')
          .update({
            ghl_message_id: messageId,
            ghl_status: 'sent',
            ghl_channel: channel,
          })
          .eq('id', queueItemId);
      }

      return new Response(
        JSON.stringify({
          success: true,
          results,
          contactId: contact.contact.id,
          messageId,
          channel,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Map emails/phones to GHL contact ids
    if (action === 'getContactIds') {
      const { emails = [], phones = [] } = (await req.json());
      const isDemo = !GHL_API_BASE || !accessToken || !ghlConfig;
      const result: Record<string, string> = {};
      if (isDemo) {
        [...emails, ...phones].forEach((k: string) => { result[k] = `mock_${btoa(k).slice(0,8)}`; });
        return new Response(JSON.stringify({ mapping: result, demo: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      // Simple search loop (GHL supports queries by email/phone)
      for (const email of emails) {
        const r = await fetch(`${GHL_API_BASE}/contacts/?email=${encodeURIComponent(email)}&locationId=${encodeURIComponent(ghlConfig.location_id)}`, {
          headers: { 'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`, 'Version': '2021-07-28' },
        });
        if (r.ok) {
          const j = await r.json();
          const id = j?.contacts?.[0]?.id || j?.contact?.id;
          if (id) result[email] = String(id);
        }
      }
      for (const phone of phones) {
        const r = await fetch(`${GHL_API_BASE}/contacts/?phone=${encodeURIComponent(phone)}&locationId=${encodeURIComponent(ghlConfig.location_id)}`, {
          headers: { 'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`, 'Version': '2021-07-28' },
        });
        if (r.ok) {
          const j = await r.json();
          const id = j?.contacts?.[0]?.id || j?.contact?.id;
          if (id) result[phone] = String(id);
        }
      }
      return new Response(JSON.stringify({ mapping: result }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Ensure tags and return mapping of name -> id
    if (action === 'ensureTags') {
      const { names = [] } = (await req.json());
      const isDemo = !GHL_API_BASE || !accessToken || !ghlConfig;
      const mapping: Record<string, string> = {};
      if (isDemo) {
        names.forEach((n: string) => { mapping[n] = `mock_tag_${btoa(n).slice(0,6)}`; });
        return new Response(JSON.stringify({ tags: mapping, demo: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      for (const name of names) {
        // Try find existing
        const list = await fetch(`${GHL_API_BASE}/tags?locationId=${encodeURIComponent(ghlConfig.location_id)}`, { headers: { 'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`, 'Version': '2021-07-28' } });
        if (list.ok) {
          const j = await list.json();
          const found = (j?.tags || []).find((t: any) => t?.name?.toLowerCase() === name.toLowerCase());
          if (found) { mapping[name] = String(found.id); continue; }
        }
        // Create
        const cr = await fetch(`${GHL_API_BASE}/tags`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' },
          body: JSON.stringify({ name, locationId: ghlConfig.location_id })
        });
        if (cr.ok) {
          const j = await cr.json();
          mapping[name] = String(j?.tag?.id || j?.id);
        }
      }
      return new Response(JSON.stringify({ tags: mapping }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Apply tag to contacts
    if (action === 'applyTags') {
      const { contactIds = [], tagId } = (await req.json());
      const isDemo = !GHL_API_BASE || !accessToken || !ghlConfig;
      if (isDemo) {
        return new Response(JSON.stringify({ success: true, demo: true, applied: contactIds.length }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      let applied = 0;
      for (const id of contactIds) {
        const r = await fetch(`${GHL_API_BASE}/contacts/${encodeURIComponent(id)}/tags`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' },
          body: JSON.stringify({ id: tagId, locationId: ghlConfig.location_id })
        });
        if (r.ok) applied++;
      }
      return new Response(JSON.stringify({ success: true, applied }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'webhook') {
      // Basic webhook handler for GHL events
      const secret = Deno.env.get('GHL_WEBHOOK_SECRET');
      const provided = req.headers.get('x-ghl-signature');
      if (secret && provided !== secret) {
        return new Response(JSON.stringify({ error: 'invalid_signature' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const payload = await req.json();
      const event = payload.event as string;
      const data = payload.data as any;
      console.log('GHL Webhook received:', event);

      // Handle incoming messages (SMS, Email, DM)
      if (event === 'message.inbound' || event === 'message.received' || event === 'sms.received' || event === 'email.received') {
        const message = data?.message || data;
        const contactId = message.contactId || message.contact_id;
        
        // Get contact to find trainer_id and client name
        const { data: contact } = await supabase
          .from('contacts')
          .select('id, trainer_id, first_name, last_name')
          .eq('ghl_contact_id', String(contactId))
          .single();

        if (contact) {
          // Determine channel from event type or message type
          let channel = 'sms'; // default
          if (event.includes('email')) channel = 'email';
          else if (message.type === 'Email' || message.channel === 'email') channel = 'email';
          else if (message.type === 'SMS' || message.channel === 'sms') channel = 'sms';
          else if (message.type === 'DM' || message.channel === 'dm') channel = 'dm';

          const clientName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Client';

          // Insert into activity_feed
          await supabase.from('activity_feed').insert({
            trainer_id: contact.trainer_id,
            client_id: contact.id,
            client_name: clientName,
            action: 'received',
            status: 'success',
            why: `Received ${channel.toUpperCase()} from client`,
            message_preview: message.body || message.content || '',
            ghl_message_id: message.id || message.messageId,
            ghl_channel: channel,
            ghl_status: 'delivered',
            ghl_delivered_at: message.createdAt || new Date().toISOString(),
          });

          console.log(`Activity feed updated for incoming ${channel} from ${clientName}`);
        }
      }

      // Contacts upsert
      if (event?.startsWith('contact.')) {
        const contact = data?.contact || data;
        if (contact?.id) {
          await supabase.from('contacts').upsert({
            trainer_id: user.id,
            ghl_contact_id: String(contact.id),
            first_name: contact.firstName ?? null,
            last_name: contact.lastName ?? null,
            email: contact.email ?? null,
            phone: contact.phone ?? null,
            tags: Array.isArray(contact.tags) ? contact.tags : null,
          }, { onConflict: 'ghl_contact_id' });
        }
      }

      // Appointments -> bookings
      if (event?.startsWith('appointment.')) {
        const appt = data?.appointment || data;
        if (appt?.id && appt?.contactId) {
          // Find contact by ghl_contact_id
          const { data: c } = await supabase.from('contacts').select('id').eq('trainer_id', user.id).eq('ghl_contact_id', String(appt.contactId)).single();
          if (c?.id) {
            await supabase.from('bookings').upsert({
              trainer_id: user.id,
              contact_id: c.id,
              ghl_appointment_id: String(appt.id),
              scheduled_at: new Date(appt.startTime || appt.time || Date.now()).toISOString(),
              status: (appt.status ?? 'scheduled'),
              session_type: appt.title ?? 'Session',
            }, { onConflict: 'ghl_appointment_id' });

            // Trigger AI draft generation for new appointment
            if (event === 'appointment.created') {
              console.log('[appointment.created] Triggering AI draft generation...');
              
              try {
                const { error: draftErr } = await supabase.functions.invoke('agent-drafting', {
                  body: {
                    action: 'generateFromAppointment',
                    contactId: c.id,
                    appointmentId: appt.id,
                    context: {
                      firstName: appt.contact?.firstName || appt.contact?.name?.split(' ')[0] || 'there',
                      sessionType: appt.title || 'training session',
                      scheduledAt: new Date(appt.startTime).toLocaleString('en-US', { 
                        dateStyle: 'short', 
                        timeStyle: 'short' 
                      })
                    }
                  }
                });

                if (draftErr) {
                  console.error('[appointment.created] Draft generation failed:', draftErr);
                } else {
                  console.log('[appointment.created] AI draft generation triggered successfully');
                }
              } catch (draftError) {
                console.error('[appointment.created] Error triggering draft generation:', draftError);
              }
            }
          }
        }
      }

      // Conversations -> message status mapping
      if (event === 'conversation.message_outbound' && data?.messageId) {
        await supabase.from('messages').update({ status: 'sent', ghl_message_id: String(data.messageId), ghl_status: 'sent' }).eq('trainer_id', user.id).eq('ghl_message_id', String(data.messageId));
      }
      if (event === 'conversation.message_delivered' && data?.messageId) {
        await supabase.from('messages').update({ ghl_delivered_at: new Date().toISOString(), status: 'delivered' }).eq('trainer_id', user.id).eq('ghl_message_id', String(data.messageId));
      }
      if (event === 'conversation.message_read' && data?.messageId) {
        await supabase.from('messages').update({ ghl_read_at: new Date().toISOString(), status: 'read' }).eq('trainer_id', user.id).eq('ghl_message_id', String(data.messageId));
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.error(JSON.stringify({
      function: 'ghl-integration',
      errorId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }));
    
    return new Response(
      JSON.stringify({ 
        error: 'An internal error occurred. Please contact support if the issue persists.',
        errorId 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
