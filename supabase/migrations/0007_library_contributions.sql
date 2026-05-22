-- Nuu v0.5: library contributions — member-written articles with moderation.
-- Flow: draft → submitted → (admin) published | rejected.

create table if not exists public.contributions (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.profiles(user_id) on delete cascade,
  slug         text unique not null,
  title        text not null,
  excerpt      text not null default '',
  tag          text not null default 'Essay',
  body_md      text not null default '',
  read_minutes int not null default 1,
  status       text not null default 'draft'
                 check (status in ('draft', 'submitted', 'published', 'rejected')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  constraint contributions_title_length check (char_length(title) between 1 and 140),
  constraint contributions_body_length check (char_length(body_md) <= 40000)
);

create index if not exists contributions_status_idx on public.contributions (status);
create index if not exists contributions_author_idx on public.contributions (author_id);

drop trigger if exists contributions_set_updated_at on public.contributions;
create trigger contributions_set_updated_at
  before update on public.contributions
  for each row execute procedure public.set_updated_at();

alter table public.contributions enable row level security;

-- Read: published is public; authors see their own; admins see everything.
drop policy if exists "Published contributions are public" on public.contributions;
create policy "Published contributions are public"
  on public.contributions for select
  using (
    status = 'published'
    or auth.uid() = author_id
    or exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_admin
    )
  );

-- Create: as self, never starting as published.
drop policy if exists "Members create their own drafts" on public.contributions;
create policy "Members create their own drafts"
  on public.contributions for insert
  with check (
    auth.uid() = author_id
    and status in ('draft', 'submitted')
  );

-- Author edits: own, while not yet published, and cannot self-publish.
drop policy if exists "Authors edit their unpublished drafts" on public.contributions;
create policy "Authors edit their unpublished drafts"
  on public.contributions for update
  using (auth.uid() = author_id and status <> 'published')
  with check (auth.uid() = author_id and status in ('draft', 'submitted'));

-- Admin moderation: full control (publish / reject / edit any).
drop policy if exists "Admins moderate contributions" on public.contributions;
create policy "Admins moderate contributions"
  on public.contributions for update
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_admin
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_admin
    )
  );

-- Delete: own or admin.
drop policy if exists "Authors or admins delete contributions" on public.contributions;
create policy "Authors or admins delete contributions"
  on public.contributions for delete
  using (
    auth.uid() = author_id
    or exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_admin
    )
  );
