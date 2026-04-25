import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useQuizzes } from '../../hooks/useQuizzes';
import { getQuestionFeedback } from '../../lib/claude';
import AdaptiveFeedback from './AdaptiveFeedback';

export default function QuizPlayer({ studentId, onComplete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quizzes } = useQuizzes();
  const quiz = quizzes.find((q) => q.id === id);

  const [currentQ, setCurrentQ]     = useState(0);
  const [chosen, setChosen]         = useState(null);    // index chosen this question
  const [answered, setAnswered]     = useState(false);
  const [feedback, setFeedback]     = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [answers, setAnswers]       = useState([]);
  const didFetch = useRef(false);

  useEffect(() => {
    setChosen(null);
    setAnswered(false);
    setFeedback('');
    didFetch.current = false;
  }, [currentQ]);

  if (!quiz) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-400">
        <p className="font-medium">Quiz not found.</p>
        <button onClick={() => navigate('/quizzes')} className="mt-3 text-sm underline text-[#1a3a28]">
          Back to quizzes
        </button>
      </div>
    );
  }

  const q     = quiz.questions[currentQ];
  const total = quiz.questions.length;
  const pct   = Math.round((currentQ / total) * 100);

  const handleSelect = async (optIdx) => {
    if (answered) return;
    setChosen(optIdx);
    setAnswered(true);

    const isCorrect = optIdx === q.correct;
    const record = { q, chosen: optIdx, isCorrect };
    setAnswers((prev) => [...prev, record]);

    // Fetch per-question adaptive feedback
    if (!didFetch.current) {
      didFetch.current = true;
      setFeedbackLoading(true);
      try {
        const fb = await getQuestionFeedback(q, optIdx, isCorrect, quiz.subject);
        setFeedback(fb);
      } catch {
        setFeedback('');
      } finally {
        setFeedbackLoading(false);
      }
    }
  };

  const handleNext = () => {
    if (currentQ < total - 1) {
      setCurrentQ((c) => c + 1);
    } else {
      // Quiz complete — pass answers up
      const finalAnswers = [...answers];
      const score = finalAnswers.filter((a) => a.isCorrect).length;
      if (onComplete) {
        onComplete({ quiz, answers: finalAnswers, score, total });
      } else {
        navigate(`/quizzes/${id}/results`, {
          state: { quiz, answers: finalAnswers, score, total, studentId },
        });
      }
    }
  };

  const optionStyle = (optIdx) => {
    const base =
      'w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer';
    if (!answered) {
      return base + ' border-gray-200 hover:border-[#1a3a28] hover:bg-[#f0f7f4]';
    }
    if (optIdx === q.correct) {
      return base + ' border-green-500 bg-[#EAF3DE] text-[#27500A] font-medium';
    }
    if (optIdx === chosen && !answers.at(-1)?.isCorrect) {
      return base + ' border-red-400 bg-[#FCEBEB] text-[#791F1F]';
    }
    return base + ' border-gray-100 text-gray-400';
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/quizzes')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ChevronLeft size={16} /> Quizzes
        </button>
        <span className="text-xs text-gray-400 font-medium">
          {currentQ + 1} / {total}
        </span>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-[#1a3a28] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Question chips */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {quiz.questions.map((_, i) => {
          const a = answers[i];
          let cls = 'w-7 h-7 rounded-full border text-xs font-medium flex items-center justify-center transition-all ';
          if (i === currentQ) cls += 'border-[#1a3a28] bg-[#1a3a28] text-white';
          else if (a && a.isCorrect) cls += 'border-green-400 bg-[#EAF3DE] text-[#27500A]';
          else if (a && !a.isCorrect) cls += 'border-red-300 bg-[#FCEBEB] text-[#791F1F]';
          else cls += 'border-gray-200 text-gray-400';
          return <div key={i} className={cls}>{i + 1}</div>;
        })}
      </div>

      {/* Quiz meta */}
      <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">{quiz.subject}</p>
      <h2 className="text-base font-semibold text-gray-900 leading-snug mb-5">{q.text}</h2>

      {/* Options */}
      <div className="flex flex-col gap-2.5 mb-4">
        {q.options.map((opt, i) => (
          <button key={i} className={optionStyle(i)} onClick={() => handleSelect(i)} disabled={answered}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-medium flex-shrink-0">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="flex-1">{opt}</span>
            {answered && i === q.correct && (
              <CheckCircleOutlineIcon style={{ fontSize: 18, color: '#27500A' }} />
            )}
            {answered && i === chosen && i !== q.correct && (
              <CancelOutlinedIcon style={{ fontSize: 18, color: '#791F1F' }} />
            )}
          </button>
        ))}
      </div>

      {/* Adaptive feedback */}
      {answered && (
        <AdaptiveFeedback
          text={feedback}
          loading={feedbackLoading}
          isCorrect={answers.at(-1)?.isCorrect}
        />
      )}

      {/* Next button */}
      {answered && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 bg-[#1a3a28] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#152e20] transition-colors mt-4"
        >
          {currentQ < total - 1 ? 'Next question' : 'View results'}
          <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}
