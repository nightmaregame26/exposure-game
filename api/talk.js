import OpenAI from 'openai';
import { prepareApi } from './_security.js';

const LIMITS = {
  freeMaxPlayerMessageCharacters: 400,
  premiumMaxPlayerMessageCharacters: 800,
  freeMaxAiRepliesPerScene: 10,
  premiumMaxAiRepliesPerScene: 25,
  maxAiReplyWords: 150,
  maxTrustDeltaPerMessage: 10,
  maxExposureDeltaPerMessage: 10,
  maxFocusDeltaPerMessage: 18
};

const FOCUS_COSTS = {
  casualQuestion: 3,
  caseQuestion: 6,
  emotionalQuestion: 8,
  askForSecret: 12,
  accusation: 15,
  threatOrPressure: 18
};

export default async function handler(req, res) {
  if (!prepareApi(req, res, { methods: ['POST'], bucket: 'talk', limit: 24, maxBodyBytes: 24_000 })) return;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: 'OPENAI_NOT_CONFIGURED',
      reply: null
    });
  }

  try {
    const {
      npcId,
      npcName,
      playerMessage = '',
      day,
      time,
      location,
      trust = 0,
      focus = 50,
      stress = 0,
      fear = 0,
      interest = 50,
      suspicionTowardPlayer = 0,
      knownFacts = [],
      npcMemory = [],
      allowedSecrets = [],
      tier = 'free',
      repliesThisScene = 0,
      conversationIntent = 'caseQuestion'
    } = req.body || {};

    const cleanMessage = String(playerMessage || '').trim();
    if (!npcId || !cleanMessage) {
      return res.status(400).json({ error: 'npcId and playerMessage are required' });
    }

    const maxLength = tier === 'premium'
      ? LIMITS.premiumMaxPlayerMessageCharacters
      : LIMITS.freeMaxPlayerMessageCharacters;
    const maxReplies = tier === 'premium'
      ? LIMITS.premiumMaxAiRepliesPerScene
      : LIMITS.freeMaxAiRepliesPerScene;

    if (cleanMessage.length > maxLength) {
      return res.status(400).json({
        error: 'MESSAGE_TOO_LONG',
        reply: `Keep it shorter. This character can only process ${maxLength} characters at once.`
      });
    }

    if (Number(repliesThisScene) >= maxReplies) {
      return res.status(429).json({
        error: 'SCENE_REPLY_LIMIT',
        reply: 'They look away. “I cannot keep talking here. Find me later.”',
        trustChange: 0,
        exposureChange: 0,
        focusChange: 0,
        stressChange: 0,
        fearChange: 0,
        interestChange: 0,
        suspicionChange: 0,
        newEvidenceId: null,
        memory: null
      });
    }

    const focusCost = FOCUS_COSTS[conversationIntent] ?? FOCUS_COSTS.caseQuestion;
    if (Number(focus) <= 8) {
      return res.status(200).json({
        reply: 'They look exhausted and guarded. “Not now. I cannot talk about this.”',
        trustChange: 0,
        exposureChange: 0,
        focusChange: 0,
        stressChange: 0,
        fearChange: 0,
        interestChange: 0,
        suspicionChange: 0,
        newEvidenceId: null,
        memory: `${npcName || npcId} refused to continue because their Focus was too low.`
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.75,
      max_tokens: 220,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are roleplaying as ${npcName || npcId} in Exposure, an original small-town psychological crime mystery set in Blackwood.

Rules:
- Stay fully in character.
- Never reveal or guess the killer's identity.
- Only use facts this NPC would reasonably know.
- Only reveal secrets included in allowedSecrets.
- Never invent final evidence, forensic proof, a confession, or a solved case.
- Do not contradict established facts or the NPC memory supplied to you.
- Treat the player as a possible witness, suspect, ally or threat according to the supplied social state.
- Low Focus means short, guarded answers.
- High Stress or Fear means evasive, defensive or emotional answers.
- High Trust and Interest permit more openness, but Fear or Suspicion can still override Trust.
- Keep the spoken reply under ${LIMITS.maxAiReplyWords} words.
- Return valid JSON only.

Current state:
trust=${trust}, focus=${focus}, stress=${stress}, fear=${fear}, interest=${interest}, suspicionTowardPlayer=${suspicionTowardPlayer}

Return exactly this shape:
{
  "reply": "NPC dialogue",
  "trustChange": 0,
  "exposureChange": 0,
  "focusChange": -${focusCost},
  "stressChange": 0,
  "fearChange": 0,
  "interestChange": 0,
  "suspicionChange": 0,
  "newEvidenceId": null,
  "memory": "one concise fact this NPC will remember"
}`
        },
        {
          role: 'user',
          content: JSON.stringify({
            npcId,
            npcName,
            playerMessage: cleanMessage,
            day,
            time,
            location,
            trust,
            focus,
            stress,
            fear,
            interest,
            suspicionTowardPlayer,
            knownFacts: safeStringArray(knownFacts, 12, 220),
            npcMemory: safeStringArray(npcMemory, 8, 220),
            allowedSecrets: safeStringArray(allowedSecrets, 6, 220),
            conversationIntent,
            focusCost
          })
        }
      ]
    });

    const parsed = JSON.parse(response.choices?.[0]?.message?.content || '{}');
    return res.status(200).json({
      reply: limitWords(String(parsed.reply || 'They hesitate, like something is being left unsaid.'), LIMITS.maxAiReplyWords),
      trustChange: clampNumber(parsed.trustChange, -LIMITS.maxTrustDeltaPerMessage, LIMITS.maxTrustDeltaPerMessage),
      exposureChange: clampNumber(parsed.exposureChange, -LIMITS.maxExposureDeltaPerMessage, LIMITS.maxExposureDeltaPerMessage),
      focusChange: clampNumber(parsed.focusChange ?? -focusCost, -LIMITS.maxFocusDeltaPerMessage, 5),
      stressChange: clampNumber(parsed.stressChange, -10, 10),
      fearChange: clampNumber(parsed.fearChange, -10, 10),
      interestChange: clampNumber(parsed.interestChange, -10, 10),
      suspicionChange: clampNumber(parsed.suspicionChange, -10, 10),
      newEvidenceId: typeof parsed.newEvidenceId === 'string' ? parsed.newEvidenceId.slice(0, 100) : null,
      memory: typeof parsed.memory === 'string' ? parsed.memory.slice(0, 240) : null
    });
  } catch (error) {
    console.error('Exposure talk endpoint failed', {
      name: error?.name,
      status: error?.status,
      message: error?.message
    });

    return res.status(500).json({
      error: 'AI_FAILED',
      reply: null,
      trustChange: 0,
      exposureChange: 0,
      focusChange: 0,
      stressChange: 0,
      fearChange: 0,
      interestChange: 0,
      suspicionChange: 0,
      newEvidenceId: null,
      memory: null
    });
  }
}

function clampNumber(value, min, max) {
  const number = Number(value || 0);
  return Math.max(min, Math.min(max, number));
}

function limitWords(text, maxWords) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(' ')}...`;
}

function safeStringArray(value, maxItems, maxLength) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxItems)
    .map(item => String(item || '').trim().slice(0, maxLength))
    .filter(Boolean);
}
