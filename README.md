# Exposure

Exposure is a single-player AI-driven serial-killer investigation game set in the fictional town of Blackwood.

The player has just moved to town. Noah Williams helps them during the move, warns them to lock the back gate and disappears that night. Noah's damaged phone is found outside the new house, pulling the player into the investigation as a witness, possible suspect and potential target.

## Current Milestone

**Milestone 2 — The Living Book**

Exposure is presented as an interactive crime novel connected to the player's real local time. Choosing a destination opens a narrated travel chapter, while time, appointments and relationships change what happens.

Includes:

- Revised opening prologue connecting the player directly to Noah
- Noah's damaged phone as the first evidence object
- Emily's 10:00 meeting request
- Real local time displayed as Blackwood time
- Day, evening and night versions of every current mission
- Missions that can cross midnight
- Living appointment system
- Phone-based rescheduling
- NPC willingness calculations based on trust, affection, respect, reliability, fear, suspicion, interest and schedule conflicts
- Consequences for arriving unannounced
- Consequences for missed appointments
- Social Score for each important character
- NPC suspicion states, including believing the player may be the killer
- `While You Were Away` offline simulation summaries
- Offline events saved into the Memory Book
- Book-style reader overlay and typewriter presentation
- Travel observations that can become evidence
- Outbound and return chapters
- Searchable, bookmarkable Memory Book
- Time, stamina and Exposure systems
- NPC Health, Stamina, Focus, Stress, Fear, Trust, Interest and Suspicion
- Town, Director and Killer simulation foundations
- Backend `/api/talk`, `/api/director` and `/api/killer` scaffolds
- Automated JavaScript and JSON validation through GitHub Actions

## Play

```text
https://nightmaregame26.github.io/exposure-game/
```

Use a version query after major updates when the browser caches an older build:

```text
https://nightmaregame26.github.io/exposure-game/?v=living1
```

## Main Files

- `index.html` — game, Phone and reader interface
- `app.js` — current game simulation
- `book-engine.js` — prologue, travel chapters and Memory Book
- `living-time-patch.js` — real-time task execution and reset integration
- `living-social-engine.js` — appointments, rescheduling, social scores, suspicion and offline time
- `style.css` — game, book and Living Time presentation
- `data/book-content.json` — authored prologue and travel content
- `data/living-appointments.json` — schedules, social defaults and time-based mission outcomes

## Project Documents

- `docs/EXPOSURE_BLUEPRINT.md`
- `docs/AI_AGENT_SYSTEM.md`
- `docs/BACKEND_ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/CHARACTER_ENGINE.md`
- `docs/BLACKWOOD_DATABASE.md`
- `docs/PHONE_SYSTEM.md`
- `docs/KILLER_ENGINE.md`
- `docs/TOWN_SIMULATION.md`
- `docs/MONETISATION_MODEL.md`
- `docs/DIRECTOR_AI.md`
- `docs/RELATIONSHIP_ENGINE.md`
- `docs/WORLD_MEMORY_SYSTEM.md`
- `docs/CASE_GENERATION_ENGINE.md`
- `docs/BOOK_ENGINE.md`
- `docs/LIVING_TIME_SOCIAL_SYSTEM.md`

## Next Build Block

- Connect appointment negotiation to real AI messaging
- Add server-verified time and authoritative offline simulation
- Add full NPC daily movement schedules
- Make businesses visibly open and closed
- Add relationship-driven rumour transmission
- Add time-sensitive calls and notifications
- Connect the killer's knowledge to appointments and missed meetings
- Deploy the AI backend for real conversations
