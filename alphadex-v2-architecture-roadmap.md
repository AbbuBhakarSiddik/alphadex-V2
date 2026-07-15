# 🧠 Alphadex v2 — Architecture & Rebuild Roadmap

> **Type:** Full rewrite, clean modular architecture
> **Platform:** Mobile (Expo / React Native) — kept as-is
> **Goal:** Production-grade, portfolio-worthy final year edutech project

---

## 1. Why a full rewrite (not a patch)

The v1 doc showed real problems that patching won't fully solve: a global (non-per-user) feed cache, broken imports, an unused AI service, hardcoded IPs, no validation layer, and no clear module boundaries. For a final-year major project, evaluators will look at **architecture and code quality** as much as features. A clean rewrite on a modern, defensible stack gets you:

- A backend that's mostly *managed* (less code to maintain, more time for features)
- A data layer with real security (Row Level Security) instead of hand-rolled auth checks everywhere
- A demo-able AI feature that's actually wired in, not a dead file
- A repo structure a professor or recruiter can understand in 2 minutes

---

## 2. New Tech Stack

| Layer | Old | New | Why |
|---|---|---|---|
| Mobile Framework | Expo (RN) | Expo (RN) — kept | Already a good choice, file-based routing via `expo-router` |
| UI Design | Hand-coded from scratch | **Google Stitch** → generate screen designs, then implement | Fast, professional-looking UI without a designer |
| Backend | Express + Node | **Supabase** (Postgres + Auto-generated REST/RPC + Edge Functions) | Managed, less boilerplate, built-in auth & security |
| Database | MongoDB (Mongoose) | **Supabase Postgres** | Relational integrity, RLS, free tier, SQL for the scoring engine |
| Auth | Custom JWT + bcrypt | **Supabase Auth** | Handles password hashing, sessions, refresh tokens, email verification for free |
| File/Avatar Storage | Not implemented | **Supabase Storage** | Free tier, direct client upload with RLS policies |
| State Management | Local `useState` | **Zustand** | Lightweight, no boilerplate, easy to test |
| AI — Chat/Q&A | Gemini (unused) | **Gemini 2.x Flash (free tier)** primary, **Groq (Llama, free tier)** fallback | Free, fast, generous quotas, easy REST integration |
| Recommendation Scoring | Node logic in Express | **Supabase Edge Function** (Deno/TS) or kept client-orchestrated, DB-backed | Same logic, but stateless, per-user, cacheable in Postgres |
| Content Sources | YouTube API, NewsAPI (unused) | Both, wired properly | Already integrated once — just needs proper wiring |
| Realtime | None | Supabase Realtime (optional, e.g. live like counts) | Free, built-in |
| Push Notifications | Not implemented | Expo Push Notifications | Free, native to Expo |

**Note on "Stitch integration as an agent":** Stitch itself isn't something you embed at runtime inside the app — it's a design tool you prompt to generate screen UI (layout, components, styling), which you then translate into React Native components. Think of it as your AI UI designer during development, not a live agent in the shipped app. The *live* AI agent in your shipped app is the Gemini/Groq-powered Q&A assistant (Section 5).

---

## 3. Modular Project Structure

```
alphadex/
├── app/                          # expo-router screens (thin — just layout + hooks)
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── landing.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── interests.tsx
│   └── (tabs)/
│       ├── feed.tsx
│       ├── search.tsx
│       ├── assistant.tsx         # NEW — AI Q&A chat screen
│       ├── profile.tsx
│       └── admin.tsx
│
├── src/
│   ├── features/                 # feature-first modules (the "modular" core)
│   │   ├── auth/
│   │   │   ├── api.ts            # supabase auth calls
│   │   │   ├── store.ts          # zustand slice
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   ├── feed/
│   │   │   ├── api.ts
│   │   │   ├── scoring.ts        # pure functions, unit-testable
│   │   │   ├── store.ts
│   │   │   └── types.ts
│   │   ├── search/
│   │   ├── assistant/            # AI chat feature
│   │   │   ├── api.ts            # calls edge function -> Gemini/Groq
│   │   │   ├── store.ts
│   │   │   └── types.ts
│   │   ├── profile/
│   │   └── admin/
│   │
│   ├── components/                # shared/dumb UI components only
│   │   ├── ui/                    # Button, Card, Input, Skeleton, etc.
│   │   └── layout/
│   │
│   ├── lib/
│   │   ├── supabase.ts            # single supabase client instance
│   │   ├── env.ts                 # typed env access (expo-constants)
│   │   └── queryClient.ts         # if using @tanstack/react-query
│   │
│   ├── theme/                     # kept from v1, cleaned up
│   └── utils/
│
├── supabase/
│   ├── migrations/                # SQL schema, versioned
│   ├── functions/                 # Edge Functions (Deno)
│   │   ├── feed-rank/
│   │   ├── ai-chat/
│   │   └── ai-summarize/
│   └── seed.sql
│
├── .env.local                     # SUPABASE_URL, SUPABASE_ANON_KEY, etc.
├── app.config.ts                  # expo-constants pulls env in
└── package.json
```

**Key modular rule:** a `feature/` folder owns its own API calls, state, and types. Screens in `app/` only compose feature hooks + components — they contain no business logic. This is what makes the codebase "structured and modular" and easy to present/defend in a viva.

---

## 4. Data Model (Supabase / Postgres)

Core tables (simplified):

```sql
-- Managed by Supabase Auth automatically: auth.users

profiles (
  id uuid references auth.users primary key,
  full_name text,
  avatar_url text,
  role text default 'user',        -- 'user' | 'admin'
  created_at timestamptz default now()
);

interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  topic text not null
);

followed_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  channel_id text,
  channel_name text,
  priority int default 1
);

content_items (
  id uuid primary key default gen_random_uuid(),
  source text,              -- 'youtube' | 'news'
  external_id text,
  title text,
  description text,
  thumbnail_url text,
  published_at timestamptz,
  metadata jsonb
);

user_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  content_id uuid references content_items(id),
  action text,               -- 'like' | 'save'
  created_at timestamptz default now()
);

feed_cache (
  user_id uuid references profiles(id) primary key,
  payload jsonb,
  generated_at timestamptz default now()
);

chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  role text,                 -- 'user' | 'assistant'
  content text,
  created_at timestamptz default now()
);
```

**Row Level Security** (example — this alone fixes the v1 "one feed for everyone" bug at the DB level):

```sql
alter table feed_cache enable row level security;

create policy "Users can only read their own feed"
on feed_cache for select
using (auth.uid() = user_id);
```

This one line does what the buggy global JS cache in v1 was trying (and failing) to do — Supabase makes per-user isolation structural, not something you have to remember to code correctly.

---

## 5. AI Q&A Assistant (free model)

**Primary:** Gemini 2.5 Flash (free tier, generous daily quota, already used once in v1)
**Fallback:** Groq (Llama 3.x, free, very low latency) — useful to demo resilience/failover, which is a nice touable talking point for a major project.

Flow:
1. User asks a question in the `assistant` tab, or taps "Explain this" on a feed card.
2. Client calls a Supabase **Edge Function** (`ai-chat`), passing the question + optional content context.
3. Edge Function calls Gemini API (server-side key, never exposed to the client) → falls back to Groq if Gemini errors/rate-limits.
4. Response streamed or returned, saved to `chat_history`.

This solves two v1 problems at once: the dead `aiRankingService.js` gets a real home, and API keys never sit in client code (v1 had a YouTube key logged to console — Edge Functions keep all secrets server-side).

---

## 6. Rebuild Roadmap

### Phase 0 — Foundation (2–3 days)
- Create Supabase project, define schema + RLS policies above
- Set up Expo project skeleton with the `src/features/` structure
- Set up `.env` + `app.config.ts` for all keys (Supabase URL/anon key, Gemini key, Groq key, YouTube key)
- Wire Supabase Auth (sign up / login / session persistence via `expo-secure-store`)

### Phase 1 — Core Loop (Week 1)
- Interests + channel onboarding (reuse Stitch-generated screens)
- Feed: content ingestion (YouTube + News) into `content_items`, scoring logic ported to `features/feed/scoring.ts` (pure, unit-testable), per-user feed generation via Edge Function, written to `feed_cache`
- Like/Save actions writing to `user_actions`
- Real infinite scroll + pull-to-refresh

### Phase 2 — AI Assistant + Search (Week 2)
- `ai-chat` Edge Function (Gemini primary, Groq fallback)
- Assistant tab UI (Stitch-designed chat interface)
- "Explain this" button on feed cards → assistant with context
- Functional search wired to Postgres full-text search or a search Edge Function

### Phase 3 — Admin + Polish (Week 3)
- Admin dashboard backed by real Postgres aggregation queries (RLS-restricted to `role = 'admin'`)
- Dark mode, avatar upload via Supabase Storage, notification preferences
- Push notifications (Expo)

### Phase 4 — Production Readiness (Week 4)
- Error boundaries, retry logic, offline detection
- Unit tests for scoring logic, integration tests for Edge Functions
- EAS Build for Android/iOS, CI/CD via GitHub Actions
- Final documentation for project submission (architecture diagram, ER diagram, demo script)

---

## 7. Why this stack is defensible for a viva/evaluation

- **Supabase over raw MongoDB/Express:** shows awareness of managed infrastructure and security-by-default (RLS) rather than hand-rolled auth checks — a common critique in student projects.
- **Feature-based modular structure:** directly demonstrates separation of concerns, a standard software engineering evaluation criterion.
- **Free-tier AI with fallback:** shows you understand rate limits and designed for resilience, not just "call one API and hope."
- **Stitch for UI:** lets you spend your limited project time on the recommendation engine and AI integration (the actual "major project" substance) rather than pixel-pushing.

---

## Next Steps

I can now start scaffolding the actual code — Supabase schema SQL, the Expo project skeleton with the modular folder structure, and the `ai-chat` Edge Function — in that order. Let me know if you want to adjust anything above first (e.g., swap Zustand for Context, or start with a specific phase).
