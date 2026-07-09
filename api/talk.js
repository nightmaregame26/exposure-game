import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    const {
      npcId,
      npcName,
      playerMessage,
      day,
      time,
      location,
      trust = 0,
      knownFacts = [],
      npcMemory = [],
      allowedSecrets = []
    } = req.body || {};

    if (!npcId || !playerMessage) {
      return res.status(400).json({ error: 'npcId and playerMessage are required' });
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are roleplaying as ${npcName || npcId} in Exposure, a serial killer mystery game set in Blackwood.

Rules:
- Stay in character.
- Do not reveal the killer.
- Only use facts this NPC would know.
- Only reveal secrets from allowedSecrets.
- Never invent final evidence.
- Do not contradict the season blueprint.
- Return JSON only.

Return:
{
  "reply": "NPC dialogue",
  "trustChange": 0,
  "exposureChange": 0,
  "newEvidenceId": null,
  "memory": "what this NPC remembers"
}`
        },
        {
          role: 'user',
          content: JSON.stringify({ npcId, npcName, playerMessage, day, time, location, trust, knownFacts, npcMemory, allowedSecrets })
        }
      ]
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');

    return res.status(200).json({
      reply: String(parsed.reply || 'They hesitate, like something is being left unsaid.'),
      trustChange: clampNumber(parsed.trustChange, -10, 10),
      exposureChange: clampNumber(parsed.exposureChange, -10, 10),
      newEvidenceId: parsed.newEvidenceId || null,
      memory: parsed.memory || null
    });
  } catch (error) {
    return res.status(500).json({
      error: 'AI failed',
      reply: 'They hesitate, like something is being left unsaid.',
      trustChange: 0,
      exposureChange: 0,
      newEvidenceId: null,
      memory: null
    });
  }
}

function clampNumber(value, min, max) {
  const number = Number(value || 0);
  return Math.max(min, Math.min(max, number));
}
