-- Run once in the Supabase SQL editor.
-- Tables are readable by anonymous visitors; counters can only move through the
-- SECURITY DEFINER functions below, so nobody can set an arbitrary view/like count.

create table if not exists post_stats (
  slug  text primary key,
  views bigint not null default 0,
  likes bigint not null default 0
);

create table if not exists comments (
  id         bigserial primary key,
  slug       text not null,
  nickname   text not null check (char_length(nickname) between 1 and 20),
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists comments_slug_created_idx on comments (slug, created_at);

alter table post_stats enable row level security;
alter table comments   enable row level security;

drop policy if exists "stats are public" on post_stats;
create policy "stats are public" on post_stats
  for select to anon, authenticated using (true);

drop policy if exists "comments are public" on comments;
create policy "comments are public" on comments
  for select to anon, authenticated using (true);

drop policy if exists "anyone can comment" on comments;
create policy "anyone can comment" on comments
  for insert to anon, authenticated with check (true);

-- No update/delete policy: comments can only be removed from the Supabase dashboard.

create or replace function increment_view(p_slug text)
returns post_stats
language sql
security definer
set search_path = public
as $$
  insert into post_stats (slug, views) values (p_slug, 1)
  on conflict (slug) do update set views = post_stats.views + 1
  returning *;
$$;

-- p_delta is clamped to -1 / +1 so a crafted request cannot inflate the counter.
create or replace function bump_like(p_slug text, p_delta int)
returns bigint
language sql
security definer
set search_path = public
as $$
  insert into post_stats (slug, likes)
  values (p_slug, greatest(sign(p_delta)::int, 0))
  on conflict (slug) do update
    set likes = greatest(post_stats.likes + sign(p_delta)::int, 0)
  returning likes;
$$;

grant execute on function increment_view(text) to anon, authenticated;
grant execute on function bump_like(text, int) to anon, authenticated;
