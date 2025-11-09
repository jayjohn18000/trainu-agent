import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type DFYRequestRow = Database['public']['Tables']['dfy_requests']['Row'];
type GHLConfigRow = Database['public']['Tables']['ghl_config']['Row'];

export interface DFYRequestWithTrainer extends DFYRequestRow {
  trainer_email?: string;
  trainer_name?: string;
}

export async function getAllDFYRequests(): Promise<DFYRequestWithTrainer[]> {
  const { data, error } = await supabase
    .from('dfy_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateDFYRequestStatus(
  requestId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  adminNotes?: string
): Promise<void> {
  const { error } = await supabase
    .from('dfy_requests')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId);

  if (error) throw error;

  // If updating to completed, also update ghl_config
  if (status === 'completed') {
    const request = await supabase
      .from('dfy_requests')
      .select('trainer_id')
      .eq('id', requestId)
      .single();

    if (request.data) {
      await updateGHLConfigStatus(
        request.data.trainer_id,
        'completed',
        adminNotes
      );
    }
  }
}

export async function updateGHLConfigStatus(
  trainerId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  adminNotes?: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updateData: any = {
    provisioning_status: status,
    updated_at: new Date().toISOString(),
  };

  if (adminNotes) {
    updateData.admin_notes = adminNotes;
  }

  if (status === 'completed') {
    updateData.provisioned_at = new Date().toISOString();
    updateData.provisioned_by = user.id;
  }

  const { error } = await supabase
    .from('ghl_config')
    .upsert({
      trainer_id: trainerId,
      ...updateData,
    });

  if (error) throw error;
}

export async function getGHLConfigForTrainer(trainerId: string): Promise<GHLConfigRow | null> {
  const { data, error } = await supabase
    .from('ghl_config')
    .select('*')
    .eq('trainer_id', trainerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function checkAdminRole(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  if (error) return false;
  return !!data;
}

export async function triggerProvisioning(
  dfyRequestId?: string,
  trainerId?: string
): Promise<{ success: boolean; locationId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('ghl-provisioning', {
      body: { dfyRequestId, trainerId },
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Provisioning failed:', error);
    return {
      success: false,
      error: error.message || 'Provisioning failed',
    };
  }
}
