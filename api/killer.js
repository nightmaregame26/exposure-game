export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const {
    exposure = 0,
    publicFear = 0,
    policePresence = 0,
    cluesFound = 0,
    killerPermission = 'wait',
    possibleTargets = []
  } = req.body || {};

  if (killerPermission === 'wait') {
    return res.status(200).json({ action: 'wait', targetId: null, reason: 'Director has not approved escalation.' });
  }

  const risk = clamp(Number(policePresence || 0) + Number(exposure || 0) * 0.4);

  if (risk > 75) {
    return res.status(200).json({ action: 'delay', targetId: null, reason: 'Risk is too high. Killer waits.' });
  }

  const target = chooseTarget(possibleTargets);

  if (killerPermission === 'stalk_only') {
    return res.status(200).json({ action: 'stalk', targetId: target?.id || null, reason: 'Pressure is high, but murder is not approved.' });
  }

  if (cluesFound >= 4 && publicFear >= 45) {
    return res.status(200).json({ action: 'send_warning', targetId: null, reason: 'Player is becoming dangerous.' });
  }

  return res.status(200).json({ action: 'observe', targetId: target?.id || null, reason: 'Killer observes and updates knowledge.' });
}

function chooseTarget(targets) {
  if (!Array.isArray(targets) || !targets.length) return null;
  return targets
    .map(t => ({ ...t, score: Number(t.vulnerability || 0) + Number(t.knowsDangerousFact ? 25 : 0) - Number(t.protection || 0) }))
    .sort((a, b) => b.score - a.score)[0];
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
