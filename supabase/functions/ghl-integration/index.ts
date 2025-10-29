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

    if (!GHL_API_BASE || !GHL_ACCESS_TOKEN) {
      throw new Error('GHL credentials not configured');
    }

    // Get trainer's GHL config
    const { data: ghlConfig } = await supabase
      .from('ghl_config')
      .select('*')
      .eq('trainer_id', user.id)
      .single();

    if (!ghlConfig) {
      throw new Error('GHL not configured for this trainer');
    }

    if (action === 'send_message') {
      console.log('Sending message via GHL:', { contactData, messageData });

      // Step 1: Find or create contact
      const contactPayload = {
        locationId: ghlConfig.location_id,
        firstName: contactData.firstName || '',
        lastName: contactData.lastName || '',
        email: contactData.email || '',
        phone: contactData.phone || '',
      };

      const contactResponse = await fetch(`${GHL_API_BASE}/contacts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify(contactPayload),
      });

      if (!contactResponse.ok) {
        const errorText = await contactResponse.text();
        console.error('GHL contact creation failed:', errorText);
        throw new Error(`Failed to create/find contact: ${errorText}`);
      }

      const contact = await contactResponse.json();
      console.log('Contact created/found:', contact.contact?.id);

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
      // Handle GHL webhooks (replies, delivery status, etc.)
      const { event, data } = await req.json();
      
      console.log('GHL Webhook received:', event, data);

      // Update activity feed based on webhook event
      if (event === 'message.delivered' && data.messageId) {
        await supabase
          .from('activity_feed')
          .update({
            ghl_status: 'delivered',
            ghl_delivered_at: new Date().toISOString(),
          })
          .eq('ghl_message_id', data.messageId);
      }

      if (event === 'message.read' && data.messageId) {
        await supabase
          .from('activity_feed')
          .update({
            ghl_read_at: new Date().toISOString(),
          })
          .eq('ghl_message_id', data.messageId);
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
