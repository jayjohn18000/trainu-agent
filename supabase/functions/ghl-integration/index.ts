import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { action, contactData, messageData, queueItemId } = await req.json();

    const GHL_API_BASE = Deno.env.get('GHL_API_BASE');
    const GHL_ACCESS_TOKEN = Deno.env.get('GHL_ACCESS_TOKEN');

    // Get trainer's GHL config
    const { data: ghlConfig } = await supabase
      .from('ghl_config')
      .select('*')
      .eq('trainer_id', user.id)
      .single();

    // DEMO MODE: If creds or config are missing, return mock success
    if (action === 'send_message' && (!GHL_API_BASE || !GHL_ACCESS_TOKEN || !ghlConfig)) {
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
      if (!ghlConfig) {
        throw new Error('GHL not configured for this trainer');
      }
      if (!GHL_API_BASE || !GHL_ACCESS_TOKEN) {
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
          'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`,
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
            'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`,
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
            'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`,
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
    console.error('GHL Integration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
