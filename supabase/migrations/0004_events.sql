-- Nuu v0.5: events board — admin-curated events + member RSVPs.

-- ============================================================================
-- 1. Admin flag on profiles (founder curates events)
-- ============================================================================
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Founder is auto-promoted to admin on signup, regardless of join order.
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
    avatar_url,
    is_admin
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'preferred_username',
      ''
    ),
    new.raw_user_meta_data->>'avatar_url',
    lower(new.email) in ('obi@craefto.com', 'obibatbileg@gmail.com')
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- Promote the founder if they already have a profile.
update public.profiles p
set is_admin = true
from auth.users u
where u.id = p.user_id
  and lower(u.email) in ('obi@craefto.com', 'obibatbileg@gmail.com');

-- ============================================================================
-- 2. Events table
-- ============================================================================
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique,
  title       text not null,
  description text not null default '',
  city        text not null default '',
  starts_at   timestamptz not null,
  capacity    int not null default 0, -- 0 = unlimited
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists events_starts_at_idx on public.events (starts_at);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute procedure public.set_updated_at();

-- ============================================================================
-- 3. Event RSVPs (one row per member per event)
-- ============================================================================
create table if not exists public.event_rsvps (
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index if not exists event_rsvps_user_idx on public.event_rsvps (user_id);

-- ============================================================================
-- 4. RLS
-- ============================================================================
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

-- Events: everyone reads; only admins write.
drop policy if exists "Events are viewable by everyone" on public.events;
create policy "Events are viewable by everyone"
  on public.events for select using (true);

drop policy if exists "Admins can insert events" on public.events;
create policy "Admins can insert events"
  on public.events for insert
  with check (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_admin
    )
  );

drop policy if exists "Admins can update events" on public.events;
create policy "Admins can update events"
  on public.events for update
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_admin
    )
  );

drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events"
  on public.events for delete
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_admin
    )
  );

-- RSVPs: counts are public; members manage only their own row.
drop policy if exists "RSVPs are viewable by everyone" on public.event_rsvps;
create policy "RSVPs are viewable by everyone"
  on public.event_rsvps for select using (true);

drop policy if exists "Members can RSVP for themselves" on public.event_rsvps;
create policy "Members can RSVP for themselves"
  on public.event_rsvps for insert
  with check (auth.uid() = user_id);

drop policy if exists "Members can cancel their own RSVP" on public.event_rsvps;
create policy "Members can cancel their own RSVP"
  on public.event_rsvps for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 5. Seed the existing curated events
-- ============================================================================
insert into public.events (slug, title, description, city, starts_at, capacity)
values
  ('opening-move', 'Nuu · Opening Move',
   'The first gathering of the khural — meet the founders, see the world, make your opening move.',
   'Sydney', '2026-06-12 18:00:00+10', 40),
  ('builders-night', 'Builders Night',
   'An evening for Mongolian builders to demo what they are shipping.',
   'Ulaanbaatar', '2026-07-19 18:00:00+08', 60),
  ('coffee-and-code', 'Coffee & Code',
   'Casual co-working and coffee for the Melbourne diaspora.',
   'Melbourne', '2026-08-02 10:00:00+10', 25)
on conflict (slug) do nothing;
