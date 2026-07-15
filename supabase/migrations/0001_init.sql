-- Alphadex v2 — initial schema
-- Run via: supabase db push  (or paste into the Supabase SQL editor)

create extension if not exists pgcrypto;

-- ============================================================
-- PROFILES
-- ============================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
-- This is why register.tsx never inserts into `profiles` manually.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- INTERESTS & FOLLOWED CHANNELS
-- ============================================================
create table interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  topic text not null,
  created_at timestamptz not null default now(),
  unique (user_id, topic)
);

alter table interests enable row level security;

create policy "Users manage their own interests"
  on interests for all using (auth.uid() = user_id);

create table followed_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  channel_id text not null,
  channel_name text,
  priority int not null default 1,
  created_at timestamptz not null default now(),
  unique (user_id, channel_id)
);

alter table followed_channels enable row level security;

create policy "Users manage their own followed channels"
  on followed_channels for all using (auth.uid() = user_id);

-- ============================================================
-- CONTENT ITEMS (shared pool, ingested from YouTube/News)
-- ============================================================
create table content_items (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('youtube', 'news')),
  external_id text not null,
  title text not null,
  description text,
  thumbnail_url text,
  channel_id text,
  published_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (source, external_id)
);

-- Content is readable by any authenticated user (it's a shared catalog).
alter table content_items enable row level security;

create policy "Authenticated users can read content"
  on content_items for select using (auth.role() = 'authenticated');

-- ============================================================
-- USER ACTIONS (likes/saves)
-- ============================================================
create table user_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  content_id uuid references content_items(id) on delete cascade not null,
  action text not null check (action in ('like', 'save')),
  created_at timestamptz not null default now(),
  unique (user_id, content_id, action)
);

alter table user_actions enable row level security;

create policy "Users manage their own actions"
  on user_actions for all using (auth.uid() = user_id);

-- ============================================================
-- FEED CACHE (per-user — this is what fixes the v1 global-feed bug)
-- ============================================================
create table feed_cache (
  user_id uuid references profiles(id) on delete cascade primary key,
  payload jsonb not null,
  generated_at timestamptz not null default now()
);

alter table feed_cache enable row level security;

create policy "Users can only read their own feed"
  on feed_cache for select using (auth.uid() = user_id);

-- Only server-side (service role, e.g. an Edge Function) writes to this table,
-- so there is intentionally NO insert/update policy for regular users here.

-- ============================================================
-- CHAT HISTORY (AI assistant)
-- ============================================================
create table chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table chat_history enable row level security;

create policy "Users manage their own chat history"
  on chat_history for all using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_content_items_published_at on content_items (published_at desc);
create index idx_user_actions_user_id on user_actions (user_id);
create index idx_chat_history_user_id on chat_history (user_id, created_at);
