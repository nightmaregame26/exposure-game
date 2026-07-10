# Exposure

Exposure is a single-player AI-driven serial-killer investigation game set in the fictional town of Blackwood.

The player has just moved to town. A missing-person case begins. Over time, the player investigates, builds trust, gathers evidence, manages stamina and Exposure, and tries to identify the killer before becoming a target.

## Current Milestone

**Milestone 1 — The Book**

Exposure is now presented as an interactive crime novel. Choosing a destination opens a narrated travel chapter before the investigation scene, and the return journey becomes a saved reflection chapter.

Includes:

- Opening playable prologue
- Story-integrated tutorial
- Book-style reader overlay
- Typewriter text and instant reveal
- Adjustable reading speed
- Previous and next page controls
- Interactive choices inside narrative pages
- Travel observations that can become evidence
- Outbound travel chapters for every current task
- Return reflection chapters
- Persistent searchable Memory Book
- Chapter bookmarks and rereading
- Mobile-first game interface
- Time, stamina and Exposure systems
- NPC Health, Stamina, Focus, Stress, Fear, Trust, Interest and Suspicion
- Focus-draining conversations
- Phone messages and unknown threats
- Suspect marking, notes, evidence and case file
- Town, Director and Killer tick foundations
- Backend `/api/talk`, `/api/director` and `/api/killer` scaffolds

## Play

```text
https://nightmaregame26.github.io/exposure-game/
```

Use a version query after major updates when the browser caches an older build:

```text
https://nightmaregame26.github.io/exposure-game/?v=book1
```

## Main Files

- `index.html` — game and reader interface
- `app.js` — current game simulation
- `book-engine.js` — prologue, travel chapters and Memory Book
- `style.css` — game and book presentation
- `data/book-content.json` — authored prologue and travel content

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

## Data Files

- `data/characters.json`
- `data/locations.json`
- `data/agent-rules.json`
- `data/killer-profile-template.json`
- `data/town-state.json`
- `data/relationships.json`
- `data/world-memory.json`
- `data/director-rules.json`
- `data/book-content.json`

## Next Build Block

**Milestone 2 — The Town**

- Director-selected travel variations
- Time-of-day and weather variants
- NPC movement schedules
- Dynamic encounters during travel
- Businesses opening and closing
- Rumour transmission through relationships
- Audio ambience and page sounds
- Real AI conversations through a deployed backend
