-- Optional course metadata shown on the create/edit course form.
-- Title and slug have been removed as required fields in the API and database.

alter table if exists courses
  add column if not exists section text,
  add column if not exists level text,
  add column if not exists subject text;
