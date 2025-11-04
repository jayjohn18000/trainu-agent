import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NUDGE_TEMPLATES = {
  'check_in': {
    content: "Hey {first_name}! 👋 Just checking in - how have you been feeling about your fitness journey lately? Any challenges I can help you work through?",
    personalization_fields: ['first_name'],
    followup_delay_hours: 72
  },
  'booking_reminder': {
    content: "Hi {first_name}! 💪 I noticed it's been a while since we last trained together. Ready to get back into your routine? I have some availability this week if you'd like to schedule!",
    personalization_fields: ['first_name'],
    followup_delay_hours: 96
  },
  'motivation': {
    content: "Remember {first_name}, every small step counts! 🌟 You've made great progress before - let's discuss what would help you feel motivated again. What's one thing you're proud of from your fitness journey?",
    personalization_fields: ['first_name'],
    followup_delay_hours: 120
  }
};

function personalizeContent(template: string, contact: any): string {
  return template
    .replace(/{first_name}/g, contact.first_name || 'there')
    .replace(/{last_name}/g, contact.last_name || '');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { action = 'process_daily_nudges' } = await req.json().catch(() => ({}));

    if (action === 'process_daily_nudges') {
      const { data: activeTrainers, error: trainersError } = await supabase
        .from('nudge_settings')
        .select('*')
        .eq('enabled', true);

      if (trainersError) {
        throw new Error(`Failed to fetch active trainers: ${trainersError.message}`);
      }

      let totalCampaignsCreated = 0;

      for (const trainerSettings of activeTrainers || []) {
        try {
          const { data: nudgeAnalysis, error: analysisError } = await supabase.functions.invoke(
            'smart-nudge-detection',
            {
              body: { action: 'analyze_all' }
            }
          );

          if (analysisError) {
            console.error(`Error analyzing nudges for trainer ${trainerSettings.trainer_id}:`, analysisError);
            continue;
          }

          const candidates = nudgeAnalysis?.nudge_candidates || [];
          const eligibleCandidates = candidates
            .filter((candidate: any) => candidate.risk_score >= trainerSettings.min_risk_threshold)
            .sort((a: any, b: any) => b.priority_score - a.priority_score)
            .slice(0, trainerSettings.daily_limit);

          const contactIds = eligibleCandidates.map((c: any) => c.contact_id);
          const { data: contacts } = await supabase
            .from('contacts')
            .select('*')
            .in('id', contactIds);

          const contactsMap = new Map(contacts?.map(c => [c.id, c]) || []);

          for (const candidate of eligibleCandidates) {
            const contact = contactsMap.get(candidate.contact_id);
            if (!contact) continue;

            const template = NUDGE_TEMPLATES[candidate.recommended_nudge_type as keyof typeof NUDGE_TEMPLATES];
            if (!template) continue;

            const personalizedContent = personalizeContent(template.content, contact);
            const scheduledFor = new Date(Date.now() + 2 * 60 * 60 * 1000);

            await supabase
              .from('nudge_campaigns')
              .insert({
                trainer_id: trainerSettings.trainer_id,
                contact_id: candidate.contact_id,
                template_id: candidate.template_id,
                campaign_type: candidate.recommended_nudge_type,
                priority_score: candidate.priority_score,
                urgency_level: candidate.urgency_level,
                content: personalizedContent,
                scheduled_for: scheduledFor.toISOString(),
                status: 'scheduled',
                created_at: new Date().toISOString()
              });

            totalCampaignsCreated++;
          }
        } catch (error) {
          console.error(`Error processing trainer ${trainerSettings.trainer_id}:`, error);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          campaigns_created: totalCampaignsCreated,
          message: "Daily nudge processing completed"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === 'process_scheduled_campaigns') {
      const now = new Date();
      const { data: scheduledCampaigns, error: campaignsError } = await supabase
        .from('nudge_campaigns')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_for', now.toISOString())
        .limit(50);

      if (campaignsError) {
        throw new Error(`Failed to fetch scheduled campaigns: ${campaignsError.message}`);
      }

      let processedCount = 0;

      for (const campaign of scheduledCampaigns || []) {
        try {
          const { error: sendError } = await supabase.functions.invoke('client-nudge', {
            body: {
              clientId: campaign.contact_id,
              templateId: campaign.template_id,
              preview: campaign.content
            }
          });

          if (sendError) {
            await supabase
              .from('nudge_campaigns')
              .update({
                status: 'failed',
                error_message: sendError.message,
                sent_at: new Date().toISOString()
              })
              .eq('id', campaign.id);
          } else {
            await supabase
              .from('nudge_campaigns')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq('id', campaign.id);

            await supabase
              .from('client_nudge_history')
              .insert({
                trainer_id: campaign.trainer_id,
                contact_id: campaign.contact_id,
                campaign_id: campaign.id,
                template_id: campaign.template_id,
                sent_at: new Date().toISOString(),
                created_at: new Date().toISOString()
              });

            processedCount++;
          }
        } catch (error) {
          console.error(`Error sending campaign ${campaign.id}:`, error);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          campaigns_processed: processedCount,
          message: "Scheduled campaigns processed"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in automated-nudge-scheduler:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
