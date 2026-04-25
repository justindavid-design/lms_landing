import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/*
 ─────────────────────────────────────────────
  SUPABASE SQL SCHEMA  (run in SQL editor)
 ─────────────────────────────────────────────

create table quizzes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  title       text not null,
  subject     text,
  teacher_id  uuid references auth.users(id) on delete cascade
);

create table questions (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid references quizzes(id) on delete cascade,
  position    int not null default 0,
  text        text not null,
  options     jsonb not null,   -- string[]
  correct     int  not null     -- index into options
);

create table attempts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  quiz_id     uuid references quizzes(id) on delete cascade,
  student_id  uuid references auth.users(id) on delete cascade,
  score       int,
  total       int,
  answers     jsonb   -- { questionId, chosen, correct, isCorrect }[]
);

-- Row-level security (enable on all tables)
alter table quizzes   enable row level security;
alter table questions enable row level security;
alter table attempts  enable row level security;

-- Policies (adjust to your auth model)
create policy "Teachers manage own quizzes"
  on quizzes for all using (auth.uid() = teacher_id);

create policy "Anyone reads quizzes"
  on quizzes for select using (true);

create policy "Questions follow quiz access"
  on questions for all using (
    exists (select 1 from quizzes where id = quiz_id and teacher_id = auth.uid())
  );

create policy "Anyone reads questions"
  on questions for select using (true);

create policy "Students manage own attempts"
  on attempts for all using (auth.uid() = student_id);
*/
