# ElevenLabs MCP Proxy Service

Minimal HTTP service that bridges GoHighLevel's Voice AI MCP to the ElevenLabs Text-to-Speech API. It exposes a single endpoint that accepts TTS requests and returns base64-encoded audio.

## Features
- MCP-style `POST /elevenlabs-mcp` endpoint.
- Validates input and uses environment defaults for voice/model.
- Calls ElevenLabs TTS with an API key loaded from environment variables.
- Returns predictable JSON with base64 audio data.
- Includes basic health check at `GET /health`.

## Quick start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and fill in your values:
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   npm start
   ```

The service listens on `PORT` (defaults to `3000`). Startup will fail if `ELEVENLABS_API_KEY` is missing.

## Environment variables
- `PORT` – port to listen on (default `3000`).
- `ELEVENLABS_API_KEY` – **required** ElevenLabs API key.
- `ELEVENLABS_VOICE_ID` – default voice ID when requests do not specify one.
- `ELEVENLABS_MODEL_ID` – default model ID (defaults to `eleven_multilingual_v2`).

## API
### `POST /elevenlabs-mcp`
Request body:
```json
{
  "text": "Hello world",
  "voice_id": "optional-voice-id",
  "model_id": "optional-model-id",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.8,
    "style": 0.3,
    "use_speaker_boost": true
  },
  "output_format": "mp3"
}
```

- `text` is required. When missing or empty, the service returns HTTP `400` with an error payload.
- If `voice_id` is omitted, `ELEVENLABS_VOICE_ID` is used. If neither is set, the service returns HTTP `400`.
- If `model_id` is omitted, `ELEVENLABS_MODEL_ID` (or `eleven_multilingual_v2`) is used.
- `output_format` defaults to `mp3`.

### Example `curl`
```bash
curl -X POST http://localhost:3000/elevenlabs-mcp \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Testing ElevenLabs MCP proxy",
    "output_format": "mp3"
  }'
```

### Success response
```json
{
  "status": "ok",
  "voice_id": "actual-voice-id",
  "model_id": "eleven_multilingual_v2",
  "audio_format": "mp3",
  "audio_base64": "BASE64_ENCODED_AUDIO_DATA"
}
```

### Error response
```json
{
  "status": "error",
  "error_message": "human-readable explanation"
}
```

## Using with GoHighLevel Voice AI MCP
- Deploy this service to any Node-friendly host (Render, Railway, Fly.io, etc.).
- Use the deployed HTTPS URL as the MCP URL when adding an MCP in GoHighLevel.
- No query parameters are required.
- Additional MCP authentication headers are optional; if you add them later, include them in GoHighLevel's MCP configuration.

## Notes
- Audio is returned inline as `audio_base64`. Store or stream it as needed on the client side.
- The service applies a 10-second timeout to ElevenLabs requests and logs only non-sensitive metadata (text length, voice, and model).
- CORS is disabled by default. Enable and scope it as needed for your deployment.
