-- Store each member's chosen Ninja Adventure character preset so it persists
-- and shows to other members (via presence + the directory).
alter table public.profiles
  add column if not exists character_preset text not null default 'Boy';
