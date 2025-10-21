import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const mockQueue = [
  {
    id: "q1",
    clientId: "c1",
    clientName: "Emily K",
    preview: "Hey Emily…",
    confidence: 0.86,
    status: "review",
    why: ["Missed 2 sessions", "5K goal"],
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q2",
    clientId: "c2",
    clientName: "Jordan M",
    preview: "Congrats on 10-workout streak…",
    confidence: 0.92,
    status: "autosend",
    why: ["Streak 10"],
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const isAgentMock = Deno.env.get("AGENT_MOCK") === "1";

    if (req.method === "GET") {
      if (isAgentMock) {
        return new Response(JSON.stringify(mockQueue), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // TODO: Get real queue from database
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const { action, id, payload } = await req.json();

      if (isAgentMock) {
        // Handle mock actions
        if (action === "approve") {
          return new Response(
            JSON.stringify({ success: true, id, action: "approved" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        if (action === "undo") {
          return new Response(
            JSON.stringify({ success: true, id, action: "undone" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        if (action === "edit") {
          return new Response(
            JSON.stringify({ success: true, id, action: "edited", payload }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      // TODO: Implement real queue actions
      return new Response(
        JSON.stringify({ success: true, id, action }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in agent-queue:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
