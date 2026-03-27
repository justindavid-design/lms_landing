-- Classroom workflow tables for modules, assignments, submissions, and notifications

create table if not exists course_modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  position integer default 0,
  published boolean default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table if exists quizzes
add column if not exists description text;

alter table if exists quizzes
add column if not exists published boolean default false;

create table if not exists assignments (
  id uuid default gen_random_uuid() primary key,
  course_id uuid not null references courses(id) on delete cascade,
  module_id uuid references course_modules(id) on delete set null,
  quiz_id uuid references quizzes(id) on delete set null,
  kind text not null default 'assignment',
  title text not null,
  instructions text,
  status text not null default 'draft',
  due_at timestamptz,
  attachment_url text,
  link_url text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists submissions (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  content text,
  attachment_url text,
  status text not null default 'assigned',
  submitted_at timestamptz,
  graded_at timestamptz,
  score numeric,
  feedback text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (assignment_id, student_id)
);

create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  type text default 'general',
  title text not null,
  body text,
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_course_modules_course_id on course_modules(course_id);
create index if not exists idx_assignments_course_id on assignments(course_id);
create index if not exists idx_assignments_due_at on assignments(due_at);
create index if not exists idx_submissions_assignment_id on submissions(assignment_id);
create index if not exists idx_submissions_student_id on submissions(student_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_course_id on notifications(course_id);
