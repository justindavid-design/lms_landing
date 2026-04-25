import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuizList    from './QuizList';
import QuizBuilder from './QuizBuilder';
import QuizPlayer  from './QuizPlayer';
import QuizResults from './QuizResults';

/**
 * QuizMaker — drop this inside your app's <Routes> or wrap it
 * with a <BrowserRouter> / <MemoryRouter> if isolated.
 *
 * Props:
 *   teacherId  {string} — current logged-in teacher's user ID (from Supabase Auth)
 *   studentId  {string} — current logged-in student's user ID
 *   basePath   {string} — mount prefix, default "/quizzes"
 *
 * Usage inside your existing router:
 *   <Route path="/quizzes/*" element={<QuizMaker teacherId={user.id} />} />
 */
export default function QuizMaker({ teacherId, studentId, basePath = '/quizzes' }) {
  return (
    <Routes>
      <Route index                    element={<QuizList   teacherId={teacherId} />} />
      <Route path="new"               element={<QuizBuilder teacherId={teacherId} />} />
      <Route path=":id/edit"          element={<QuizBuilder teacherId={teacherId} />} />
      <Route path=":id/play"          element={<QuizPlayer  studentId={studentId} />} />
      <Route path=":id/results"       element={<QuizResults studentId={studentId} />} />
      <Route path="*"                 element={<Navigate to={basePath} replace />} />
    </Routes>
  );
}
