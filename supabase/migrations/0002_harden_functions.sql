-- Harden functions per advisor warnings.

-- 1. Pin search_path on set_updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Revoke EXECUTE on handle_new_user from anon/authenticated.
--    Trigger still fires (triggers bypass REST execute permissions).
revoke execute on function public.handle_new_user() from anon, authenticated, public;
