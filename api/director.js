import { prepareApi } from './_security.js';

export default async function handler(req, res) {
  if (!prepareApi(req, res, { methods: ['POST'], bucket: 'director', limit: 60, maxBodyBytes: 24_000 })) return;

  const {
    day = 1,
    time = '06:30',
    exposure = 0,
    cluesFound = 0,
    publicFear = 0,
    policePresence = 0,
    rumourIntensity = 0,
    recentTimeline = []
  } = req.body || {};

  const tension = calculateTension({ exposure, cluesFound, publicFear, rumourIntensity });
  const approvedEvents = [];
  const newTasks = [];
  let newsUpdate = null;
  let killerPermission = 'wait';

  if (tension >= 65) {
    approvedEvents.push('unknown_warning');
    killerPermission = 'stalk_only';
    newsUpdate = 'Residents report strange headlights near Lake Road.';
  } else if (tension >= 35) {
    approvedEvents.push('rumour_spread');
    if (cluesFound >= 3) newTasks.push('Bring evidence to Detective Mason');
  } else {
    approvedEvents.push('quiet_scene');
  }

  return res.status(200).json({
    day,
    time,
    tension,
    approvedEvents,
    newTasks,
    newsUpdate,
    killerPermission,
    timelineItemsRead: Array.isArray(recentTimeline) ? Math.min(recentTimeline.length, 5) : 0,
    notes: 'Rule-based Director foundation.'
  });
}

function calculateTension({ exposure, cluesFound, publicFear, rumourIntensity }) {
  return clamp(
    Number(exposure || 0) * 0.45 +
    Number(publicFear || 0) * 0.25 +
    Number(rumourIntensity || 0) * 0.15 +
    Number(cluesFound || 0) * 4
  );
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
