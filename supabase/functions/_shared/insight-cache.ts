/**
 * Insight caching utilities to reduce AI API calls
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getCachedOrGenerate<T>(
  supabase: ReturnType<typeof createClient>,
  trainerId: string,
  contactId: string | null,
  insightType: 'churn' | 'queue' | 'client',
  inputData: any,
  generateFn: () => Promise<T>,
  ttlMinutes: number = 60
): Promise<{ data: T; fromCache: boolean }> {
  // Create hash of input data for cache key
  const dataHash = await createDataHash(JSON.stringify(inputData));

  // Check cache (use service role client for cache operations)
  const cacheQuery = supabase
    .from('insight_cache')
    .select('id, response, hit_count')
    .eq('trainer_id', trainerId)
    .eq('insight_type', insightType)
    .eq('data_hash', dataHash)
    .gt('expires_at', new Date().toISOString());

  // Handle null contact_id properly
  const { data: cached, error: cacheError } = contactId === null
    ? await cacheQuery.is('contact_id', null).maybeSingle()
    : await cacheQuery.eq('contact_id', contactId).maybeSingle();

  if (cacheError) {
    console.error('Cache lookup error:', cacheError);
  }

  if (cached) {
    // Update hit count - cast entire chain due to type generation issues
    const hitCount = ((cached as any).hit_count || 0) + 1;
    const updateQuery: any = supabase.from('insight_cache');
    await updateQuery.update({ hit_count: hitCount }).eq('id', (cached as any).id);
    return { data: (cached as any).response as T, fromCache: true };
  }

  // Generate new
  const result = await generateFn();

  // Cache for specified TTL
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
  const { error: insertError } = await supabase.from('insight_cache').insert({
    trainer_id: trainerId,
    contact_id: contactId,
    insight_type: insightType,
    prompt_version: '1.0',
    data_hash: dataHash,
    response: result as any,
    expires_at: expiresAt,
  } as any);

  if (insertError) {
    console.error('Cache insert error:', insertError);
  }

  return { data: result, fromCache: false };
}

async function createDataHash(data: string): Promise<string> {
  // Use Web Crypto API for hashing
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function logAIUsage(
  supabase: ReturnType<typeof createClient>,
  trainerId: string,
  functionName: string,
  result: { latencyMs: number; usedFallback: boolean; error?: string },
  cacheHit: boolean = false,
  promptVersion: string = '1.0'
) {
  await supabase.from('ai_analytics').insert({
    trainer_id: trainerId,
    function_name: functionName,
    prompt_version: promptVersion,
    latency_ms: result.latencyMs,
    used_fallback: result.usedFallback,
    cache_hit: cacheHit,
    error_message: result.error || null,
  } as any);
}

