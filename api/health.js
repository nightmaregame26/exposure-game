import { prepareApi } from './_security.js';

export default async function handler(req, res) {
  if (!prepareApi(req, res, { methods: ['GET'], bucket: 'health', limit: 120, maxBodyBytes: 1024 })) return;

  return res.status(200).json({
    ok: true,
    service: 'Exposure API',
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    timestamp: new Date().toISOString()
  });
}
