-- Nuu v0.5: newsletter — capture subscriber emails (sending TBD via provider).

create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  source     text not null default 'site',
  created_at timestamptz not null default now(),
  constraint newsletter_email_format
    check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone may subscribe, but only with a well-formed email via the site form
-- (defense-in-depth: the WITH CHECK validates rather than blindly allowing).
-- No public SELECT policy, so the email list stays private; only admins read it.
drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (
    email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    and char_length(email) <= 254
    and source = 'site'
  );

drop policy if exists "Admins read subscribers" on public.newsletter_subscribers;
create policy "Admins read subscribers"
  on public.newsletter_subscribers for select
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_admin
    )
  );
