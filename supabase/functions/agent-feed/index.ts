import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const mockFeed = [
  {
    ts: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    action: "drafted",
    client: "Emily K",
    status: "review",
    why: "Missed 2 sessions",
  },
  {
    ts: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    action: "sent",
    client: "Jordan M",
    status: "success",
    why: "Streak 10",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const isAgentMock = Deno.env.get("AGENT_MOCK") === "1";

    if (isAgentMock) {
      return new Response(JSON.stringify(mockFeed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: Get real feed from database
    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in agent-feed:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
