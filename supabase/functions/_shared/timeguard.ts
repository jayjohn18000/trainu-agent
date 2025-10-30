import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

interface QuietHoursConfig {
  quiet_hours_start: string; // HH:MM:SS
  quiet_hours_end: string;   // HH:MM:SS
  frequency_cap_daily: number;
  frequency_cap_weekly: number;
}

interface QuietHoursResult {
  allowed: boolean;
  nextAvailable?: Date;
  reason?: string;
}

interface FrequencyCapResult {
  allowed: boolean;
  limit?: string;
  remaining?: number;
  reason?: string;
}

/**
 * Check if a scheduled time falls within quiet hours
 * @param scheduledFor - The timestamp when the message should be sent
 * @param config - Quiet hours configuration
 * @returns Result indicating if sending is allowed
 */
export function checkQuietHours(
  scheduledFor: Date,
  config: QuietHoursConfig
): QuietHoursResult {
  const hour = scheduledFor.getHours();
  const minute = scheduledFor.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  // Parse quiet hours (format: "HH:MM:SS")
  const [startHour, startMin] = config.quiet_hours_start.split(':').map(Number);
  const [endHour, endMin] = config.quiet_hours_end.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Check if current time is within allowed window
  if (timeInMinutes >= startMinutes && timeInMinutes < endMinutes) {
    return { allowed: true };
  }

  // Calculate next available time (next day at start time)
  const nextAvailable = new Date(scheduledFor);
  nextAvailable.setDate(nextAvailable.getDate() + 1);
  nextAvailable.setHours(startHour, startMin, 0, 0);

  return {
    allowed: false,
    nextAvailable,
    reason: `Outside quiet hours (${config.quiet_hours_start.slice(0, 5)} - ${config.quiet_hours_end.slice(0, 5)})`,
  };
}

/**
 * Check if sending a message would exceed frequency caps
 * @param supabase - Supabase client
 * @param contactId - Contact ID
 * @param config - Frequency cap configuration
 * @returns Result indicating if sending is allowed
 */
export async function checkFrequencyCap(
  supabase: SupabaseClient,
  contactId: string,
  config: QuietHoursConfig
): Promise<FrequencyCapResult> {
  // Fetch contact to get message counts
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('messages_sent_today, messages_sent_this_week, last_message_sent_at')
    .eq('id', contactId)
    .single();

  if (error || !contact) {
    console.error('Failed to fetch contact for frequency check:', error);
    return { allowed: true }; // Fail open to avoid blocking
  }

  // Reset counters if needed
  const lastSent = contact.last_message_sent_at ? new Date(contact.last_message_sent_at) : null;
  const now = new Date();
  
  let messagesToday = contact.messages_sent_today || 0;
  let messagesThisWeek = contact.messages_sent_this_week || 0;

  // Reset daily counter if last message was not today
  if (lastSent) {
    const isToday = lastSent.toDateString() === now.toDateString();
    if (!isToday) {
      messagesToday = 0;
    }

    // Reset weekly counter if last message was more than 7 days ago
    const daysSinceLastMessage = Math.floor((now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastMessage >= 7) {
      messagesThisWeek = 0;
    }
  }

  // Check daily cap
  if (messagesToday >= config.frequency_cap_daily) {
    return {
      allowed: false,
      limit: 'daily',
      remaining: 0,
      reason: `Daily limit reached (${messagesToday}/${config.frequency_cap_daily})`,
    };
  }

  // Check weekly cap
  if (messagesThisWeek >= config.frequency_cap_weekly) {
    return {
      allowed: false,
      limit: 'weekly',
      remaining: 0,
      reason: `Weekly limit reached (${messagesThisWeek}/${config.frequency_cap_weekly})`,
    };
  }

  return {
    allowed: true,
    remaining: Math.min(
      config.frequency_cap_daily - messagesToday,
      config.frequency_cap_weekly - messagesThisWeek
    ),
  };
}

/**
 * Update contact message counters after sending
 * @param supabase - Supabase client
 * @param contactId - Contact ID
 */
export async function incrementMessageCounters(
  supabase: SupabaseClient,
  contactId: string
): Promise<void> {
  const { error } = await supabase.rpc('increment_message_counters', {
    contact_id: contactId,
  });

  if (error) {
    console.error('Failed to increment message counters:', error);
  }
}

/**
 * Check all compliance requirements before sending
 * @param supabase - Supabase client
 * @param contactId - Contact ID
 * @param scheduledFor - When the message should be sent
 * @param trainerId - Trainer ID
 * @returns Combined result with all checks
 */
export async function checkCompliance(
  supabase: SupabaseClient,
  contactId: string,
  scheduledFor: Date,
  trainerId: string
): Promise<{ allowed: boolean; reason?: string; nextAvailable?: Date; remaining?: number }> {
  // Fetch GHL config for quiet hours and frequency caps
  const { data: config, error: configError } = await supabase
    .from('ghl_config')
    .select('quiet_hours_start, quiet_hours_end, frequency_cap_daily, frequency_cap_weekly')
    .eq('trainer_id', trainerId)
    .single();

  if (configError || !config) {
    console.error('Failed to fetch GHL config:', configError);
    // Default config if not found
    const defaultConfig: QuietHoursConfig = {
      quiet_hours_start: '08:00:00',
      quiet_hours_end: '21:00:00',
      frequency_cap_daily: 3,
      frequency_cap_weekly: 5,
    };
    return checkComplianceWithConfig(supabase, contactId, scheduledFor, defaultConfig);
  }

  return checkComplianceWithConfig(supabase, contactId, scheduledFor, config);
}

async function checkComplianceWithConfig(
  supabase: SupabaseClient,
  contactId: string,
  scheduledFor: Date,
  config: QuietHoursConfig
): Promise<{ allowed: boolean; reason?: string; nextAvailable?: Date; remaining?: number }> {
  // Check quiet hours
  const quietHoursResult = checkQuietHours(scheduledFor, config);
  if (!quietHoursResult.allowed) {
    return {
      allowed: false,
      reason: quietHoursResult.reason,
      nextAvailable: quietHoursResult.nextAvailable,
    };
  }

  // Check frequency cap
  const frequencyResult = await checkFrequencyCap(supabase, contactId, config);
  if (!frequencyResult.allowed) {
    return {
      allowed: false,
      reason: frequencyResult.reason,
    };
  }

  return {
    allowed: true,
    remaining: frequencyResult.remaining,
  };
}