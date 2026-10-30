-- Migration: add daily_notes for archive briefings
-- Run: supabase db push  (or paste into the SQL editor)
--
-- One optional human note per Dhaka calendar day. It is attached to
-- `/daily/[yyyy-mm-dd]` when an editor wants to add context to the automatic
-- compilation. The note never changes the indexability rule: a daily page is
-- indexable only when it summarises at least five stories.

begin;

create table if not exists public.daily_notes (
  briefing_date date primary key,
  editor_note   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.daily_notes is
  'Optional editor notes for automatically compiled daily briefings.';

alter table public.daily_notes enable row level security;

drop policy if exists "daily notes are public" on public.daily_notes;
create policy "daily notes are public"
  on public.daily_notes for select
  to anon, authenticated
  using (true);

grant select on public.daily_notes to anon, authenticated;
grant select, insert, update, delete on public.daily_notes to service_role;

drop trigger if exists daily_notes_touch_updated_at on public.daily_notes;
create trigger daily_notes_touch_updated_at
  before update on public.daily_notes
  for each row execute function public.touch_updated_at();

commit;
