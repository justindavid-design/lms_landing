import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { RotateCcw, Home, Mail, CheckCircle, XCircle } from 'lucide-react';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { getOverallFeedback } from '../../lib/claude';
import { useSaveAttempt } from '../../hooks/useQuizzes';
import AdaptiveFeedback from './AdaptiveFeedback';

export default function QuizResults() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { id }    = useParams();

  // Accept state either from router or props
  const { quiz, answers = [], score = 0, total = 0, studentId } = location.state || {};

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const [overallFb, setOverallFb]       = useState('');
  const [fbLoading, setFbLoading]       = useState(true);
  const [emailAddr, setEmailAddr]       = useState('');
  const [sending, setSending]           = useState(false);
  const [emailSent, setEmailSent]       = useState(false);
  const [attemptSaved, setAttemptSaved] = useState(false);

  const { saveAttempt } = useSaveAttempt();

  // Fetch overall feedback and save attempt once
  useEffect(() => {
    if (!quiz || attemptSaved) return;
    setAttemptSaved(true);

    (async () => {
      try {
        const fb = await getOverallFeedback(answers, score, total, quiz.subject);
        setOverallFb(fb);
      } catch {
        setOverallFb('');
      } finally {
        setFbLoading(false);
      }
    })();

    if (studentId) {
      saveAttempt({
        quizId: quiz.id,
        studentId,
        score,
        total,
        answers: answers.map((a) => ({
          questionId: a.q.id,
          chosen: a.chosen,
          correct: a.q.correct,
          isCorrect: a.isCorrect,
        })),
      });
    }
  }, [quiz]); // eslint-disable-line

  const scoreColor = pct >= 80 ? '#27500A' : pct >= 50 ? '#633806' : '#791F1F';
  const scoreBg    = pct >= 80 ? '#EAF3DE' : pct >= 50 ? '#FAEEDA' : '#FCEBEB';
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (circumference * pct) / 100;

  const handleSendEmail = async () => {
    if (!emailAddr) return;
    setSending(true);
    try {
      await fetch('/api/send-quiz-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailAddr,
          studentName: 'Student',
          quizTitle: quiz?.title,
          subject: quiz?.subject,
          score,
          total,
          overallFeedback: overallFb,
          answers: answers.map((a) => ({
            questionText: a.q.text,
            chosen: a.q.options[a.chosen],
            correctOption: a.q.options[a.q.correct],
            isCorrect: a.isCorrect,
          })),
        }),
      });
      setEmailSent(true);
    } catch (e) {
      alert('Could not send email: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  if (!quiz) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-400">
        <p>No results data found.</p>
        <button onClick={() => navigate('/quizzes')} className="mt-3 text-sm underline text-[#1a3a28]">
          Back to quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#EAF3DE] flex items-center justify-center mx-auto mb-3">
          <EmojiEventsOutlinedIcon style={{ fontSize: 24, color: '#3B6D11' }} />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">Quiz complete!</h1>
        <p className="text-sm text-gray-500 mt-1">
          {quiz.title} · {quiz.subject}
        </p>
      </div>

      {/* Score ring + stat cards */}
      <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
        <div className="relative w-24 h-24">
          <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="42" fill="none" stroke="#f3f4f6" strokeWidth="10" />
            <circle
              cx="48" cy="48" r="42"
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold" style={{ color: scoreColor }}>{pct}%</span>
            <span className="text-[10px] text-gray-400">score</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#EAF3DE] rounded-xl px-5 py-3 text-center">
            <p className="text-[10px] text-[#3B6D11] font-medium">Correct</p>
            <p className="text-2xl font-semibold text-[#27500A] mt-0.5">{score}</p>
          </div>
          <div className="bg-[#FCEBEB] rounded-xl px-5 py-3 text-center">
            <p className="text-[10px] text-[#A32D2D] font-medium">Wrong</p>
            <p className="text-2xl font-semibold text-[#791F1F] mt-0.5">{total - score}</p>
          </div>
        </div>
      </div>

      {/* Overall AI feedback */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Personalized feedback</p>
        <AdaptiveFeedback text={overallFb} loading={fbLoading} isCorrect={pct >= 60} variant="overall" />
      </div>

      {/* Email report */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Email this report</p>
        {emailSent ? (
          <div className="flex items-center gap-2 text-sm text-[#27500A]">
            <CheckCircle size={16} /> Report sent successfully!
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              value={emailAddr}
              onChange={(e) => setEmailAddr(e.target.value)}
              placeholder="student@example.com"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1a3a28]/20 focus:border-[#1a3a28]"
            />
            <button
              onClick={handleSendEmail}
              disabled={sending || !emailAddr}
              className="flex items-center gap-1.5 bg-[#1a3a28] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-[#152e20] transition-colors"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Mail size={14} />
              )}
              Send
            </button>
          </div>
        )}
      </div>

      {/* Question review */}
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Question review</p>
        <div className="flex flex-col gap-2.5">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`rounded-xl border px-4 py-3 flex gap-3 items-start text-sm ${
                a.isCorrect
                  ? 'border-green-200 bg-[#EAF3DE]'
                  : 'border-red-200 bg-[#FCEBEB]'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {a.isCorrect ? (
                  <CheckCircle size={16} className="text-[#27500A]" />
                ) : (
                  <XCircle size={16} className="text-[#791F1F]" />
                )}
              </div>
              <div className="min-w-0">
                <p className={`font-medium ${a.isCorrect ? 'text-[#27500A]' : 'text-[#791F1F]'}`}>
                  {i + 1}. {a.q.text}
                </p>
                {!a.isCorrect && (
                  <>
                    <p className="text-[#791F1F] text-xs mt-0.5">
                      You answered: {a.q.options[a.chosen]}
                    </p>
                    <p className="text-[#27500A] text-xs mt-0.5">
                      Correct: {a.q.options[a.q.correct]}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => navigate(`/quizzes/${quiz.id}/play`)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1a3a28] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#152e20] transition-colors"
        >
          <RotateCcw size={14} /> Retake quiz
        </button>
        <button
          onClick={() => navigate('/quizzes')}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          <Home size={14} /> Back to quizzes
        </button>
      </div>
    </div>
  );
}
