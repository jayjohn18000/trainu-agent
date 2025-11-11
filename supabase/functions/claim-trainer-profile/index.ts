import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse, errorResponse, optionsResponse } from '../_shared/responses.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    const {
      trainerKey,
      trainerName,
      trainerCity,
      trainerState,
      email,
      verificationMethod,
      proofMediaUrls = [],
      proofDescription,
      ipAddress,
      deviceFingerprint,
    } = body;

    // Validation
    if (!trainerKey || !trainerName || !email || !verificationMethod) {
      return errorResponse('Missing required fields', 400);
    }

    if (!['email', 'ghl_oauth', 'social_proof'].includes(verificationMethod)) {
      return errorResponse('Invalid verification method', 400);
    }

    if (verificationMethod === 'social_proof' && proofMediaUrls.length === 0) {
      return errorResponse('Social proof requires at least one media file', 400);
    }

    // Check for duplicate claims within 24 hours
    const { data: duplicateCheck } = await supabase.rpc('check_duplicate_claim', {
      p_trainer_key: trainerKey,
      p_email: email,
    });

    if (duplicateCheck) {
      return errorResponse('You have already submitted a claim for this trainer in the last 24 hours', 429);
    }

    // Check if trainer is already verified
    const { data: leaderboardEntry } = await supabase
      .from('challenge_leaderboard')
      .select('trainer_id')
      .eq('trainer_key', trainerKey)
      .single();

    if (leaderboardEntry?.trainer_id) {
      return errorResponse('This trainer profile is already verified and claimed', 409);
    }

    // For GHL OAuth method, check if authenticated and link trainer_id
    let trainerId = null;
    if (verificationMethod === 'ghl_oauth') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return errorResponse('GHL OAuth verification requires authentication', 401);
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return errorResponse('Invalid authentication token', 401);
      }

      trainerId = user.id;
    }

    // Create verification request
    const { data: verificationRequest, error: createError } = await supabase
      .from('trainer_verification_requests')
      .insert({
        trainer_id: trainerId,
        challenge_trainer_key: trainerKey,
        trainer_name: trainerName,
        trainer_city: trainerCity,
        trainer_state: trainerState,
        claimed_by_email: email,
        verification_method: verificationMethod,
        proof_media_urls: proofMediaUrls,
        proof_description: proofDescription,
        ip_address: ipAddress,
        device_fingerprint: deviceFingerprint,
        status: verificationMethod === 'ghl_oauth' ? 'approved' : 'pending',
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating verification request:', createError);
      return errorResponse('Failed to create verification request', 500);
    }

    // If GHL OAuth, auto-approve and link trainer_id to ratings
    if (verificationMethod === 'ghl_oauth' && trainerId) {
      await supabase
        .from('challenge_ratings')
        .update({ trainer_id: trainerId })
        .eq('trainer_name', trainerName)
        .eq('trainer_city', trainerCity)
        .eq('trainer_state', trainerState);

      // Refresh leaderboard
      await supabase.rpc('refresh_challenge_leaderboard');

      return jsonResponse({
        success: true,
        message: 'Profile verified instantly via GHL OAuth',
        verificationRequest,
        status: 'approved',
      });
    }

    // Send confirmation email (TODO: integrate with Resend)
    console.log(`Verification request submitted for ${trainerName} by ${email}`);

    return jsonResponse({
      success: true,
      message: 'Verification request submitted successfully. Admin review pending.',
      verificationRequest,
      status: 'pending',
    });

  } catch (error) {
    console.error('Claim trainer profile error:', error);
    return errorResponse('Internal server error', 500);
  }
});
