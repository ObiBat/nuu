-- Change the admin/founder allowlist to admin@nuu.today.
-- Supersedes the email list baked into 0004's handle_new_user.

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
    lower(new.email) = 'admin@nuu.today'
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- Re-sync existing profiles to the new allowlist.
update public.profiles p
set is_admin = (lower(u.email) = 'admin@nuu.today')
from auth.users u
where u.id = p.user_id;
