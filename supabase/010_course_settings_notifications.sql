-- Add course settings fields and notifications table

-- Add course settings columns
alter table if exists courses
  add column if not exists grading_scale text default 'percentage',
  add column if not exists enrollment_status text default 'open',
  add column if not exists visibility text default 'students_only';

-- Create notifications table if it doesn't exist
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete set null,
  type text not null,
  title text,
  body text,
  content text,
  metadata jsonb default '{}',
  is_read boolean default false,
  read boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create index on notifications for faster queries
create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists notifications_course_id_idx on notifications(course_id);
create index if not exists notifications_created_at_idx on notifications(created_at desc);

-- Enable RLS on notifications table
alter table notifications enable row level security;

-- Users can only see their own notifications
create policy "Users can view their own notifications" on notifications
  for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications" on notifications
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notifications" on notifications
  for delete
  using (auth.uid() = user_id);

-- Allow service role to create notifications
create policy "Service role can create notifications" on notifications
  for insert
  with check (true);
