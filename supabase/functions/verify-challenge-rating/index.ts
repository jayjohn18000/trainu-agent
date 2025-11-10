import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse, optionsResponse } from "../_shared/responses.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return optionsResponse();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { ratingId, verificationCode } = await req.json();

    if (!ratingId || !verificationCode) {
      return errorResponse("Missing required fields", 400);
    }

    // Get rating
    const { data: rating, error: fetchError } = await supabase
      .from("challenge_ratings")
      .select("*")
      .eq("id", ratingId)
      .single();

    if (fetchError || !rating) {
      return errorResponse("Rating not found", 404);
    }

    // Check if already verified
    if (rating.verification_status === "verified") {
      return errorResponse("Rating already verified", 400);
    }

    // Check if code matches (case insensitive)
    if (rating.verification_code.toLowerCase() !== verificationCode.toLowerCase()) {
      return errorResponse("Invalid verification code", 400);
    }

    // Check if code expired (15 minutes)
    const createdAt = new Date(rating.created_at).getTime();
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;

    if (now - createdAt > fifteenMinutes) {
      return errorResponse("Verification code expired", 400);
    }

    // Update rating to verified
    const { error: updateError } = await supabase
      .from("challenge_ratings")
      .update({
        verification_status: "verified",
        verification_completed_at: new Date().toISOString(),
      })
      .eq("id", ratingId);

    if (updateError) {
      console.error("Update error:", updateError);
      return errorResponse("Failed to verify rating", 500);
    }

    // Refresh leaderboard materialized view
    const { error: refreshError } = await supabase.rpc("refresh_challenge_leaderboard");
    
    if (refreshError) {
      console.error("Leaderboard refresh error:", refreshError);
      // Don't fail the request if refresh fails
    }

    // Get updated stats for trainer
    const { data: leaderboardEntry } = await supabase
      .from("challenge_leaderboard")
      .select("*")
      .eq("trainer_name", rating.trainer_name)
      .single();

    return jsonResponse({
      success: true,
      message: "Rating verified successfully",
      trainerStats: leaderboardEntry || {
        trainer_name: rating.trainer_name,
        rank: null,
        average_rating: rating.rating_overall,
        total_ratings: 1,
      },
    });
  } catch (error: any) {
    console.error("Verify rating error:", error);
    return errorResponse(error.message, 500);
  }
});
