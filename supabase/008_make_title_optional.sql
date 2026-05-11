-- Make title optional on courses table
-- This allows creating courses without a title

alter table if exists courses
  alter column title drop not null;
