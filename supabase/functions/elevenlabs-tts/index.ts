import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("ElevenLabs TTS Edge Function loaded");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      text,
      voice_id,
      model_id,
      voice_settings,
      output_format,
    } = await req.json();

    console.log("TTS request received:", { textLength: text?.length, voice_id, model_id });

    if (!text || typeof text !== "string" || !text.trim()) {
      console.error("Invalid request: text is required");
      return new Response(
        JSON.stringify({
          status: "error",
          error_message: 'Invalid request: "text" is required and must be a non-empty string.',
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) {
      console.error("ELEVENLABS_API_KEY not configured");
      return new Response(
        JSON.stringify({
          status: "error",
          error_message: "ElevenLabs API key not configured.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default voice ID (George) if not provided
    const voiceId = voice_id || "JBFqnCBsd6RMkjVDRZzb";
    const modelId = model_id || "eleven_multilingual_v2";
    const format = output_format || "mp3_44100_128";

    const payload: Record<string, unknown> = {
      text,
      model_id: modelId,
      output_format: format,
    };

    if (voice_settings && typeof voice_settings === "object") {
      payload.voice_settings = voice_settings;
    }

    console.log("Calling ElevenLabs API with voice:", voiceId);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error from ElevenLabs");
      console.error("ElevenLabs API error:", {
        status: response.status,
        statusText: response.statusText,
        message: errorText?.slice(0, 300),
      });

      return new Response(
        JSON.stringify({
          status: "error",
          error_message: `Upstream ElevenLabs error: ${response.statusText || "unexpected response"}`,
        }),
        { 
          status: response.status >= 400 && response.status < 600 ? response.status : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = base64Encode(audioBuffer);

    console.log("Audio generated successfully:", {
      textLength: text.length,
      voiceId,
      modelId,
      format,
      audioSize: audioBuffer.byteLength,
    });

    return new Response(
      JSON.stringify({
        status: "ok",
        voice_id: voiceId,
        model_id: modelId,
        audio_format: format,
        audio_base64: audioBase64,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("TTS request failed:", error);

    return new Response(
      JSON.stringify({
        status: "error",
        error_message: error instanceof Error ? error.message : "Unexpected error while generating speech.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/*
 * VERIFICATION:
 * 
 * Health check is handled by the existing health edge function.
 * 
 * Test TTS endpoint:
 * curl -X POST https://sakksoxuanyimicevljq.supabase.co/functions/v1/elevenlabs-tts \
 *   -H "Content-Type: application/json" \
 *   -H "apikey: YOUR_ANON_KEY" \
 *   -d '{"text":"Hello from Lovable","output_format":"mp3_44100_128"}'
 * 
 * Expected response:
 * {"status":"ok","voice_id":"JBFqnCBsd6RMkjVDRZzb","model_id":"eleven_multilingual_v2","audio_format":"mp3_44100_128","audio_base64":"..."}
 */
