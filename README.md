# Exposure

Exposure is a single-player AI-driven serial killer investigation game set in the fictional town of Blackwood.

The player has just moved to town. A missing person case begins. Over time, the player investigates, builds trust, gathers evidence, manages stamina and Exposure, and tries to identify the killer before becoming a target.

## Current Build

**Web Alpha 0.3 — Living Blackwood Foundation**

Includes:

- Mobile-first web interface
- Tutorial tips
- Time, stamina and Exposure systems
- Task selection
- Scene overlay system
- Dialogue choices with sub-branches
- Free-text local conversation placeholder
- NPC Health, Stamina, Focus, Stress, Fear, Trust, Interest and Suspicion
- Focus-draining conversations
- NPCs naturally end conversations when Focus is low
- Contacts and trust
- Phone tab with messages and unknown threats
- Suspect marking
- Diary notes
- Evidence list
- Case file
- Town tick for public fear and rumours
- Local browser save
- Backend `/api/talk` scaffold with AI cost controls

## Play Locally

Open `index.html` in a browser.

## GitHub Pages

Once GitHub Pages is enabled, the game should be playable at:

```text
https://nightmaregame26.github.io/exposure-game/
```

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

## Data Files

- `data/characters.json`
- `data/locations.json`
- `data/agent-rules.json`
- `data/killer-profile-template.json`
- `data/town-state.json`

## Next Milestone

Alpha 0.4:

- Connect frontend to `/api/talk` on Vercel
- Add real AI NPC replies
- Add conversation memory compression
- Add phone message conversations
- Add first Director tick
- Add first Killer tick
- Add broader 50-character NPC database
