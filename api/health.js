import { prepareApi } from './_security.js';

export default async function handler(req, res) {
  if (!prepareApi(req, res, { methods: ['GET'], bucket: 'health', limit: 120, maxBodyBytes: 1024 })) return;

  const hasKey = Boolean(process.env.OPENAI_API_KEY);
  const hasModel = Boolean(process.env.OPENAI_MODEL);

  return res.status(200).json({
    ok: true,
    service: 'Exposure API',
    openaiConfigured: hasKey && hasModel,
    model: process.env.OPENAI_MODEL || null,
    missing: [
      !hasKey ? 'OPENAI_API_KEY' : null,
      !hasModel ? 'OPENAI_MODEL' : null
    ].filter(Boolean),
    timestamp: new Date().toISOString()
  });
}
