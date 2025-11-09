import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type DFYRequestRow = Database['public']['Tables']['dfy_requests']['Row'];
type GHLConfigRow = Database['public']['Tables']['ghl_config']['Row'];

export interface DFYRequest extends DFYRequestRow {
  // Additional computed properties if needed
}

export interface GHLConfig extends GHLConfigRow {
  // Additional computed properties if needed
}

export async function createDFYRequest(data: {
  business_name: string;
  phone: string;
  email: string;
  current_ghl_account: boolean;
  additional_notes?: string;
}): Promise<DFYRequest> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: result, error } = await supabase
    .from('dfy_requests')
    .insert({
      trainer_id: user.id,
      business_name: data.business_name,
      phone: data.phone,
      email: data.email,
      current_ghl_account: data.current_ghl_account ? 'true' : 'false',
      additional_notes: data.additional_notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function getDFYRequest(): Promise<DFYRequest | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('dfy_requests')
    .select('*')
    .eq('trainer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getGHLConfig(): Promise<GHLConfig | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ghl_config')
    .select('*')
    .eq('trainer_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function importContacts(contacts: Array<{
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('contacts')
    .insert(
      contacts.map(contact => ({
        trainer_id: user.id,
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email || null,
        phone: contact.phone || null,
      }))
    );

  if (error) throw error;
}
