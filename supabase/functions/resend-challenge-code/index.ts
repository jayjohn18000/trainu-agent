import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { Resend } from "https://esm.sh/resend@4.0.1";
import { corsHeaders, jsonResponse, errorResponse, optionsResponse } from "../_shared/responses.ts";
import { createLogger, getRequestCorrelationId } from "../_shared/logger.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return optionsResponse();

  const logger = createLogger("resend-challenge-code", getRequestCorrelationId(req));

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const body = await req.json();
    
    const schema = z.object({
      ratingId: z.string().uuid("Invalid rating ID"),
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      logger.warn("Validation error", { error: firstError });
      return errorResponse(`Validation failed: ${firstError.message}`, 400);
    }

    const { ratingId } = validation.data;

    // Get the existing rating
    const { data: rating, error: fetchError } = await supabase
      .from("challenge_ratings")
      .select("*")
      .eq("id", ratingId)
      .eq("verification_status", "pending")
      .single();

    if (fetchError || !rating) {
      logger.warn("Rating not found or already verified", { ratingId });
      return errorResponse("Rating not found or already verified", 404);
    }

    // Check rate limit: max 5 resend attempts per rating
    const { count: resendCount } = await supabase
      .from("challenge_ratings")
      .select("id", { count: "exact", head: true })
      .eq("id", ratingId)
      .gte("updated_at", new Date(Date.now() - 3600000).toISOString()); // last hour

    if (resendCount && resendCount >= 5) {
      logger.warn("Resend rate limit exceeded", { ratingId });
      return errorResponse("Too many resend attempts. Please try again later.", 429);
    }

    // Generate new 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update rating with new code
    const { error: updateError } = await supabase
      .from("challenge_ratings")
      .update({
        verification_code: verificationCode,
        code_expires_at: codeExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", ratingId);

    if (updateError) {
      logger.error("Failed to update rating", { error: updateError });
      return errorResponse("Failed to resend code", 500);
    }

    logger.info("New verification code generated", { ratingId });

    // Send verification email
    try {
      await resend.emails.send({
        from: "TrainU Challenge <hello@notifications.trainu.us>",
        to: [rating.rater_email],
        subject: `Verify Your Trainer Rating - Code: ${verificationCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000;">Verify Your Rating</h1>
            <p>Hi ${rating.rater_name},</p>
            <p>Thanks for rating <strong>${rating.trainer_name}</strong> from ${rating.trainer_city}, ${rating.trainer_state}!</p>
            <p>Your verification code is:</p>
            <h2 style="font-size: 48px; letter-spacing: 8px; color: #000; text-align: center; background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">${verificationCode}</h2>
            <p style="color: #666; font-size: 14px;">This code expires in 15 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">TrainU Challenge - Find the Best Trainers</p>
          </div>
        `,
      });
      
      logger.info("Verification email resent successfully", { ratingId });
    } catch (emailError: any) {
      logger.error("Failed to resend verification email", { error: emailError.message });
      return errorResponse("Failed to send email. Please try again.", 500);
    }

    return jsonResponse({
      success: true,
      message: "New verification code sent to your email",
    });
  } catch (error: any) {
    logger.error("Resend code error", { error: error.message });
    return errorResponse(error.message, 500);
  }
});
