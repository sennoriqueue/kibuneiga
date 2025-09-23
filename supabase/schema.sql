-- Supabase schema for キブンエイガ MVP
-- Execute in Supabase SQL editor or CLI

-- Profiles (optional extension of auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  age_range text,
  favorite_genres text[] default '{}',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Favorites
create table if not exists public.favorites (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  movie_id bigint not null,
  movie_title text not null,
  poster_path text,
  created_at timestamptz default now()
);

-- Reviews
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  movie_id bigint not null,
  rating int check (rating between 1 and 5) not null,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure one review per user per movie
create unique index if not exists reviews_user_movie_unique on public.reviews(user_id, movie_id);

-- Watch history
create table if not exists public.watch_history (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  movie_id bigint not null,
  watched_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;
alter table public.watch_history enable row level security;

-- Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
-- Allow public read for nickname display (prototype scope)
create policy "Profiles viewable by all" on public.profiles
  for select using (true);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Favorites are viewable by owner" on public.favorites
  for select using (auth.uid() = user_id);
create policy "Insert favorites by owner" on public.favorites
  for insert with check (auth.uid() = user_id);
create policy "Delete favorites by owner" on public.favorites
  for delete using (auth.uid() = user_id);

create policy "Reviews viewable by all" on public.reviews for select using (true);
create policy "Insert reviews by owner" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Update/Delete own reviews" on public.reviews for update using (auth.uid() = user_id);
create policy "Delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

create policy "Watch history by owner" on public.watch_history for select using (auth.uid() = user_id);
create policy "Insert watch history by owner" on public.watch_history for insert with check (auth.uid() = user_id);
