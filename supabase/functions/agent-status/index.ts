import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const isAgentMock = Deno.env.get("AGENT_MOCK") === "1";

    if (isAgentMock) {
      // Return mock data
      return new Response(
        JSON.stringify({
          state: "active",
          currentAction: "Monitoring 12 clients",
          lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Implement real agent status from database
    return new Response(
      JSON.stringify({
        state: "active",
        currentAction: "Ready",
        lastUpdate: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in agent-status:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
