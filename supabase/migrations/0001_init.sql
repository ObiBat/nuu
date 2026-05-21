-- Nuu v0.3 initial schema: profiles table tied to auth.users.
-- Run via Supabase Dashboard > SQL Editor or the Supabase CLI.

-- ============================================================================
-- 1. Member number sequence (starts at 1, gives each member a permanent #)
-- ============================================================================
create sequence if not exists public.member_number_seq start with 1;

-- ============================================================================
-- 2. Profiles table
-- ============================================================================
create table if not exists public.profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  member_number  int unique not null default nextval('public.member_number_seq'),
  display_name   text not null default '',
  role           text not null default '',
  location       text not null default '',
  bio            text not null default '',
  slug           text unique,
  character      jsonb not null default '{}'::jsonb,
  links          jsonb not null default '{}'::jsonb,
  avatar_url     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists profiles_slug_idx on public.profiles (slug);
create index if not exists profiles_member_number_idx
  on public.profiles (member_number);

-- ============================================================================
-- 3. RLS — public read, owner write
-- ============================================================================
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- 4. Auto-create profile on signup
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    user_id,
    display_name,
    avatar_url
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'preferred_username',
      ''
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 5. Auto-update updated_at on profile changes
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
