# Exposure

Exposure is a single-player AI-driven serial-killer investigation game set in the fictional town of Blackwood.

The player has just moved to town. Noah Williams helps them during the move, warns them to lock the back gate and disappears that night. Noah's damaged phone is found outside the new house, pulling the player into the investigation as a witness, possible suspect and potential target.

## Current Milestone

**Phase 2 — Premium Vertical Slice**

Exposure is now presented through a bespoke dark crime-noir interface built around the Living Book identity. The current vertical slice upgrades the playable Home, Blackwood Map and NPC scene experience without removing the real-time, appointment, relationship, Memory Book or AI foundations.

Includes:

- Premium commercial-style Home investigation dashboard
- Custom illustrated Blackwood main-street artwork
- Dynamic Living Time date and period presentation
- Blackwood News, Stamina, Exposure and Social Tension panels
- Current objectives, upcoming appointments and Memory Book previews
- Custom illustrated interactive Blackwood town map
- Clickable location markers with locked, available and high-risk states
- Location intelligence and direct travel actions from the map
- Custom Café Hollow scene artwork
- Custom Emily Hart portrait artwork
- Premium NPC scene layout with Trust, Focus, Fear and Suspicion
- Restyled narrative reader, dialogue choices and open conversation input
- Responsive mobile-first navigation and layout
- Revised opening prologue connecting the player directly to Noah
- Day, evening and night mission variations
- Living appointment system and phone-based rescheduling
- Social Score and player-suspicion states
- `While You Were Away` Memory Book chapters
- Real AI scene-dialogue bridge with automatic local fallback
- Protected `/api/talk`, `/api/director` and `/api/killer` routes
- Automated JavaScript, JSON and required-asset validation

## Play Current Static Build

```text
https://nightmaregame26.github.io/exposure-game/?v=premium1
```

GitHub Pages runs the full visual and gameplay prototype with local dialogue fallback. Live AI dialogue becomes available on the Vercel deployment after the required OpenAI environment variables are configured.

## Premium UI Files

- `premium-ui.css` — visual design system and responsive premium interface
- `premium-ui.js` — dashboard, social tension, appointment preview, map and scene enhancements
- `assets/blackwood-main-street.svg` — custom Home artwork
- `assets/cafe-hollow.svg` — custom Café Hollow artwork
- `assets/blackwood-map.svg` — custom map illustration
- `assets/emily-hart.svg` — custom fictional character portrait

## Core Files

- `index.html` — game, dashboard, Phone, map, scene and reader interface
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

## Deploy Live AI Build

Import this repository into Vercel, then add:

```text
OPENAI_API_KEY=<secret key>
OPENAI_MODEL=<supported JSON-capable chat model>
APP_ORIGIN=<production Exposure URL>
```

Full instructions are in `docs/VERCEL_DEPLOYMENT.md`.

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

- Finish the complete Emily investigation loop using the premium layout
- Add Noah's house, Police Station and forest artwork
- Add unique portraits for Mason, Sarah, Alex and Mara
- Build the evidence-board interface
- Add map travel transitions and location-specific ambient effects
- Deploy and test the live AI backend
