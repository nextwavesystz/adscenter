import { GoogleGenAI } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';

const TTS_MODEL = 'gemini-3.8-flash-lite-tts';
const VOICE_NAME = 'Kore';
const VOICE_STYLE =
  'Warm, natural, friendly young Tanzanian woman speaking fluent Swahili with authentic conversational intonation, soft warmth, and clear welcoming pacing — never robotic.';

const audioCache = new Map<string, Buffer>();

type VercelRequest = IncomingMessage & {
  method?: string;
  body?: { text?: unknown };
};

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  json: (payload: unknown) => void;
  send: (body: Buffer | string) => void;
};

async function readJsonBody(req: VercelRequest): Promise<{ text?: unknown }> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? (JSON.parse(raw) as { text?: unknown }) : {};
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const rawText = typeof body?.text === 'string' ? body.text.trim() : '';
    if (!rawText || rawText.length > 700) {
      res.status(400).json({ error: 'Maandishi ya sauti si sahihi.' });
      return;
    }

    const cacheKey = `${VOICE_NAME}:${rawText}`;
    const cached = audioCache.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(cached);
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error: 'GEMINI_API_KEY haipo kwenye seva. Tafadhali iweke kwenye Settings > Secrets.',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      apiVersion: 'v1beta',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: rawText,
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
      res.status(500).json({ error: 'Haikuweza kutengeneza sauti kutoka Gemini TTS.' });
      return;
    }

    const wavBuffer = Buffer.from(base64Audio, 'base64');
    audioCache.set(cacheKey, wavBuffer);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(wavBuffer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Hitilafu ya kutengeneza sauti ya mwongozo.';
    res.status(500).json({ error: message });
  }
}
