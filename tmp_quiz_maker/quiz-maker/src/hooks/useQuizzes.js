import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useQuizzes — CRUD hook for quizzes + questions.
 * Pass teacherId to scope reads/writes to the logged-in teacher.
 */
export function useQuizzes(teacherId = null) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('quizzes')
        .select('*, questions(*)')
        .order('created_at', { ascending: false });

      if (teacherId) query = query.eq('teacher_id', teacherId);

      const { data, error: err } = await query;
      if (err) throw err;

      // Sort questions by position within each quiz
      const sorted = (data || []).map((q) => ({
        ...q,
        questions: [...(q.questions || [])].sort((a, b) => a.position - b.position),
      }));
      setQuizzes(sorted);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  /**
   * Create a new quiz with its questions in one go.
   * @param {{ title, subject, questions: { text, options, correct }[] }} payload
   */
  const createQuiz = async (payload) => {
    const { title, subject, questions } = payload;
    const { data: quiz, error: qErr } = await supabase
      .from('quizzes')
      .insert({ title, subject, teacher_id: teacherId })
      .select()
      .single();
    if (qErr) throw qErr;

    const rows = questions.map((q, i) => ({
      quiz_id: quiz.id,
      position: i,
      text: q.text,
      options: q.options,
      correct: q.correct,
    }));
    const { error: rErr } = await supabase.from('questions').insert(rows);
    if (rErr) throw rErr;

    await fetchQuizzes();
    return quiz;
  };

  /**
   * Update an existing quiz and replace all its questions.
   */
  const updateQuiz = async (id, payload) => {
    const { title, subject, questions } = payload;
    const { error: uErr } = await supabase
      .from('quizzes')
      .update({ title, subject })
      .eq('id', id);
    if (uErr) throw uErr;

    // Replace all questions
    await supabase.from('questions').delete().eq('quiz_id', id);
    const rows = questions.map((q, i) => ({
      quiz_id: id,
      position: i,
      text: q.text,
      options: q.options,
      correct: q.correct,
    }));
    const { error: rErr } = await supabase.from('questions').insert(rows);
    if (rErr) throw rErr;

    await fetchQuizzes();
  };

  const deleteQuiz = async (id) => {
    const { error: dErr } = await supabase.from('quizzes').delete().eq('id', id);
    if (dErr) throw dErr;
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  return { quizzes, loading, error, createQuiz, updateQuiz, deleteQuiz, refetch: fetchQuizzes };
}

/**
 * useSaveAttempt — saves a completed quiz attempt to Supabase.
 */
export function useSaveAttempt() {
  const saveAttempt = async ({ quizId, studentId, score, total, answers }) => {
    const { error } = await supabase.from('attempts').insert({
      quiz_id: quizId,
      student_id: studentId,
      score,
      total,
      answers,
    });
    if (error) console.error('Failed to save attempt:', error.message);
  };
  return { saveAttempt };
}
