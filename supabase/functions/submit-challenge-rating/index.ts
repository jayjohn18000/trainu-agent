import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { Resend } from "https://esm.sh/resend@4.0.1";
import { corsHeaders, jsonResponse, errorResponse, optionsResponse } from "../_shared/responses.ts";
import { createLogger, getRequestCorrelationId } from "../_shared/logger.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return optionsResponse();

  const logger = createLogger("submit-challenge-rating", getRequestCorrelationId(req));

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const body = await req.json();
    logger.info("Received rating submission", { body });

    // Zod validation schema - city and state required for custom trainers
    const submitRatingSchema = z.object({
      trainerId: z.string().uuid().optional(),
      trainerName: z.string().trim().min(1, "Trainer name required").max(100, "Trainer name too long"),
      trainerGym: z.string().max(200).optional(),
      trainerCity: z.string().trim().min(1, "City required").max(100, "City too long"),
      trainerState: z.string().trim().min(1, "State required").max(50, "State too long"),
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
      logger.warn("Validation error", { error: firstError });
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
      logger.warn("Rate limit exceeded", { ip });
      return errorResponse("Too many submissions. Please try again later.", 429);
    }

    // Check for duplicate submissions (anti-fraud) - include location to allow same name in different cities
    const { data: existingRatings } = await supabase
      .from("challenge_ratings")
      .select("id")
      .eq("trainer_name", trainerName)
      .eq("trainer_city", trainerCity)
      .eq("trainer_state", trainerState)
      .eq("device_fingerprint", deviceFingerprint)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (existingRatings && existingRatings.length > 0) {
      logger.warn("Duplicate rating attempt", { 
        trainer: trainerName, 
        location: `${trainerCity}, ${trainerState}`,
        deviceFingerprint 
      });
      
      // Log fraud check
      await supabase.from("challenge_fraud_checks").insert({
        rating_id: existingRatings[0].id,
        check_type: "duplicate_device_24h",
        notes: `Attempted duplicate from device: ${deviceFingerprint} for ${trainerName} in ${trainerCity}, ${trainerState}`,
      });

      return errorResponse(`You've already rated ${trainerName} from ${trainerCity}, ${trainerState} in the last 24 hours`, 429);
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Insert rating (rating_overall is auto-calculated by database)
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
        verification_code: verificationCode,
        verification_status: "pending",
        code_expires_at: codeExpiresAt.toISOString(),
        rating_expertise: ratingExpertise,
        rating_communication: ratingCommunication,
        rating_motivation: ratingMotivation,
        rating_results: ratingResults,
        rating_value: ratingValue,
        review_text: reviewText,
        device_fingerprint: deviceFingerprint,
        ip_address: ip,
      })
      .select()
      .single();

    if (ratingError) {
      logger.error("Rating insert error", { error: ratingError });
      return errorResponse("Failed to submit rating", 500);
    }

    logger.info("Rating created", { ratingId: rating.id, status: "pending" });

    // Send verification email
    try {
      const emailResult = await resend.emails.send({
        from: "TrainU Challenge <hello@trainu.us>",
        to: [raterEmail],
        subject: `Verify Your Trainer Rating - Code: ${verificationCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000;">Verify Your Rating</h1>
            <p>Hi ${raterName},</p>
            <p>Thanks for rating <strong>${trainerName}</strong> from ${trainerCity}, ${trainerState}!</p>
            <p>Your verification code is:</p>
            <h2 style="font-size: 48px; letter-spacing: 8px; color: #000; text-align: center; background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">${verificationCode}</h2>
            <p style="color: #666; font-size: 14px;">This code expires in 15 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">TrainU Challenge - Find the Best Trainers</p>
          </div>
        `,
      });
      
      logger.info("Verification email sent successfully");
    } catch (emailError: any) {
      logger.error("Failed to send verification email", { error: emailError.message });
      // Don't fail the request - admin can manually verify if needed
    }

    return jsonResponse({
      success: true,
      ratingId: rating.id,
      message: "Verification code sent to your email",
    });
  } catch (error: any) {
    logger.error("Submit rating error", { error: error.message });
    return errorResponse(error.message, 500);
  }
});
