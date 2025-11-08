import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/responses.ts";
import { handleError, handleValidationError } from "../_shared/error-handler.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { locationId } = await req.json();

    if (!locationId || typeof locationId !== "string") {
      return handleValidationError("Location ID is required", "locationId");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ghlApiBase = Deno.env.get("GHL_API_BASE") || "https://rest.gohighlevel.com/v1";
    const ghlAccessToken = Deno.env.get("GHL_ACCESS_TOKEN");

    if (!ghlAccessToken) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "GHL integration not configured. Please contact support." 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ valid: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate location exists by fetching location details
    const ghlResponse = await fetch(`${ghlApiBase}/locations/${locationId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ghlAccessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!ghlResponse.ok) {
      if (ghlResponse.status === 404) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: "Location ID not found. Please check and try again." 
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      console.error("GHL API error:", ghlResponse.status, await ghlResponse.text());
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Unable to verify Location ID. Please try again." 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const locationData = await ghlResponse.json();

    // Store GHL config in trainer profile
    const { error: updateError } = await supabase
      .from("trainer_profiles")
      .update({ 
        ghl_location_id: locationId,
        ghl_connected_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to save GHL config:", updateError);
      return new Response(
        JSON.stringify({ 
          valid: true, 
          locationName: locationData.name,
          warning: "Connected but failed to save settings"
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        valid: true, 
        locationName: locationData.name,
        locationId 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return handleError("ghl-validate", error);
  }
});
