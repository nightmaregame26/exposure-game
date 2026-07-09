import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
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

    if (!npcId || !playerMessage) {
      return res.status(400).json({ error: 'npcId and playerMessage are required' });
    }

    const maxLength = tier === 'premium' ? LIMITS.premiumMaxPlayerMessageCharacters : LIMITS.freeMaxPlayerMessageCharacters;
    const maxReplies = tier === 'premium' ? LIMITS.premiumMaxAiRepliesPerScene : LIMITS.freeMaxAiRepliesPerScene;

    if (playerMessage.length > maxLength) {
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
        newEvidenceId: null,
        memory: `${npcName || npcId} refused to continue because their Focus was too low.`
      });
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.75,
      max_tokens: 220,
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
- Keep replies under ${LIMITS.maxAiReplyWords} words.
- The NPC has human state: trust=${trust}, focus=${focus}, stress=${stress}, fear=${fear}, interest=${interest}, suspicionTowardPlayer=${suspicionTowardPlayer}.
- Low focus means short guarded answers.
- High stress or fear means evasive, defensive, or emotional answers.
- High trust and high interest allows more openness.
- Return JSON only.

Return:
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
  "memory": "what this NPC remembers"
}`
        },
        {
          role: 'user',
          content: JSON.stringify({
            npcId,
            npcName,
            playerMessage,
            day,
            time,
            location,
            trust,
            focus,
            stress,
            fear,
            interest,
            suspicionTowardPlayer,
            knownFacts: knownFacts.slice(0, 12),
            npcMemory: npcMemory.slice(0, 8),
            allowedSecrets: allowedSecrets.slice(0, 6),
            conversationIntent,
            focusCost
          })
        }
      ]
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');

    return res.status(200).json({
      reply: limitWords(String(parsed.reply || 'They hesitate, like something is being left unsaid.'), LIMITS.maxAiReplyWords),
      trustChange: clampNumber(parsed.trustChange, -LIMITS.maxTrustDeltaPerMessage, LIMITS.maxTrustDeltaPerMessage),
      exposureChange: clampNumber(parsed.exposureChange, -LIMITS.maxExposureDeltaPerMessage, LIMITS.maxExposureDeltaPerMessage),
      focusChange: clampNumber(parsed.focusChange ?? -focusCost, -LIMITS.maxFocusDeltaPerMessage, 5),
      stressChange: clampNumber(parsed.stressChange, -10, 10),
      fearChange: clampNumber(parsed.fearChange, -10, 10),
      interestChange: clampNumber(parsed.interestChange, -10, 10),
      suspicionChange: clampNumber(parsed.suspicionChange, -10, 10),
      newEvidenceId: parsed.newEvidenceId || null,
      memory: parsed.memory || null
    });
  } catch (error) {
    return res.status(500).json({
      error: 'AI_FAILED',
      reply: 'They hesitate, like something is being left unsaid.',
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
  return words.slice(0, maxWords).join(' ') + '...';
}
