/*
 * KhoborDaily — database schema (Supabase / Postgres)
 * Run via `supabase db push` or in the SQL editor.
 *
 * Design notes
 *  - The app is a news *aggregator + verification layer*. We never store full
 *    article bodies from publishers; only headlines + a ~280-char snippet,
 *    attribution, and metadata we derived ourselves (first-reported order,
 *    confirmation status). This keeps content "thin-copy + data" and avoids
 *    the duplicated/thin-content trap.
 *  - `clusters` group distinct source articles about the same story. A
 *    cluster is INDEXABLE only if it has >= 2 distinct sources OR an
 *    `editor_note` (enforced in the app layer; see src/lib/db.ts).
 *  - `stories` are individual source-article rows referenced from a cluster.
 */

-- --------------------------------------------------------------- sources
create table if not exists sources (
  id          bigint primary key,
  slug        text unique not null,          -- e.g. "prothom-alo"
  name_bn     text not null,                 -- display name (Bangla)
  name_en     text,                          -- display name (English, optional)
  language    text not null check (language in ('bn','en')),
  category    text,                          -- e.g. "newspaper", "tv", "wire"
  country     text not null default 'BD',
  trust_weight real not null default 1.0 check (trust_weight >= 0), -- 0..1, used in confirmation scoring
  home_url    text not null,
  feed_url    text,                          -- RSS/Atom feed, if any
  logo_url    text,
  about_bn    text,                          -- 2-3 factual sentences about the outlet (Bangla)
  about_en    text,                          -- 2-3 factual sentences about the outlet (English)
  created_at  timestamp with time zone default now(),
  updated_at  timestamp with time zone default now()
);

-- --------------------------------------------------------------- clusters
create table if not exists clusters (
  id            bigint primary key,
  short_id      text unique not null,        -- short human slug, e.g. "c-9f3a"
  topic         text not null,               -- high-level topic label (we use it for related stories)
  section       text not null check (section in ('deshi','bideshi')),
  headline_bn   text not null,               -- canonical headline chosen by us (Bangla, from first/headline source)
  headline_en   text,                        -- canonical headline (English)
  slug          text not null,               -- ascii slug for /story/{shortid}-{slug}
  snippet_bn    text,                        -- <=280 chars, our summary line (Bangla)
  snippet_en    text,                        -- <=280 chars, our summary line (English)
  first_reported_at timestamptz,              -- earliest published_at among its stories
  confirmed     boolean not null default false,  -- >=2 distinct sources agree
  editor_note   text,                        -- nullable; a short human note. Makes the cluster INDEXABLE even at 1 source.
  published_at  timestamptz not null,        -- story "happened / was reported" time (>= first_reported_at)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  full_text_ts  tsvector,                    -- for matching; headline+snippet only, never publisher body
  removed_at    timestamptz,                 -- soft-delete: stories are removed after 14 days -> 410
  constraint clusters_published_gte_first check (published_at >= first_reported_at)
);

-- story <-> cluster membership (a cluster points at its source articles)
create table if not exists cluster_stories (
  cluster_id  bigint references clusters(id) on delete cascade,
  story_id    bigint references stories(id) on delete cascade,
  outlet_order int not null,                 -- 0 = first to report, 1 = second, ...
  primary key (cluster_id, story_id)
);

create index if not exists idx_cluster_stories_cluster on cluster_stories(cluster_id);
create index if not exists idx_cluster_stories_order on cluster_stories(cluster_id, outlet_order);

-- --------------------------------------------------------------- stories
create table if not exists stories (
  id            bigint primary key,
  cluster_id    bigint references clusters(id) on delete set null,
  source_id     bigint references sources(id),
  url           text not null unique,        -- canonical link-out to the publisher
  headline_bn   text not null,
  headline_en   text,
  snippet       text,                        -- publisher's own snippet / our <=280 truncation
  published_at  timestamptz,                 -- when the *publisher* published it
  fetched_at    timestamptz default now(),   -- when we ingested it
  trust_weight  real not null default 1.0,
  removed_at    timestamptz,                 -- soft-delete marker for 410 after 14d
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_stories_cluster on stories(cluster_id);
create index if not exists idx_stories_url on stories(url);
create index if not exists idx_stories_published on stories(published_at desc);
create index if not exists idx_stories_source on stories(source_id);

-- --------------------------------------------------------------- daily briefings
create table if not exists daily_notes (
  day           date primary key,            -- e.g. 2026-10-28
  editor_note   text,                        -- nullable human-written note for the daily page
  published_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- --------------------------------------------------------------- helper views

-- A cluster is indexable if it has 2+ distinct sources OR an editor_note.
create or replace view v_indexable_clusters as
  select c.id, c.short_id, c.slug, c.section, c.headline_bn, c.headline_en,
         c.snippet_bn, c.snippet_en, c.published_at, c.first_reported_at,
         c.confirmed, c.editor_note, c.removed_at,
         count(distinct cs.story_id) as source_count
  from clusters c
  left join cluster_stories cs on cs.cluster_id = c.id
  where c.removed_at is null
  group by c.id
  having (count(distinct cs.story_id) >= 2) or (c.editor_note is not null and c.editor_note <> '');

-- Source articles for an indexable cluster, in reporting order.
create or replace view v_cluster_sources_ordered as
  select
    cs.cluster_id,
    cs.outlet_order,
    s.id         as story_id,
    s.source_id,
    s.url,
    s.headline_bn,
    s.headline_en,
    s.snippet,
    s.published_at
  from cluster_stories cs
  join stories s on s.id = cs.story_id
  order by cs.cluster_id, cs.outlet_order;
