# Supabase Edge Functions

These run on Deno (not Node/Metro) — that's why they're excluded from the app's
`tsconfig.json` and use `https://...` URL imports instead of npm packages.

## Deploy

```bash
supabase functions deploy feed-rank
```

## Required secrets (set once per project)

```bash
supabase secrets set YOUTUBE_API_KEY=your_key_here
supabase secrets set NEWSAPI_KEY=your_key_here
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
injected automatically — you don't set those yourself.

## Functions

- **feed-rank** — on-demand content ingestion (YouTube + News) and per-user
  feed scoring. Called from `src/features/feed/api.ts`. If `YOUTUBE_API_KEY`
  or `NEWSAPI_KEY` are missing, that source is silently skipped rather than
  erroring — handy for testing with only one API key while you wait on the other.
- **ai-chat** — Phase 2. Will hold the Gemini (primary) + Groq (fallback) AI
  assistant logic.
