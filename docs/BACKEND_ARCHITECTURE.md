# Backend Architecture
## Exposure v0.1

The backend protects the AI keys, stores game state, controls agent memory and ensures the AI cannot break the mystery.

## Recommended Stack

- Frontend: mobile-first web app
- Backend: Vercel Serverless Functions or Supabase Edge Functions
- Database: Supabase Postgres
- AI: OpenAI API
- Hosting: Vercel or GitHub Pages for static frontend

## Request Flow

```text
Player browser
  ↓
Exposure frontend
  ↓
/api/talk
  ↓
Backend validates request
  ↓
OpenAI API
  ↓
Backend validates AI response
  ↓
Game state updates
  ↓
Player sees response
```

## Why the API Key Must Stay Backend Only

The OpenAI API key must never be placed in `index.html`, `app.js`, or any frontend file. Browser code is visible to players.

The frontend calls the backend. The backend calls OpenAI.

## Initial API Endpoints

### POST /api/talk

Talk to an NPC.

Request:

```json
{
  "saveId": "abc123",
  "npcId": "emily",
  "message": "Did Noah owe anyone money?"
}
```

Response:

```json
{
  "reply": "Emily hesitates...",
  "trustChange": 2,
  "exposureChange": 0,
  "newEvidenceId": null,
  "memory": "Player asked about Noah owing money."
}
```

### POST /api/day/end

Ends the current day and runs town/killer simulation.

### POST /api/director/tick

Runs a Director AI check for pacing and new opportunities.

### POST /api/killer/tick

Runs hidden killer logic based on current world state.

## Database Tables

### players

- id
- created_at
- display_name

### save_games

- id
- player_id
- day
- time_minutes
- stamina
- exposure
- active_episode
- world_state_json
- created_at
- updated_at

### characters

- id
- save_id
- name
- role
- is_core
- alive
- current_location
- trust
- fear
- stress
- suspicion
- profile_json

### character_memories

- id
- save_id
- character_id
- memory
- importance
- created_at

### evidence

- id
- save_id
- evidence_key
- title
- description
- strength
- verified
- discovered_at

### locations

- id
- save_id
- location_key
- unlocked
- danger_level
- current_events_json

### killer_profiles

- id
- save_id
- character_id
- motive
- victim_profile_json
- signature
- mo_json
- risk_tolerance
- knowledge_json

### conversation_logs

- id
- save_id
- character_id
- player_message
- npc_reply
- trust_delta
- exposure_delta
- created_at

## AI Response Validation

The backend must check every AI response.

Validation rules:

- Reject if killer identity is revealed too early.
- Reject if new evidence is not in allowed evidence registry.
- Reject if NPC reveals a secret without enough trust.
- Reject if NPC references impossible knowledge.
- Clamp trust and Exposure changes.
- Store memory only after sanitising.

## First Implementation Target

Build `/api/talk` first.

The first version will support:

- Emily
- Detective Mason
- Alex
- Sarah
- Mara

The backend will use fixed local state first, then Supabase later.
