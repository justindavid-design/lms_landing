import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ChevronLeft, Save } from 'lucide-react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useQuizzes } from '../../hooks/useQuizzes';

const emptyQuestion = () => ({
  text: '',
  options: ['', '', '', ''],
  correct: 0,
});

export default function QuizBuilder({ teacherId }) {
  const navigate = useNavigate();
  const { id } = useParams();            // present when editing
  const isEditing = Boolean(id);

  const { quizzes, createQuiz, updateQuiz } = useQuizzes(teacherId);

  const [title, setTitle]     = useState('');
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});

  // Populate form when editing
  useEffect(() => {
    if (!isEditing) return;
    const quiz = quizzes.find((q) => q.id === id);
    if (!quiz) return;
    setTitle(quiz.title);
    setSubject(quiz.subject || '');
    setQuestions(
      quiz.questions.map((q) => ({
        text: q.text,
        options: q.options,
        correct: q.correct,
      }))
    );
  }, [id, quizzes, isEditing]);

  // ── question helpers ──────────────────────────────────
  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const removeQuestion = (idx) =>
    setQuestions((prev) => prev.filter((_, i) => i !== idx));

  const updateQuestion = (idx, field, value) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );

  const updateOption = (qIdx, optIdx, value) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, j) => (j === optIdx ? value : o)) }
          : q
      )
    );

  // ── validation ────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Quiz title is required';
    questions.forEach((q, i) => {
      if (!q.text.trim()) errs[`q${i}_text`] = 'Question text required';
      q.options.forEach((o, j) => {
        if (!o.trim()) errs[`q${i}_opt${j}`] = 'Option required';
      });
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── save ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEditing) {
        await updateQuiz(id, { title, subject, questions });
      } else {
        await createQuiz({ title, subject, questions });
      }
      navigate('/quizzes');
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/quizzes')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-base font-semibold text-gray-900">
          {isEditing ? 'Edit quiz' : 'New quiz'}
        </h1>
      </div>

      {/* Quiz meta */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Quiz title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chapter 3 — Photosynthesis"
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1a3a28]/20 focus:border-[#1a3a28] transition ${
              errors.title ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Subject / topic</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Biology, Grade 10"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1a3a28]/20 focus:border-[#1a3a28] transition"
          />
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, qIdx) => (
        <div key={qIdx} className="bg-white border border-gray-200 rounded-2xl p-5 mb-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Question {qIdx + 1}
            </span>
            {questions.length > 1 && (
              <button
                onClick={() => removeQuestion(qIdx)}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={13} /> Remove
              </button>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Question text *</label>
            <textarea
              rows={2}
              value={q.text}
              onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
              placeholder="Type your question here…"
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-[#1a3a28]/20 focus:border-[#1a3a28] transition ${
                errors[`q${qIdx}_text`] ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors[`q${qIdx}_text`] && (
              <p className="text-xs text-red-500 mt-1">{errors[`q${qIdx}_text`]}</p>
            )}
          </div>

          <label className="block text-xs font-medium text-gray-500 mb-2">
            Answer choices — click the icon to mark correct
          </label>
          {q.options.map((opt, oIdx) => (
            <div key={oIdx} className="flex items-center gap-2 mb-2">
              <button
                onClick={() => updateQuestion(qIdx, 'correct', oIdx)}
                className="flex-shrink-0 text-[#1a3a28]"
              >
                {q.correct === oIdx ? (
                  <CheckCircleIcon style={{ fontSize: 20 }} />
                ) : (
                  <RadioButtonUncheckedIcon style={{ fontSize: 20, color: '#9ca3af' }} />
                )}
              </button>
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                className={`flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1a3a28]/20 focus:border-[#1a3a28] transition ${
                  errors[`q${qIdx}_opt${oIdx}`] ? 'border-red-300' : 'border-gray-200'
                }`}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Add question */}
      <button
        onClick={addQuestion}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl py-3 text-sm text-gray-400 hover:border-[#1a3a28] hover:text-[#1a3a28] transition-colors mb-5"
      >
        <Plus size={16} /> Add question
      </button>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => navigate('/quizzes')}
          className="px-5 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 text-sm bg-[#1a3a28] text-white rounded-lg hover:bg-[#152e20] disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {saving ? 'Saving…' : 'Save quiz'}
        </button>
      </div>
    </div>
  );
}
