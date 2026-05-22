-- Nuu v0.5: notice board — short member posts on the About POI.

create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles(user_id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now(),
  constraint posts_body_length check (char_length(body) between 1 and 500)
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

drop policy if exists "Posts are viewable by everyone" on public.posts;
create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

drop policy if exists "Members can post as themselves" on public.posts;
create policy "Members can post as themselves"
  on public.posts for insert
  with check (auth.uid() = author_id);

-- Authors can remove their own posts; admins can moderate any.
drop policy if exists "Authors or admins can delete posts" on public.posts;
create policy "Authors or admins can delete posts"
  on public.posts for delete
  using (
    auth.uid() = author_id
    or exists (
      select 1 from public.profiles
      where user_id = auth.uid() and is_admin
    )
  );
