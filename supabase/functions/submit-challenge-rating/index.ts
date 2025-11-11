import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders, jsonResponse, errorResponse, optionsResponse } from "../_shared/responses.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return optionsResponse();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();

    // Zod validation schema
    const submitRatingSchema = z.object({
      trainerId: z.string().uuid().optional(),
      trainerName: z.string().trim().min(1, "Trainer name required").max(100, "Trainer name too long"),
      trainerGym: z.string().max(200).optional(),
      trainerCity: z.string().max(100).optional(),
      trainerState: z.string().max(50).optional(),
      trainerSlug: z.string().max(100).optional(),
      raterName: z.string().trim().min(1, "Your name required").max(100, "Name too long"),
      raterEmail: z.string().email("Invalid email format").max(255, "Email too long"),
      raterPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone format").optional().or(z.literal("")),
      verificationMethod: z.enum(["email", "sms"], { errorMap: () => ({ message: "Must be email or sms" }) }),
      ratingExpertise: z.number().int().min(1).max(5, "Rating must be 1-5"),
      ratingCommunication: z.number().int().min(1).max(5, "Rating must be 1-5"),
      ratingMotivation: z.number().int().min(1).max(5, "Rating must be 1-5"),
      ratingResults: z.number().int().min(1).max(5, "Rating must be 1-5"),
      ratingValue: z.number().int().min(1).max(5, "Rating must be 1-5"),
      reviewText: z.string().max(1000, "Review too long (max 1000 chars)").optional(),
      domain: z.string().max(255, "Domain too long"),
    });

    const validation = submitRatingSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      console.warn("Validation error:", firstError);
      return errorResponse(`Validation failed: ${firstError.message}`, 400);
    }

    const {
      trainerId,
      trainerName,
      trainerGym,
      trainerCity,
      trainerState,
      trainerSlug,
      raterName,
      raterEmail,
      raterPhone,
      verificationMethod,
      ratingExpertise,
      ratingCommunication,
      ratingMotivation,
      ratingResults,
      ratingValue,
      reviewText,
      domain,
    } = validation.data;

    const skipVerification = body.skipVerification === true;

    // Get IP and device fingerprint
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const deviceFingerprint = req.headers.get("user-agent") || "unknown";

    // Rate limiting: Check IP-based rate limit (5 submissions per hour)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: ipRateCount } = await supabase
      .from("challenge_ratings")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", oneHourAgo);

    if (ipRateCount && ipRateCount >= 5) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return errorResponse("Too many submissions. Please try again later.", 429);
    }

    // Check for duplicate submissions (anti-fraud)
    const { data: existingRatings } = await supabase
      .from("challenge_ratings")
      .select("id")
      .eq("trainer_name", trainerName)
      .eq("device_fingerprint", deviceFingerprint)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (existingRatings && existingRatings.length > 0) {
      // Log fraud check
      await supabase.from("challenge_fraud_checks").insert({
        rating_id: existingRatings[0].id,
        check_type: "duplicate_device_24h",
        notes: `Attempted duplicate from device: ${deviceFingerprint}`,
      });

      return errorResponse("You've already rated this trainer recently", 429);
    }

    // Calculate overall rating
    const ratingOverall = (
      (ratingExpertise + ratingCommunication + ratingMotivation + ratingResults + ratingValue) / 5
    ).toFixed(2);

    // Insert rating
    const { data: rating, error: ratingError } = await supabase
      .from("challenge_ratings")
      .insert({
        trainer_id: trainerId,
        trainer_name: trainerName,
        trainer_gym: trainerGym,
        trainer_city: trainerCity,
        trainer_state: trainerState,
        trainer_slug: trainerSlug,
        rater_name: raterName,
        rater_email: raterEmail,
        rater_phone: raterPhone,
        verification_method: verificationMethod,
        verification_code: skipVerification ? null : Math.floor(100000 + Math.random() * 900000).toString(),
        verification_status: skipVerification ? "verified" : "pending",
        rating_expertise: ratingExpertise,
        rating_communication: ratingCommunication,
        rating_motivation: ratingMotivation,
        rating_results: ratingResults,
        rating_value: ratingValue,
        rating_overall: ratingOverall,
        review_text: reviewText,
        device_fingerprint: deviceFingerprint,
        ip_address: ip,
      })
      .select()
      .single();

    if (ratingError) {
      console.error("Rating insert error:", ratingError);
      return errorResponse("Failed to submit rating", 500);
    }

    // Refresh leaderboard if verified
    if (skipVerification) {
      const { error: refreshError } = await supabase.rpc("refresh_challenge_leaderboard");
      if (refreshError) {
        console.error("Leaderboard refresh error:", refreshError);
        // Don't fail the request if refresh fails
      }
    }

    return jsonResponse({
      success: true,
      ratingId: rating.id,
      message: skipVerification ? "Rating submitted successfully" : "Verification code sent",
    });
  } catch (error: any) {
    console.error("Submit rating error:", error);
    return errorResponse(error.message, 500);
  }
});
