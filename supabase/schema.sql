/*
 * Duikul — database schema (Supabase / Postgres)
 *
 * Run once on a fresh Supabase project: paste this file into the SQL editor,
 * or `supabase db push` if you use the Supabase CLI.
 *
 * Design notes
 *  - The site is an aggregator + verification layer. We store a headline, a
 *    short publisher/summary snippet, attribution, and our own derived
 *    metadata (first-reported time, source count, confirmation score). We
 *    never store full article bodies.
 *  - `clusters` group articles from independent outlets about the same event.
 *    `articles` are the individual publisher links. `sources` is the
 *    whitelist of outlets in `src/config/sources.ts`.
 *  - Confirmation is counted once per source, never per article. The app
 *    derives the badge from `distinct_source_count` + `trust_weight_sum`
 *    (same thresholds as `src/lib/ingest/score.ts`).
 *  - `editor_note` is a short human note. A cluster is indexable when it has
 *    at least two distinct sources OR an editor note. This is the
 *    thin-content guard used by `/story/[id]` metadata.
 *
 * If you created the earlier prototype tables (`stories`, `cluster_stories`)
 * in this project, use a new project or drop those tables first: this file
 * intentionally creates the article-level model the ingest code writes to.
 */

create extension if not exists pg_trgm;

-- --------------------------------------------------------------- sources
create table if not exists public.sources (
  id              text primary key,              -- slug, e.g. "prothom-alo"
  name            text not null,                 -- display name (English)
  name_bn         text not null,                 -- display name (Bangla)
  category        text not null check (category in ('deshi', 'bideshi')),
  rss_url         text not null,
  site_url        text not null,
  trust_weight    smallint not null check (trust_weight between 1 and 5),
  language        text not null check (language in ('bn', 'en')),
  active          boolean not null default true,
  last_fetched_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- --------------------------------------------------------------- clusters
create table if not exists public.clusters (
  id                    uuid primary key,
  title                 text not null,
  summary               text,
  category              text not null check (category in ('deshi', 'bideshi')),
  language              text not null check (language in ('bn', 'en')),
  image_url             text,
  primary_source_id     text references public.sources(id) on delete set null,
  primary_article_url   text not null,
  distinct_source_count smallint not null default 1 check (distinct_source_count >= 1),
  trust_weight_sum      smallint not null default 1 check (trust_weight_sum >= 1),
  verified_score        smallint not null default 2,
  popular_score         double precision not null default 0,
  editor_note           text,
  first_published_at    timestamptz not null,
  last_published_at     timestamptz not null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint clusters_time_order check (last_published_at >= first_published_at)
);

create index if not exists idx_clusters_edition
  on public.clusters (category, last_published_at desc);
create index if not exists idx_clusters_popular
  on public.clusters (popular_score desc, last_published_at desc);
create index if not exists idx_clusters_editor_note
  on public.clusters (last_published_at desc)
  where editor_note is not null and btrim(editor_note) <> '';

-- ----------------------------------------------------------- daily_notes
-- One optional human note per Dhaka calendar day, shown on the automatic
-- briefing at /daily/[yyyy-mm-dd].
create table if not exists public.daily_notes (
  briefing_date date primary key,
  editor_note   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.daily_notes is
  'Optional editor notes for automatically compiled daily briefings.';

-- --------------------------------------------------------------- articles
create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  cluster_id    uuid references public.clusters(id) on delete set null,
  source_id     text not null references public.sources(id) on delete cascade,
  title         text not null,
  summary       text,
  url           text not null,
  url_hash      text not null unique,
  image_url     text,
  published_at  timestamptz not null,
  category      text not null check (category in ('deshi', 'bideshi')),
  language      text not null check (language in ('bn', 'en')),
  feed_position integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists idx_articles_cluster
  on public.articles (cluster_id, published_at);
create index if not exists idx_articles_published
  on public.articles (published_at desc);
create index if not exists idx_articles_source
  on public.articles (source_id);

-- --------------------------------------------------------------- newsletter
create table if not exists public.subscribers (
  id             uuid primary key default gen_random_uuid(),
  email          text not null check (position('@' in email) > 1),
  locale         text not null default 'bn' check (locale in ('bn', 'en')),
  source         text,
  unsubscribed_at timestamptz,
  created_at     timestamptz not null default now()
);

create unique index if not exists subscribers_email_unique
  on public.subscribers (lower(email));

create table if not exists public.signup_rate_limits (
  ip_hash           text primary key,
  window_started_at timestamptz not null default now(),
  attempts          integer not null default 0
);

alter table public.signup_rate_limits enable row level security;

-- Atomic fixed-window limiter. Returns true when this attempt is allowed.
create or replace function public.consume_signup_attempt(
  p_ip_hash text,
  p_limit integer default 5,
  p_window_seconds integer default 3600
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean;
begin
  insert into public.signup_rate_limits (ip_hash, window_started_at, attempts)
  values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do update
    set attempts = case
          when public.signup_rate_limits.window_started_at <
               now() - make_interval(secs => p_window_seconds)
          then 1
          else public.signup_rate_limits.attempts + 1
        end,
        window_started_at = case
          when public.signup_rate_limits.window_started_at <
               now() - make_interval(secs => p_window_seconds)
          then now()
          else public.signup_rate_limits.window_started_at
        end
  returning attempts <= p_limit into allowed;

  return coalesce(allowed, false);
end;
$$;

revoke all on function public.consume_signup_attempt(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_signup_attempt(text, integer, integer)
  to service_role;

-- --------------------------------------------------------------- search
-- Trigram-backed, bilingual substring search over headlines + summaries.
-- Returns whole cluster rows so the app can render normal cards.
create or replace function public.search_clusters(
  p_query text,
  p_category text default null,
  p_limit integer default 30
)
returns setof public.clusters
language sql
stable
security definer
set search_path = public
as $$
  select c.*
  from public.clusters c
  where char_length(btrim(p_query)) >= 2
    and c.last_published_at >= now() - interval '48 hours'
    and (p_category is null or c.category = p_category)
    and (
      position(lower(btrim(p_query)) in lower(c.title)) > 0
      or position(lower(btrim(p_query)) in lower(coalesce(c.summary, ''))) > 0
    )
    and (c.distinct_source_count >= 2 or c.trust_weight_sum >= 4)
  order by
    case
      when position(lower(btrim(p_query)) in lower(c.title)) > 0 then 0
      else 1
    end,
    similarity(c.title, btrim(p_query)) desc,
    c.popular_score desc,
    c.last_published_at desc
  limit least(greatest(p_limit, 1), 50);
$$;

grant execute on function public.search_clusters(text, text, integer)
  to anon, authenticated;

-- --------------------------------------------------------------- views
-- Public editorial view: only clusters that pass the thin-content guard.
create or replace view public.v_indexable_clusters
with (security_invoker = true)
as
select c.*
from public.clusters c
where c.distinct_source_count >= 2
   or (c.editor_note is not null and btrim(c.editor_note) <> '');

-- --------------------------------------------------------------- triggers
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sources_touch_updated_at on public.sources;
create trigger sources_touch_updated_at
  before update on public.sources
  for each row execute function public.touch_updated_at();

drop trigger if exists clusters_touch_updated_at on public.clusters;
create trigger clusters_touch_updated_at
  before update on public.clusters
  for each row execute function public.touch_updated_at();

drop trigger if exists daily_notes_touch_updated_at on public.daily_notes;
create trigger daily_notes_touch_updated_at
  before update on public.daily_notes
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------- RLS
alter table public.sources enable row level security;
alter table public.clusters enable row level security;
alter table public.articles enable row level security;
alter table public.subscribers enable row level security;
alter table public.daily_notes enable row level security;

-- The edition is public read-only. Writes happen exclusively through the
-- service-role key in the ingest runner, which bypasses RLS.
drop policy if exists "sources are public" on public.sources;
create policy "sources are public"
  on public.sources for select
  to anon, authenticated
  using (true);

drop policy if exists "clusters are public" on public.clusters;
create policy "clusters are public"
  on public.clusters for select
  to anon, authenticated
  using (true);

drop policy if exists "articles are public" on public.articles;
create policy "articles are public"
  on public.articles for select
  to anon, authenticated
  using (true);

drop policy if exists "daily notes are public" on public.daily_notes;
create policy "daily notes are public"
  on public.daily_notes for select
  to anon, authenticated
  using (true);

-- No policies on subscribers: only the service role may read or write them.

grant usage on schema public to anon, authenticated;
grant select on public.sources, public.clusters, public.articles to anon, authenticated;
grant select on public.daily_notes to anon, authenticated;
grant select, insert, update, delete on public.sources, public.clusters, public.articles
  to service_role;
grant select, insert, update, delete on public.daily_notes to service_role;
grant select, insert, update, delete on public.subscribers to service_role;
grant select, insert, update, delete on public.signup_rate_limits to service_role;
