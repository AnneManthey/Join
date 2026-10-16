-- Schema additions for the Join issue collector.
-- Run once on top of schema.sql. Part 1 must be run on its own and committed
-- before part 2, because a new enum value cannot be used in the same transaction.

-- ============================================================================
-- Part 1: new status value
-- ============================================================================

-- Incoming requests land in the new column "Triage", before "To do".
alter type public.task_status add value if not exists 'triage' before 'todo';

-- ============================================================================
-- Part 2: columns, types, usage counter, functions
-- ============================================================================

-- Who created a ticket and where it came from.
create type public.task_creator_type as enum ('internal', 'external');
create type public.task_source as enum ('manual', 'email', 'form');

alter table public.tasks
  alter column status set default 'triage',
  add column if not exists creator_email text,
  -- Display name of the creator (external creators only; from the form or the email header).
  add column if not exists creator_name text,
  add column if not exists creator_type public.task_creator_type not null default 'internal',
  add column if not exists source public.task_source not null default 'manual',
  add column if not exists ai_generated boolean not null default false;

-- Daily counter for requests that are processed automatically (AI).
-- RLS is on and there is deliberately NO policy: only the service role has access.
create table if not exists public.email_usage (
  day date primary key,
  request_count integer not null default 0 check (request_count >= 0)
);

alter table public.email_usage enable row level security;

-- Atomically claims one slot for today (Europe/Berlin).
-- Returns allowed = false and the current count when the limit is reached.
-- The limit is passed by the caller (n8n). Keep it in sync with
-- DAILY_REQUEST_LIMIT in the frontend.
create or replace function public.claim_email_slot(p_limit integer default 10)
returns table (allowed boolean, used integer)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_day date := (now() at time zone 'Europe/Berlin')::date;
  v_count integer;
begin
  insert into public.email_usage (day, request_count)
  values (v_day, 0)
  on conflict (day) do nothing;

  update public.email_usage
     set request_count = request_count + 1
   where day = v_day
     and request_count < p_limit
  returning request_count into v_count;

  if v_count is null then
    select request_count into v_count
      from public.email_usage
     where day = v_day;
    return query select false, v_count;
  else
    return query select true, v_count;
  end if;
end;
$function$;

-- Only the service role (n8n) may claim slots.
revoke execute on function public.claim_email_slot(integer) from public, anon, authenticated;
grant execute on function public.claim_email_slot(integer) to service_role;

-- Number of requests used today. Publicly readable for the landing page.
create or replace function public.get_email_usage_today()
returns integer
language sql
stable
security definer
set search_path to 'public'
as $function$
  select coalesce(
    (select request_count
       from public.email_usage
      where day = (now() at time zone 'Europe/Berlin')::date),
    0
  );
$function$;

revoke execute on function public.get_email_usage_today() from public;
grant execute on function public.get_email_usage_today() to anon, authenticated, service_role;