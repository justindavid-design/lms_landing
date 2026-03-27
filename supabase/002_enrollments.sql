-- Persistent course enrollments

create table if not exists enrollments (
  id uuid default gen_random_uuid() primary key,
  course_id uuid not null references courses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text default 'student',
  created_at timestamptz default now(),
  unique (course_id, user_id)
);

create index if not exists idx_enrollments_user_id on enrollments(user_id);
create index if not exists idx_enrollments_course_id on enrollments(course_id);