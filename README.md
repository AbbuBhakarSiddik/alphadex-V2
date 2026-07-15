# Alphadex v2

Phase 0 + Phase 1 build — see `alphadex-v2-architecture-roadmap.md` for the full plan.

## What's done

**Phase 0 — Foundation**
- Expo + TypeScript + expo-router (file-based navigation)
- NativeWind (Tailwind) configured and working
- Supabase client with SecureStore session persistence
- Full auth flow: landing → register/login → interests (stub) → tabs
- Route protection (auto-redirects based on session, in `app/_layout.tsx`)
- Modular `src/features/auth/` (api / store / hooks split)
- Full Postgres schema + Row Level Security policies (`supabase/migrations/0001_init.sql`)
- Admin tab auto-hides for non-admin users

**Phase 1 — Feed, scoring, ingestion, actions**
- `src/features/feed/scoring.ts` — pure, unit-tested ranking algorithm (recency decay + followed-channel boost + interest keyword match + past-engagement signal)
- `supabase/functions/feed-rank/` — Edge Function: on-demand YouTube + News ingestion into `content_items`, scores per-user, writes to `feed_cache`
- Real feed screen: FlashList rendering, pull-to-refresh, loading/error/empty states
- Like/save actions with optimistic UI updates (instant toggle, reverts silently on failure)
- 5 passing unit tests for the scoring algorithm (`npm test`)

## What's stubbed (later phases)

- `search.tsx`, `assistant.tsx`, `admin.tsx` — placeholder screens
- `interests.tsx` — needs the actual topic/channel picker UI (currently just a "continue" button — meaning follows/interests will be empty until you build this, so the feed will look thin until then)

## Setup (run this on your own machine — this was built in a sandbox with no phone/simulator to test on)

1. **Create a Supabase project** at supabase.com (free tier).
2. In the SQL Editor, run `supabase/migrations/0001_init.sql`.
3. Copy `.env.example` to `.env.local` and fill in your Project URL + anon key (Project Settings → API).
4. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
5. **Deploy the Edge Function** (needs the Supabase CLI: `npm i -g supabase`):
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   supabase functions deploy feed-rank
   supabase secrets set YOUTUBE_API_KEY=your_key
   supabase secrets set NEWSAPI_KEY=your_key
   ```
   (See `supabase/functions/README.md`. Missing either key just means that source is skipped, not a hard error — useful if you only have one key while waiting on the other.)
6. Start the dev server:
   ```bash
   npx expo start -c
   ```
7. Scan the QR code with **Expo Go**, or press `a` / `i` for an emulator.
8. Sign up → land on Feed. It'll be empty until you follow channels / set interests (Phase 1's `interests.tsx` is still a stub) — you can manually insert a row into `followed_channels` via the Supabase table editor to test ingestion end-to-end right now.

## Testing

```bash
npm test
```
Runs the feed scoring unit tests (5 tests, all passing as of this build).

## Notes / things to double check on your machine

- This was scaffolded in a network-restricted sandbox — **native builds and the Edge Function were not run live** (no phone/simulator, no live Supabase project to deploy to). `npx tsc --noEmit` and `npm test` both pass clean; run `npx expo start` and deploy the function yourself to confirm the full pipeline end-to-end.
- `jest` is pinned to `29.7.0` — `jest-expo`'s current release has a peer-dependency mismatch with Jest 30 that threw a `clearMocksOnScope` runtime error during testing; 29.x is what actually works with this Expo SDK version.
- If `expo start` complains about peer dependency mismatches, that's expected React 19 / RN 0.86 noise — already handled via `--legacy-peer-deps` during install.
- The `feed-rank` function ingests up to 10 items per followed channel and per interest topic on every cache-miss — fine for a demo/project, but if you add many followed channels you'll want to add pagination or a smarter ingestion budget.

## Next up: Phase 2

The AI assistant (`ai-chat` Edge Function — Gemini primary, Groq fallback) and real search. Say the word and I'll build that next.

