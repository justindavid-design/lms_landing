import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Edit2, Trash2, PlayCircle, AlertCircle } from 'lucide-react';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import { useQuizzes } from '../../hooks/useQuizzes';

export default function QuizList({ teacherId }) {
  const navigate = useNavigate();
  const { quizzes, loading, error, deleteQuiz } = useQuizzes(teacherId);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteQuiz(id);
    } catch (e) {
      alert('Failed to delete: ' + e.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1a3a28] flex items-center justify-center">
            <SchoolIcon style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Quiz Maker</h1>
            <p className="text-xs text-gray-500">Adaptive AI feedback for every student</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/quizzes/new')}
          className="flex items-center gap-2 bg-[#1a3a28] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#152e20] transition-colors"
        >
          <Plus size={15} />
          New quiz
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-[#1a3a28] rounded-full animate-spin mr-3" />
          Loading quizzes…
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {!loading && !error && quizzes.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
          <QuizIcon style={{ fontSize: 40, color: '#d1d5db', marginBottom: 12 }} />
          <p className="font-medium text-gray-400">No quizzes yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first quiz to get started</p>
          <button
            onClick={() => navigate('/quizzes/new')}
            className="mt-4 text-sm text-[#1a3a28] font-medium underline underline-offset-2 hover:text-[#152e20]"
          >
            Create a quiz
          </button>
        </div>
      )}

      {/* Quiz cards */}
      <div className="flex flex-col gap-3">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
                <BookOpen size={16} className="text-[#27500A]" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{quiz.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {quiz.subject} · {quiz.questions?.length ?? 0} question{quiz.questions?.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate(`/quizzes/${quiz.id}/edit`)}
                className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 size={13} /> Edit
              </button>
              <button
                onClick={() => handleDelete(quiz.id, quiz.title)}
                className="flex items-center gap-1.5 text-xs text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
              <button
                onClick={() => navigate(`/quizzes/${quiz.id}/play`)}
                className="flex items-center gap-1.5 text-xs text-white bg-[#1a3a28] px-3 py-1.5 rounded-lg hover:bg-[#152e20] transition-colors"
              >
                <PlayCircle size={13} /> Start
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
