# Exposure

Exposure is a single-player AI-driven serial-killer investigation game set in the fictional town of Blackwood.

The player has just moved to town. Noah Williams helps them during the move, warns them to lock the back gate and disappears that night. Noah's damaged phone is found outside the new house, pulling the player into the investigation as a witness, possible suspect and potential target.

## Current Milestone

**Milestone 3 — The First Case Loop**

Exposure is presented as an interactive crime novel connected to the player's real local time. Travel, appointments, relationships and suspicion affect what happens. The repository is now prepared for a Vercel deployment that serves both the game and its protected AI conversation endpoint.

Includes:

- Revised opening prologue connecting the player directly to Noah
- Real local time displayed as Blackwood time
- Day, evening and night mission variations
- Living appointment system and phone-based rescheduling
- NPC willingness based on trust, affection, respect, reliability, fear, suspicion, interest and schedule conflicts
- Social Score and player-suspicion states
- `While You Were Away` Memory Book chapters
- Book-style reader, travel chapters and saved evidence
- Real AI scene-dialogue bridge with automatic local fallback
- AI health indicator inside NPC scenes
- Server-side Focus, Trust, Stress, Fear, Interest, Suspicion and Exposure updates
- Protected `/api/talk`, `/api/director` and `/api/killer` routes
- API origin checks, body limits, prototype rate limiting and no-store headers
- Vercel deployment configuration and environment-variable template
- Automated JavaScript and JSON validation through GitHub Actions

## Play Current Static Build

```text
https://nightmaregame26.github.io/exposure-game/?v=ai1
```

GitHub Pages runs the game with local dialogue fallback. Live AI dialogue becomes available on the Vercel deployment after `OPENAI_API_KEY` is configured.

## Deploy Live AI Build

Import this repository into Vercel, then add:

```text
OPENAI_API_KEY=<secret key>
OPENAI_MODEL=<supported JSON-capable chat model>
APP_ORIGIN=<production Exposure URL>
```

Full instructions are in `docs/VERCEL_DEPLOYMENT.md`.

## Main Files

- `index.html` — game, Phone, scene and reader interface
- `app.js` — current game simulation and local dialogue fallback
- `ai-bridge.js` — live AI conversation connection and fallback handling
- `book-engine.js` — prologue, travel chapters and Memory Book
- `living-time-patch.js` — real-time task execution and reset integration
- `living-social-engine.js` — appointments, rescheduling, social scores, suspicion and offline time
- `api/_security.js` — shared origin, request-size and rate-limit checks
- `api/health.js` — deployment and OpenAI configuration check
- `api/talk.js` — live NPC conversation endpoint
- `api/director.js` — rule-based Director endpoint
- `api/killer.js` — hidden killer-behaviour endpoint
- `vercel.json` — serverless deployment configuration
- `.env.example` — environment-variable names without secrets
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
- `docs/VERCEL_DEPLOYMENT.md`

## Next Build Block

- Deploy the repository through the owner's Vercel account
- Confirm the configured OpenAI model is available to the account
- Test Emily's complete AI conversation and appointment flow
- Add server-authoritative player sessions and persistent rate limiting
- Add Mason's formal witness/suspect interview
- Connect AI conversation memory to the social graph and Director
