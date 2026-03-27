-- Add optional cover image URL for course cards

alter table if exists courses
add column if not exists cover_url text;
