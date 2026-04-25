# Quiz Maker — LMS Integration

Adaptive AI-powered quiz module built with React, Tailwind CSS, Supabase, Lucide React, Material-UI Icons, React Router DOM, and Nodemailer.

---

## Project structure

```
src/
  components/QuizMaker/
    index.jsx          ← router entry (drop into your <Routes>)
    QuizList.jsx       ← quiz dashboard
    QuizBuilder.jsx    ← create / edit quizzes
    QuizPlayer.jsx     ← live quiz-taking screen
    QuizResults.jsx    ← score + AI feedback + email report
    AdaptiveFeedback.jsx ← reusable feedback bubble
  hooks/
    useQuizzes.js      ← Supabase CRUD hook
  lib/
    supabase.js        ← Supabase client + SQL schema (in comments)
    claude.js          ← Anthropic API helpers
api/
  sendQuizReport.js    ← Express route (Nodemailer)
.env.example
```

---

## 1. Install dependencies

```bash
# Core
npm install react-router-dom @supabase/supabase-js

# Icons
npm install lucide-react @mui/icons-material @mui/material @emotion/react @emotion/styled

# Backend (Node/Express)
npm install nodemailer express
```

---

## 2. Set up Supabase

1. Create a project at https://supabase.com
2. Open the SQL editor and run the schema found in `src/lib/supabase.js` (in the block comment at the bottom of that file)
3. Copy your Project URL and anon key into `.env`

---

## 3. Configure environment

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ANTHROPIC_API_KEY
# For email: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
```

> **Security note:** Move `VITE_ANTHROPIC_API_KEY` to a backend proxy before going to production. The Vite prefix exposes it to the browser.

---

## 4. Add to your React app

```jsx
// App.jsx (already has BrowserRouter wrapping everything)
import { Route, Routes } from 'react-router-dom';
import QuizMaker from './components/QuizMaker';

function App() {
  const { user } = useSupabaseAuth(); // your auth hook

  return (
    <Routes>
      {/* ... your existing routes ... */}
      <Route
        path="/quizzes/*"
        element={
          <QuizMaker
            teacherId={user?.id}   // teacher creating quizzes
            studentId={user?.id}   // student taking quizzes
          />
        }
      />
    </Routes>
  );
}
```

---

## 5. Mount the Nodemailer API route (Express)

```js
// server.js
const express = require('express');
const sendQuizReport = require('./api/sendQuizReport');

const app = express();
app.use(express.json());
app.use('/api', sendQuizReport);
app.listen(3001);
```

---

## Tailwind config

Make sure `content` covers your component paths:

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

---

## Features

| Feature | Details |
|---|---|
| Quiz builder | Title, subject, unlimited multiple-choice questions |
| Quiz player | Progress bar, question chips, answer reveal |
| Per-question AI feedback | Claude generates 2–3 sentence adaptive response per answer |
| End-of-quiz AI feedback | Personalized summary mentioning specific missed topics |
| Attempt saving | Score + full answer record saved to Supabase `attempts` table |
| Email report | Full HTML report emailed via Nodemailer SMTP |
| RLS | Supabase row-level security policies included |
