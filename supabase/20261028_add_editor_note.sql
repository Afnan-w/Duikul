-- Migration: add editor_note to clusters
-- Run: supabase db push  (or paste into the SQL editor)
--
-- An editor_note is a short human-written note attached to a cluster. When
-- present, the cluster is treated as INDEXABLE even if it has fewer than
-- 2 distinct sources (thin-content guard). This lets editors surface a
-- story that only one outlet has run, with our commentary explaining why
-- it matters / what else to watch for.

begin;

alter table clusters
  add column if not exists editor_note text;

-- Index to make the "has editor note" check cheap in the indexable view.
create index if not exists idx_clusters_editor_note
  on clusters using btree (editor_note)
  where editor_note is not null and editor_note <> '';

commit;
