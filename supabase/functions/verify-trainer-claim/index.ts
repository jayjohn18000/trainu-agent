import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders, jsonResponse, errorResponse, optionsResponse } from '../_shared/responses.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Authenticate admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('Authentication required', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return errorResponse('Invalid authentication', 401);
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      return errorResponse('Admin access required', 403);
    }

    const body = await req.json();
    const { requestId, action, rejectionReason } = body;

    if (!requestId || !action) {
      return errorResponse('Missing required fields', 400);
    }

    if (!['approve', 'reject'].includes(action)) {
      return errorResponse('Invalid action', 400);
    }

    if (action === 'reject' && !rejectionReason) {
      return errorResponse('Rejection reason required', 400);
    }

    // Fetch verification request
    const { data: request, error: fetchError } = await supabase
      .from('trainer_verification_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return errorResponse('Verification request not found', 404);
    }

    if (request.status !== 'pending') {
      return errorResponse('Request has already been reviewed', 409);
    }

    // Update verification request
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const { error: updateError } = await supabase
      .from('trainer_verification_requests')
      .update({
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: action === 'reject' ? rejectionReason : null,
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating verification request:', updateError);
      return errorResponse('Failed to update verification request', 500);
    }

    // If approved, link trainer_id to challenge_ratings
    if (action === 'approve' && request.trainer_id) {
      await supabase
        .from('challenge_ratings')
        .update({ trainer_id: request.trainer_id })
        .eq('trainer_name', request.trainer_name)
        .is('trainer_id', null);

      // Refresh leaderboard
      await supabase.rpc('refresh_challenge_leaderboard');
    }

    // Send notification email (TODO: integrate with Resend)
    console.log(`Verification request ${requestId} ${action}ed by admin ${user.id}`);

    return jsonResponse({
      success: true,
      message: `Verification request ${action}ed successfully`,
      requestId,
      status: newStatus,
    });

  } catch (error) {
    console.error('Verify trainer claim error:', error);
    return errorResponse('Internal server error', 500);
  }
});
