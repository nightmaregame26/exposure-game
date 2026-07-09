# Director AI
## Exposure Alpha 0.4 Planning

The Director AI is the Game Master for Exposure. It keeps the mystery coherent while still allowing AI agents and the town simulation to improvise.

## Core Purpose

The Director AI decides whether the story needs:

- tension
- calm
- clue discovery
- character pressure
- police movement
- killer movement
- news update
- new task
- warning
- consequence

The Director AI does not roleplay directly as an NPC. It controls pacing and permissions.

## Director Inputs

The Director receives a compact snapshot:

```json
{
  "day": 3,
  "time": "18:30",
  "episode": 1,
  "playerExposure": 62,
  "playerStamina": 44,
  "cluesFound": 5,
  "publicFear": 48,
  "policePresence": 38,
  "rumourIntensity": 55,
  "recentTimeline": [],
  "npcStates": [],
  "killerState": {},
  "openTasks": []
}
```

## Director Outputs

The Director returns structured actions only.

```json
{
  "tensionChange": 5,
  "approvedEvents": ["unknown_message"],
  "newTasks": ["Meet Sarah after closing"],
  "newsUpdate": "Residents report strange headlights near Lake Road.",
  "killerPermission": "stalk_only",
  "notes": "Player has enough clues to escalate pressure but not enough for arrest."
}
```

## Hard Rules

The Director cannot:

- reveal the killer directly
- create impossible evidence
- allow a major death without cause
- contradict the blueprint
- remove player agency
- solve the case for the player

The Director must:

- maintain fair mystery rules
- keep evidence discoverable
- make consequences traceable
- keep the killer introduced early
- respect NPC knowledge boundaries

## Pacing Levels

### Low Tension

Used when the player needs time to investigate.

Events:

- quiet rumours
- minor phone messages
- casual NPC interactions

### Medium Tension

Used after the player finds meaningful clues.

Events:

- police movement
- witness anxiety
- media pressure
- unknown warnings

### High Tension

Used when Exposure is high or the player is close to truth.

Events:

- stalking
- evidence destruction
- killer message
- attempted attack
- witness disappears

## First Implementation

Alpha 0.4 should add `/api/director.js` as a serverless endpoint that validates possible story actions and returns JSON.
