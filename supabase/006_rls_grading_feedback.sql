-- RLS hardening for grading, submissions, grades, and notifications.
-- Apply after 001_init.sql, 002_enrollments.sql, and 004_classroom_workflow.sql.

create table if not exists grades (
  id uuid default gen_random_uuid() primary key,
  course_id uuid not null references courses(id) on delete cascade,
  assignment_id uuid not null references assignments(id) on delete cascade,
  submission_id uuid references submissions(id) on delete set null,
  student_id uuid not null references profiles(id) on delete cascade,
  score numeric,
  feedback text,
  suggested_review text,
  returned_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (assignment_id, student_id)
);

create index if not exists idx_grades_course_id on grades(course_id);
create index if not exists idx_grades_assignment_id on grades(assignment_id);
create index if not exists idx_grades_student_id on grades(student_id);

create or replace function public.is_course_teacher(target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from courses c
    where c.id = target_course_id
      and c.author = auth.uid()
  );
$$;

create or replace function public.is_assignment_teacher(target_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from assignments a
    join courses c on c.id = a.course_id
    where a.id = target_assignment_id
      and c.author = auth.uid()
  );
$$;

alter table submissions enable row level security;
alter table grades enable row level security;
alter table notifications enable row level security;

drop policy if exists "Students can insert own submissions" on submissions;
drop policy if exists "Students can update own submissions" on submissions;
drop policy if exists "Students and teachers can read submissions" on submissions;
drop policy if exists "Teachers can grade submissions" on submissions;

create policy "Students can insert own submissions"
on submissions
for insert
to authenticated
with check (student_id = auth.uid());

create policy "Students can update own ungraded submissions"
on submissions
for update
to authenticated
using (
  student_id = auth.uid()
  and graded_at is null
  and coalesce(status, 'assigned') <> 'graded'
)
with check (
  student_id = auth.uid()
  and graded_at is null
  and coalesce(status, 'assigned') <> 'graded'
);

create policy "Students and teachers can read submissions"
on submissions
for select
to authenticated
using (
  student_id = auth.uid()
  or public.is_assignment_teacher(assignment_id)
);

-- Teachers should grade through the service-role API or the grades table.
-- No authenticated client-side teacher UPDATE policy is created for submissions,
-- so students cannot spoof grading fields and teachers cannot bypass API auditing.

drop policy if exists "Teachers can insert grades" on grades;
drop policy if exists "Teachers can update grades" on grades;
drop policy if exists "Students and teachers can read grades" on grades;

create policy "Teachers can insert grades"
on grades
for insert
to authenticated
with check (
  public.is_course_teacher(course_id)
  and created_by = auth.uid()
  and exists (
    select 1
    from assignments a
    where a.id = grades.assignment_id
      and a.course_id = grades.course_id
  )
);

create policy "Teachers can update grades"
on grades
for update
to authenticated
using (public.is_course_teacher(course_id))
with check (
  public.is_course_teacher(course_id)
  and exists (
    select 1
    from assignments a
    where a.id = grades.assignment_id
      and a.course_id = grades.course_id
  )
);

create policy "Students and teachers can read grades"
on grades
for select
to authenticated
using (
  student_id = auth.uid()
  or public.is_course_teacher(course_id)
);

drop policy if exists "Users can read own notifications" on notifications;
drop policy if exists "Users can update own notifications" on notifications;
drop policy if exists "Users can delete own notifications" on notifications;
drop policy if exists "Teachers can create course notifications" on notifications;

create policy "Users can read own notifications"
on notifications
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can update own notifications"
on notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own notifications"
on notifications
for delete
to authenticated
using (user_id = auth.uid());

create policy "Teachers can create course notifications"
on notifications
for insert
to authenticated
with check (
  user_id is not null
  and (
    course_id is null
    or public.is_course_teacher(course_id)
  )
);
