# Exposure — Vercel Deployment

The repository is prepared to serve the static game and the serverless API from one deployment.

## Required environment variables

Create these in the Vercel project settings:

- `OPENAI_API_KEY` — required for live AI dialogue.
- `OPENAI_MODEL` — optional. Defaults to `gpt-4o-mini`; set this to a supported JSON-capable chat model available to the account.
- `APP_ORIGIN` — optional. Set it to the production Exposure URL. Multiple origins can be comma-separated.

Never place `OPENAI_API_KEY` in `index.html`, frontend JavaScript, GitHub Pages settings or any committed file.

## Import settings

1. Create a new Vercel project.
2. Import `nightmaregame26/exposure-game` from GitHub.
3. Keep the repository root as the project root.
4. Leave Framework Preset as `Other` if Vercel does not select one automatically.
5. Do not set a custom output directory.
6. Add the environment variables above for Production and Preview.
7. Deploy.

The root files are served as the game frontend. Files in `api/` become serverless routes:

- `/api/health`
- `/api/talk`
- `/api/director`
- `/api/killer`

## Verification

After deployment:

1. Open `/api/health` on the deployment URL.
2. Confirm `ok` is `true`.
3. Confirm `openaiConfigured` is `true`.
4. Open the game.
5. Enter an NPC scene.
6. Confirm the dialogue badge reads `AI dialogue online`.
7. Type a question and verify the reply changes NPC Focus and social state.

If the API is missing or the key is not configured, the frontend automatically returns to the existing local dialogue system.

## Security currently included

- OpenAI key remains server-side.
- Same-origin checking with optional `APP_ORIGIN` allow-list.
- Request body limits.
- Prototype per-IP rate limiting.
- Conversation length and reply-count limits.
- Server-side clamping of relationship and Exposure changes.
- No-store response headers.

The in-memory rate limiter is suitable for prototype testing. A commercial release should replace it with persistent rate limiting and authenticated player sessions.
