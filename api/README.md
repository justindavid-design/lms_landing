API endpoints (serverless)
==========================

These endpoints are small serverless functions that call Supabase.
They live under `/api/` and are suitable for Vercel deployment. They expect the following environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Endpoints added in this scaffold:

- `GET /api/courses` — list public courses
- `POST /api/courses` — create a course (requires service role key)
- `GET /api/quizzes?courseId=<id>` — list quizzes for a course
- `POST /api/quizzes` — create a quiz

Usage notes
-----------
- For server-side operations, use the `SUPABASE_SERVICE_ROLE_KEY`. Keep it secret.
- For client-side usage, prefer using Supabase client with `anon` key and RLS policies.
