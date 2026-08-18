-- Run this once in Supabase → SQL Editor if you already ran schema.sql before.
-- Safe to re-run.

alter table posts add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(regexp_replace(content_html, '<[^>]+>', ' ', 'g'), '')), 'C')
  ) stored;

create index if not exists idx_posts_search on posts using gin (search_vector);
