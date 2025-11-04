import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple sentiment analysis (in production, use real NLP service)
function analyzeSentiment(text: string): { score: number; label: string } {
  const positiveWords = ['great', 'awesome', 'excellent', 'happy', 'good', 'love', 'best', 'amazing'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'poor', 'disappointing'];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.1;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.1;
  });
  
  score = Math.max(-1, Math.min(1, score));
  
  let label = 'neutral';
  if (score > 0.3) label = 'positive';
  if (score < -0.3) label = 'negative';
  
  return { score, label };
}

// Intent recognition
function detectIntent(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('book') || lowerText.includes('schedule') || lowerText.includes('appointment')) {
    return 'booking';
  }
  if (lowerText.includes('cancel') || lowerText.includes('reschedule')) {
    return 'cancellation';
  }
  if (lowerText.includes('question') || lowerText.includes('help') || lowerText.includes('?')) {
    return 'question';
  }
  if (lowerText.includes('feedback') || lowerText.includes('complaint')) {
    return 'feedback';
  }
  
  return 'general';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const { action, ...params } = await req.json();

    // NLP Analysis
    if (action === "analyze_text") {
      const { organization_id, text, analysis_type = "full", contact_id } = params;
      const startTime = Date.now();
      
      const sentiment = analyzeSentiment(text);
      const intent = detectIntent(text);
      
      const { data, error } = await supabase
        .from("nlp_analyses")
        .insert({
          organization_id,
          trainer_id: user.id,
          contact_id,
          input_text: text,
          analysis_type,
          sentiment_score: sentiment.score,
          sentiment_label: sentiment.label,
          detected_intent: intent,
          confidence_score: 0.85,
          processing_time_ms: Date.now() - startTime
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          analysis: data,
          sentiment,
          intent
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Smart Content Generation
    if (action === "generate_content") {
      const { organization_id, content_type, prompt, tone = "friendly", personalization_data = {} } = params;
      
      // In production, integrate with Lovable AI or OpenAI
      let generatedContent = "";
      
      if (content_type === "message") {
        const name = personalization_data.first_name || "there";
        generatedContent = `Hi ${name}! ${prompt} Let me know if you have any questions!`;
      } else if (content_type === "motivation") {
        generatedContent = `Keep up the great work! ${prompt} You're making amazing progress! 💪`;
      } else if (content_type === "coaching") {
        generatedContent = `Great question! ${prompt} Remember, consistency is key to reaching your goals!`;
      } else {
        generatedContent = prompt;
      }

      const { data, error } = await supabase
        .from("smart_content")
        .insert({
          organization_id,
          trainer_id: user.id,
          content_type,
          prompt,
          generated_content: generatedContent,
          tone,
          personalization_data,
          quality_score: 0.88
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, content: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Conversational AI
    if (action === "start_conversation") {
      const { organization_id, contact_id } = params;
      
      const sessionId = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from("conversation_ai")
        .insert({
          organization_id,
          trainer_id: user.id,
          contact_id,
          session_id: sessionId,
          message_history: [],
          context: {},
          conversation_state: "active"
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, session: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "send_conversation_message") {
      const { session_id, message, role = "user" } = params;
      
      const { data: conversation, error: fetchError } = await supabase
        .from("conversation_ai")
        .select("*")
        .eq("session_id", session_id)
        .single();

      if (fetchError) throw fetchError;

      const messageHistory = conversation.message_history || [];
      messageHistory.push({
        role,
        content: message,
        timestamp: new Date().toISOString()
      });

      // Generate AI response (in production, use real AI)
      const aiResponse = `I understand you're saying: "${message}". How can I help you further?`;
      
      messageHistory.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from("conversation_ai")
        .update({
          message_history: messageHistory,
          current_intent: detectIntent(message),
          last_message_at: new Date().toISOString()
        })
        .eq("session_id", session_id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, conversation: data, response: aiResponse }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // AI Insights
    if (action === "generate_insights") {
      const { organization_id, insight_type = "client_behavior" } = params;
      
      // In production, analyze real data
      const insights = [
        {
          organization_id,
          trainer_id: user.id,
          insight_type,
          title: "Engagement Pattern Detected",
          description: "Clients are most responsive between 9 AM - 11 AM on weekdays",
          confidence_score: 0.92,
          priority: "high",
          actionable_recommendations: [
            "Schedule important messages during peak hours",
            "Avoid sending messages after 8 PM"
          ],
          data_source: { analysis_period: "last_30_days", sample_size: 150 }
        }
      ];

      const { data, error } = await supabase
        .from("ai_insights")
        .insert(insights)
        .select();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, insights: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list_insights") {
      const { organization_id, status = "new" } = params;
      
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("organization_id", organization_id)
        .eq("status", status)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, insights: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update_insight_status") {
      const { insight_id, status } = params;
      
      const { data, error } = await supabase
        .from("ai_insights")
        .update({ status })
        .eq("id", insight_id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, insight: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in advanced-ai-nlp:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        function: "advanced-ai-nlp"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});