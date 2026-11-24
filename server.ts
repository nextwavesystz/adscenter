import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const TTS_MODEL = 'gemini-3.8-flash-lite-tts';
const VOICE_NAME = 'Kore';
const VOICE_STYLE =
  'Warm, natural, friendly young Tanzanian woman speaking fluent Swahili with authentic conversational intonation, soft warmth, and clear welcoming pacing — never robotic.';

// Cache generated WAV audio per text+voice in memory so repeat plays are instant
const audioCache = new Map<string, Buffer>();

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      apiVersion: 'v1beta',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

async function synthesizeSwahiliFemaleVoice(text: string): Promise<Buffer> {
  const cacheKey = `${VOICE_NAME}:${text}`;
  const cached = audioCache.get(cacheKey);
  if (cached) return cached;

  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY haipo kwenye seva. Tafadhali iweke kwenye Settings > Secrets.');
  }

  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text,
            speechMetadata: {
              style: VOICE_STYLE,
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: VOICE_NAME,
          },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error('Haikuweza kutengeneza sauti kutoka Gemini TTS.');
  }

  const wavBuffer = Buffer.from(base64Audio, 'base64');
  audioCache.set(cacheKey, wavBuffer);
  return wavBuffer;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/tts', async (req: Request, res: Response) => {
    try {
      const rawText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
      if (!rawText || rawText.length > 700) {
        res.status(400).json({ error: 'Maandishi ya sauti si sahihi.' });
        return;
      }

      const wavBuffer = await synthesizeSwahiliFemaleVoice(rawText);
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(wavBuffer);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Hitilafu ya kutengeneza sauti ya mwongozo.';
      const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
      console.error('[TTS Error]:', message);
      res.status(status).json({ error: message });
    }
  });

  const distDir = path.resolve(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(distDir);

  if (isProd) {
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AdsCenter server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
