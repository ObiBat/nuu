-- Harden rls_auto_enable per advisor warnings 0028/0029.
-- It is an event-trigger function (fires on CREATE TABLE DDL); it is never
-- meant to be called via REST RPC. Revoke EXECUTE so it stops being exposed
-- at /rest/v1/rpc/rls_auto_enable. The event trigger still fires regardless.
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
