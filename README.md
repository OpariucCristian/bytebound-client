# ByteBound

A retro arcade-style quiz game where you battle enemies by answering programming and Computer Science questions. Answer correctly to attack, answer wrong and the enemy strikes back.

![game](https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGFvZG56cDNibXQ3aXM2bzhjaXRmMmo4NWJwZWlhazl1eWp5M3FxdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GfzPlsLcIq4KaSo85q/giphy.gif)

## Gameplay

- Answer multiple-choice questions on topics like Data Structures & Algorithms
- Correct answers trigger your attack; wrong answers or timeouts let the enemy hit you
- Survive as long as possible, earn XP, and level up

## Tech Stack

**Frontend**  React 18, TypeScript, Vite, TailwindCSS, Clerk (auth), Socket.IO

**Backend**  NestJS, TypeORM, PostgreSQL, Socket.IO, JWT (Clerk-issued tokens)

## Local development

1. Copy `.env.example` to `.env` and fill in:
   - `VITE_API_BASE_URL`: the server's API URL, e.g. `http://localhost:3000/api/`. The game socket connects to the same host.
   - `VITE_CLERK_PUBLISHABLE_KEY`: from the Clerk dashboard → API keys.
2. `npm install`, then `npm run dev` (serves on http://localhost:8080).

## Clerk setup

In the Clerk dashboard for the application:

1. **User & authentication → Username**: enable it and make it required. The server uses it as the player name.
2. **Sessions → Customize session token**: add the claim
   ```json
   { "username": "{{user.username}}" }
   ```
3. **Domains / allowed origins**: add the Cloudflare Pages URL once deployed (development instances allow localhost by default).

## Deploying to Cloudflare Pages

Connect this repository in Cloudflare Pages (Workers & Pages → Create → Pages → Connect to Git) with:

| Setting | Value |
| --- | --- |
| Framework preset | Vite (or None) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variables | `VITE_API_BASE_URL` (the deployed server URL ending in `/api/`), `VITE_CLERK_PUBLISHABLE_KEY` |

The `VITE_*` variables are baked in at build time, so redeploy after changing them. Pages serves `index.html` for unknown paths, so client-side routes like `/game` still work on refresh.
