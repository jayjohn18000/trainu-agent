// Minimal MCP-style proxy service for ElevenLabs Text-to-Speech.
// Accepts JSON requests and returns base64-encoded audio suitable for GoHighLevel Voice AI MCP integrations.

import express from 'express';
import dotenv from 'dotenv';
import fetch, { AbortController } from 'node-fetch';

dotenv.config();

const PORT = process.env.PORT || 3000;
const apiKey = process.env.ELEVENLABS_API_KEY;
const defaultVoiceId = process.env.ELEVENLABS_VOICE_ID;
const defaultModelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

if (!apiKey) {
  console.error('Missing ELEVENLABS_API_KEY. Set it in your environment before starting the server.');
  process.exit(1);
}

const app = express();

// JSON parser with modest size limit to prevent abuse.
app.use(express.json({ limit: '1mb' }));

app.post('/elevenlabs-mcp', async (req, res) => {
  const {
    text,
    voice_id: voiceIdOverride,
    model_id: modelIdOverride,
    voice_settings: voiceSettings,
    output_format: outputFormatOverride,
  } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({
      status: 'error',
      error_message: 'Invalid request: "text" is required and must be a non-empty string.',
    });
  }

  const voiceId = voiceIdOverride || defaultVoiceId;
  if (!voiceId) {
    return res.status(400).json({
      status: 'error',
      error_message: 'No voice_id provided and ELEVENLABS_VOICE_ID is not set.',
    });
  }

  const modelId = modelIdOverride || defaultModelId;
  const outputFormat = outputFormatOverride || 'mp3';

  const payload = {
    text,
    model_id: modelId,
    output_format: outputFormat,
  };

  if (voiceSettings && typeof voiceSettings === 'object') {
    payload.voice_settings = voiceSettings;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error from ElevenLabs');
      console.error('ElevenLabs error', {
        status: response.status,
        statusText: response.statusText,
        message: errorText?.slice(0, 300),
      });

      const statusCode = response.status >= 400 && response.status < 600 ? response.status : 500;
      return res.status(statusCode).json({
        status: 'error',
        error_message: 'Upstream ElevenLabs error: ' + (response.statusText || 'unexpected response'),
      });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const audioBase64 = audioBuffer.toString('base64');

    console.info('Generated audio', {
      textLength: text.length,
      voiceId,
      modelId,
      format: outputFormat,
    });

    return res.json({
      status: 'ok',
      voice_id: voiceId,
      model_id: modelId,
      audio_format: outputFormat,
      audio_base64: audioBase64,
    });
  } catch (error) {
    const isAbortError = error?.name === 'AbortError';
    console.error('TTS request failed', {
      message: error?.message,
      aborted: isAbortError,
    });

    return res.status(500).json({
      status: 'error',
      error_message: isAbortError
        ? 'Request to ElevenLabs timed out. Please try again.'
        : 'Unexpected error while generating speech.',
    });
  }
});

// Basic health check route for deployments.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`ElevenLabs MCP service listening on port ${PORT}`);
});

