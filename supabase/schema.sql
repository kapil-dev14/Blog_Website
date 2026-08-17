-- Run this in Supabase → SQL Editor
-- Safe to re-run: uses "if not exists" everywhere.

-- ============================================================
-- POSTS — replaces the old content/posts/*.md files.
-- Written and edited from your site's /admin dashboard.
-- ============================================================
create table if not exists posts (
  id bigint generated always as identity primary key,
  slug text not null unique,               -- becomes the URL: /blog/<slug>
  title text not null,
  summary text default '',
  content_html text not null default '',   -- written with the rich text editor in /admin
  cover_image text default '',
  author text default 'You',
  category text not null default 'essay',  -- 'poem' | 'novel' | 'essay' | 'note'
  published boolean not null default true,
  published_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_posts_published on posts (published, published_at desc);
create index if not exists idx_posts_category on posts (category);

alter table posts enable row level security;

-- Anyone (including anonymous visitors) can read published posts.
drop policy if exists "Public read published posts" on posts;
create policy "Public read published posts" on posts
  for select using (published = true);

-- No public insert/update/delete policy is created on purpose —
-- the /admin dashboard writes using the SUPABASE_SERVICE_ROLE_KEY
-- from a server-only API route, which bypasses RLS entirely.
-- The anon key (used by the public site) can never create/edit/delete posts.

-- ============================================================
-- LIKES (unchanged)
-- ============================================================
create table if not exists likes (
  id bigint generated always as identity primary key,
  post_slug text not null,
  visitor_id text not null,     -- random id stored in visitor's browser (localStorage)
  created_at timestamptz default now(),
  unique (post_slug, visitor_id)  -- prevents the same visitor liking twice
);

create index if not exists idx_likes_post_slug on likes (post_slug);
alter table likes enable row level security;

drop policy if exists "Public read likes" on likes;
create policy "Public read likes" on likes for select using (true);
drop policy if exists "Public insert likes" on likes;
create policy "Public insert likes" on likes for insert with check (true);

-- ============================================================
-- COMMENTS (unchanged)
-- ============================================================
create table if not exists comments (
  id bigint generated always as identity primary key,
  post_slug text not null,
  author_name text not null,
  content text not null,
  approved boolean default true,  -- set default false if you want to moderate before publishing
  created_at timestamptz default now()
);

create index if not exists idx_comments_post_slug on comments (post_slug);
alter table comments enable row level security;

drop policy if exists "Public read comments" on comments;
create policy "Public read comments" on comments for select using (approved = true);
drop policy if exists "Public insert comments" on comments;
create policy "Public insert comments" on comments for insert with check (true);

-- ============================================================
-- STORAGE — bucket for cover images + in-post images uploaded
-- from the /admin editor. Run this section too.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read post images" on storage.objects;
create policy "Public read post images" on storage.objects
  for select using (bucket_id = 'post-images');

-- No public write policy — uploads go through the server-only
-- /api/admin/upload route using the service role key.
