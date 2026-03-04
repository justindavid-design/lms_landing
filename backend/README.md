Supabase backend — setup
========================

This project uses Supabase for database and auth. The frontend is in this repo; the backend uses Supabase for data and small serverless API endpoints in `/api/` for business logic.

Quick setup
-----------
1. Create a Supabase project at https://app.supabase.com
2. In your Supabase project, go to SQL Editor and run the migration in `supabase/001_init.sql`.
3. In Supabase → Settings → API, copy the `URL` and `anon`/`service_role` keys.
4. In this repo, create a `.env` with the values shown in `.env.example`.
5. To use server-side endpoints (in `/api`), set `SUPABASE_SERVICE_ROLE_KEY` as an environment variable in your deployment (Vercel secret).

Local testing
-------------
- Install Vercel CLI to run serverless functions locally:

```bash
npm i -g vercel
vercel dev
```

Security notes
--------------
- Use `anon` key only on the client; use `SERVICE_ROLE` key only on server-side endpoints and keep it secret.
- Supabase provides built-in auth; prefer using Supabase Auth for register/login and use RLS policies for row-level security.

Serverless endpoints
--------------------
This scaffold includes simple serverless endpoints under `/api/`:

- `GET /api/courses` and `POST /api/courses`
- `GET /api/quizzes` and `POST /api/quizzes`
- `GET|POST|PUT /api/profiles` — manage `profiles` linked to `auth.users`.

Notes:
- The `/api/*` functions use the `SUPABASE_SERVICE_ROLE_KEY` and therefore have elevated privileges; treat them as server-only and do not expose the service role key to clients.
- For most client features (signup/login), use Supabase Auth on the frontend and then create a profile server-side (or use a Supabase Auth trigger) to initialize `profiles` rows.

Example: create or update profile from client after sign-up

```js
// client-side (after successful sign-up), use anon key
import supabase from '../src/lib/supabaseClient';

const user = supabase.auth.user();
fetch('/api/profiles', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ id: user.id, display_name: user.email })
});
```

