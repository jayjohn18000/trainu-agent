/**
 * Robust AI client with error handling, retries, and fallback support
 */

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const AI_TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;

export interface AIResponse<T> {
  success: boolean;
  data: T | null;
  usedFallback: boolean;
  error?: string;
  latencyMs: number;
}

export async function callAI<T>(
  prompt: string,
  fallbackFn: () => T,
  options?: { timeout?: number; retries?: number }
): Promise<AIResponse<T>> {
  const startTime = Date.now();
  const timeout = options?.timeout || AI_TIMEOUT_MS;
  const maxRetries = options?.retries || MAX_RETRIES;

  if (!LOVABLE_API_KEY) {
    console.warn('LOVABLE_API_KEY not configured, using fallback');
    return {
      success: false,
      data: fallbackFn(),
      usedFallback: true,
      error: 'AI API key not configured',
      latencyMs: Date.now() - startTime,
    };
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.3, // Lower for more consistent outputs
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty AI response');
      }

      // Parse and validate JSON
      let parsed: T;
      try {
        parsed = JSON.parse(content) as T;
    } catch (parseError) {
      const errorMsg = parseError instanceof Error ? parseError.message : 'Unknown error';
      throw new Error(`Invalid JSON response: ${errorMsg}`);
      }

      return {
        success: true,
        data: parsed,
        usedFallback: false,
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`AI call attempt ${attempt + 1} failed:`, errorMessage);

      if (attempt === maxRetries) {
        // Final fallback
        return {
          success: false,
          data: fallbackFn(),
          usedFallback: true,
          error: errorMessage,
          latencyMs: Date.now() - startTime,
        };
      }

      // Exponential backoff
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 500));
    }
  }

  // Should never reach here, but TypeScript needs it
  return {
    success: false,
    data: fallbackFn(),
    usedFallback: true,
    latencyMs: Date.now() - startTime,
  };
}

