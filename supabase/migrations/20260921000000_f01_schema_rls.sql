-- Svasthi F01 — schema + Row Level Security
-- Run this in Supabase Dashboard → SQL Editor.
-- Every table has user_id and an RLS policy of user_id = auth.uid().
-- No table is readable across users by default.

-- ============ check_ins ============
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mood integer not null check (mood between 1 and 5),
  stress integer not null check (stress between 0 and 10),
  energy integer not null check (energy between 0 and 10),
  sleep_hours numeric not null check (sleep_hours >= 0 and sleep_hours <= 24),
  contexts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.check_ins enable row level security;

create policy "check_ins_select_own" on public.check_ins
  for select using (auth.uid() = user_id);
create policy "check_ins_insert_own" on public.check_ins
  for insert with check (auth.uid() = user_id);
create policy "check_ins_delete_own" on public.check_ins
  for delete using (auth.uid() = user_id);

-- ============ journals ============
create table if not exists public.journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  transcript text not null check (char_length(transcript) between 1 and 4000),
  consent boolean not null check (consent = true),
  created_at timestamptz not null default now()
);

alter table public.journals enable row level security;

create policy "journals_select_own" on public.journals
  for select using (auth.uid() = user_id);
create policy "journals_insert_own" on public.journals
  for insert with check (auth.uid() = user_id);
create policy "journals_delete_own" on public.journals
  for delete using (auth.uid() = user_id);

-- ============ voice_features ============
create table if not exists public.voice_features (
  journal_id uuid primary key references public.journals (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  duration_seconds numeric not null check (duration_seconds >= 0),
  pause_ratio numeric not null check (pause_ratio >= 0 and pause_ratio <= 1),
  speaking_rate_wpm numeric not null check (speaking_rate_wpm >= 0),
  rms_db numeric,
  created_at timestamptz not null default now()
);

alter table public.voice_features enable row level security;

create policy "voice_features_select_own" on public.voice_features
  for select using (auth.uid() = user_id);
create policy "voice_features_insert_own" on public.voice_features
  for insert with check (auth.uid() = user_id);

-- ============ insights ============
create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_check_in_id uuid references public.check_ins (id) on delete set null,
  source_journal_id uuid references public.journals (id) on delete set null,
  level text not null check (level in ('steady', 'watch', 'support')),
  title text not null,
  evidence jsonb not null default '[]'::jsonb,
  suggestion text not null,
  referral_recommended boolean not null default false,
  crisis boolean not null default false,
  generated_by text not null check (generated_by in ('gemini', 'fallback')),
  created_at timestamptz not null default now()
);

alter table public.insights enable row level security;

create policy "insights_select_own" on public.insights
  for select using (auth.uid() = user_id);
create policy "insights_insert_own" on public.insights
  for insert with check (auth.uid() = user_id);

-- ============ chat_messages ============
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "chat_messages_select_own" on public.chat_messages
  for select using (auth.uid() = user_id);
create policy "chat_messages_insert_own" on public.chat_messages
  for insert with check (auth.uid() = user_id);
create policy "chat_messages_delete_own" on public.chat_messages
  for delete using (auth.uid() = user_id);

-- Helpful index for the dashboard trend queries.
create index if not exists check_ins_user_created_idx on public.check_ins (user_id, created_at desc);
create index if not exists insights_user_created_idx on public.insights (user_id, created_at desc);
