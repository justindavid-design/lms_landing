-- Supabase init SQL: create core tables for LMS
-- Note: Supabase provides `auth.users`; we create `profiles` linked to that

create table if not exists profiles (
  id uuid references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  role text default 'student',
  created_at timestamptz default now(),
  primary key (id)
);

create table if not exists courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  course_code text unique,
  slug text unique not null,
  description text,
  author uuid references profiles(id),
  published boolean default false,
  created_at timestamptz default now()
);

create table if not exists quizzes (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  meta jsonb,
  created_at timestamptz default now()
);

create table if not exists questions (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references quizzes(id) on delete cascade,
  text text not null,
  type text default 'single-choice',
  meta jsonb,
  created_at timestamptz default now()
);

create table if not exists options (
  id uuid default gen_random_uuid() primary key,
  question_id uuid references questions(id) on delete cascade,
  text text not null,
  is_correct boolean default false
);

create table if not exists attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  quiz_id uuid references quizzes(id),
  started_at timestamptz default now(),
  finished_at timestamptz,
  score numeric
);

create table if not exists attempt_answers (
  id uuid default gen_random_uuid() primary key,
  attempt_id uuid references attempts(id) on delete cascade,
  question_id uuid references questions(id),
  option_id uuid references options(id),
  raw_answer jsonb
);
