import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileArchive,
  FileImage,
  FileText,
  Flame,
  LayoutDashboard,
  Megaphone,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Trophy,
  UploadCloud,
  Video,
  X,
  Zap,
} from 'lucide-react'
import { normalizeQuizQuestions } from '../quizzes/quizUtils'

const demoQuizQuestions = [
  {
    id: 'demo-1',
    text: 'Which learning habit makes quiz review more effective?',
    type: 'multiple',
    options: ['Review only the score', 'Compare answers with feedback', 'Skip missed questions', 'Wait until finals week'],
    correct: 1,
  },
  {
    id: 'demo-2',
    text: 'Select the resources that can appear inside a module.',
    type: 'checkbox',
    options: ['Lessons', 'Videos', 'Assignments', 'Quizzes'],
    correct: [0, 1, 2, 3],
  },
  {
    id: 'demo-3',
    text: 'A submitted assignment can still show teacher feedback after grading.',
    type: 'boolean',
    options: ['True', 'False'],
    correct: 0,
  },
  {
    id: 'demo-4',
    text: 'In one short phrase, what should you do before submitting work?',
    type: 'short',
    correctText: 'review',
  },
]

const fileTypeIcons = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  ppt: FileText,
  pptx: FileText,
  zip: FileArchive,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  mp4: Video,
  mov: Video,
}

function formatDate(value, fallback = 'No due date') {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function formatRelative(value) {
  if (!value) return 'Recently'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return formatDate(value)
}

function getDueState(value, isDone = false) {
  if (isDone) return { label: 'Submitted', tone: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
  if (!value) return { label: 'Open', tone: 'bg-slate-100 text-slate-700 border-slate-200' }
  const due = new Date(value)
  if (Number.isNaN(due.getTime())) return { label: 'Open', tone: 'bg-slate-100 text-slate-700 border-slate-200' }
  if (due < new Date()) return { label: 'Missing', tone: 'bg-rose-100 text-rose-700 border-rose-200' }
  const hours = (due.getTime() - Date.now()) / 36e5
  if (hours < 48) return { label: 'Due soon', tone: 'bg-amber-100 text-amber-800 border-amber-200' }
  return { label: 'On track', tone: 'bg-sky-100 text-sky-700 border-sky-200' }
}

function statusBadge(label, tone) {
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${tone}`}>{label}</span>
}

function buildFeed({ announcements, assignments, quizzes, modules }) {
  const items = []
  announcements.forEach((item) => items.push({ id: `ann-${item.id}`, type: 'announcement', at: item.created_at, item }))
  assignments.forEach((item) => items.push({ id: `asg-${item.id}`, type: 'assignment', at: item.created_at || item.due_at, item }))
  quizzes.forEach((item) => items.push({ id: `quiz-${item.id}`, type: 'quiz', at: item.created_at || item.due_at, item }))
  modules.forEach((item) => items.push({ id: `mod-${item.id}`, type: 'module', at: item.created_at, item }))
  return items.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
}

function getQuizQuestions(quiz) {
  const source = quiz?.questions || quiz?.content || quiz?.question_bank
  const normalized = normalizeQuizQuestions(source)
  return normalized.length ? normalized.map((question) => ({ ...question, type: 'multiple' })) : demoQuizQuestions
}

function getCompletionStats({ assignments, quizzes, modules, submissions, quizResults }) {
  const submittedAssignments = assignments.filter((assignment) => submissions[assignment.id]?.submittedAt).length
  const completedQuizzes = quizzes.filter((quiz) => quizResults[quiz.id]?.submittedAt).length
  const completedModules = Math.min(modules.length, Math.floor((submittedAssignments + completedQuizzes) / 2))
  const total = assignments.length + quizzes.length + modules.length
  const done = submittedAssignments + completedQuizzes + completedModules
  return {
    total,
    done,
    submittedAssignments,
    completedQuizzes,
    completedModules,
    percent: total ? Math.round((done / total) * 100) : 0,
  }
}

export default function StudentCourseExperience({
  course,
  modules = [],
  assignments = [],
  quizzes = [],
  announcements = [],
  message = '',
  onSubmitAssignment,
  onMessage,
}) {
  const [activeView, setActiveView] = useState('stream')
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [activeAssignment, setActiveAssignment] = useState(null)
  const [expandedModule, setExpandedModule] = useState(modules[0]?.id || null)
  const [toast, setToast] = useState('')
  const [submissions, setSubmissions] = useState({})
  const [quizResults, setQuizResults] = useState({})

  const stats = useMemo(
    () => getCompletionStats({ assignments, quizzes, modules, submissions, quizResults }),
    [assignments, quizzes, modules, submissions, quizResults]
  )
  const feed = useMemo(() => buildFeed({ announcements, assignments, quizzes, modules }), [announcements, assignments, quizzes, modules])
  const upcoming = useMemo(
    () => [...assignments, ...quizzes]
      .filter((item) => item.due_at)
      .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))
      .slice(0, 4),
    [assignments, quizzes]
  )

  const showToast = (text) => {
    setToast(text)
    window.clearTimeout(showToast.timer)
    showToast.timer = window.setTimeout(() => setToast(''), 2600)
  }

  const handleAssignmentSubmit = async (assignment, payload) => {
    const submittedAt = new Date().toISOString()
    const localSubmission = { ...payload, submittedAt, status: 'submitted' }
    setSubmissions((current) => ({ ...current, [assignment.id]: localSubmission }))
    if (onSubmitAssignment) {
      await onSubmitAssignment(assignment.id, localSubmission)
    }
    setActiveAssignment(null)
    showToast('Assignment submitted and saved.')
    onMessage?.('')
  }

  return (
    <div className="-mx-4 -my-6 min-h-screen bg-[#f6f8fb] text-slate-950 md:-mx-8 lg:-mx-10">
      <div className="relative overflow-hidden border-b border-white/70 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.24),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(250,204,21,0.18),transparent_30%),linear-gradient(135deg,#ffffff_0%,#eef7ff_62%,#fff7ed_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[1fr_360px] lg:py-8">
          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-black text-sky-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> Student experience
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                <Flame className="h-3.5 w-3.5" /> {stats.percent}% course momentum
              </span>
            </div>
            <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
              {course?.title || 'Student course'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600 md:text-base">
              Jump into lessons, complete work, take quizzes, and keep every deadline in view from one focused stream.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => quizzes[0] && setActiveQuiz(quizzes[0])}
                disabled={!quizzes.length}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play className="h-4 w-4" /> Start latest quiz
              </button>
              <button
                type="button"
                onClick={() => setActiveView('modules')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-sky-100"
              >
                <BookOpen className="h-4 w-4" /> View modules
              </button>
            </div>
          </div>
          <ProgressTracker stats={stats} upcoming={upcoming} />
        </div>
      </div>

      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 md:px-6" aria-label="Student course sections">
          {[
            ['stream', LayoutDashboard, 'Stream'],
            ['modules', BookOpen, 'Modules'],
            ['progress', Target, 'Progress'],
          ].map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveView(id)}
              className={`inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                activeView === id ? 'bg-slate-950 text-white shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </div>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[1fr_340px]">
        <section className="min-w-0">
          {message ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{message}</div> : null}
          <AnimatePresence mode="wait">
            {activeView === 'stream' ? (
              <motion.div key="stream" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
                <StudentStream
                  feed={feed}
                  submissions={submissions}
                  quizResults={quizResults}
                  onOpenAssignment={setActiveAssignment}
                  onStartQuiz={setActiveQuiz}
                  onOpenModule={(module) => {
                    setExpandedModule(module.id)
                    setActiveView('modules')
                  }}
                />
              </motion.div>
            ) : null}
            {activeView === 'modules' ? (
              <motion.div key="modules" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <ModuleAccordion
                  modules={modules}
                  assignments={assignments}
                  quizzes={quizzes}
                  expandedModule={expandedModule}
                  onToggle={setExpandedModule}
                  onOpenAssignment={setActiveAssignment}
                  onStartQuiz={setActiveQuiz}
                />
              </motion.div>
            ) : null}
            {activeView === 'progress' ? (
              <motion.div key="progress" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <ProgressDashboard stats={stats} assignments={assignments} quizzes={quizzes} modules={modules} submissions={submissions} quizResults={quizResults} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <aside className="space-y-4">
          <NotificationsPanel announcements={announcements} upcoming={upcoming} />
          <AchievementPanel stats={stats} />
        </aside>
      </main>

      <AnimatePresence>
        {activeQuiz ? (
          <QuizPlayer
            quiz={activeQuiz}
            onClose={() => setActiveQuiz(null)}
            onFinish={(result) => {
              setQuizResults((current) => ({ ...current, [activeQuiz.id]: result }))
              setActiveQuiz(null)
              showToast(`Quiz submitted. Score: ${result.percent}%`)
            }}
          />
        ) : null}
        {activeAssignment ? (
          <AssignmentSubmission
            assignment={activeAssignment}
            submission={submissions[activeAssignment.id]}
            onClose={() => setActiveAssignment(null)}
            onSubmit={(payload) => handleAssignmentSubmit(activeAssignment, payload)}
            onDraft={(payload) => {
              setSubmissions((current) => ({ ...current, [activeAssignment.id]: { ...payload, status: 'draft' } }))
              showToast('Draft saved.')
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> {toast}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function ProgressTracker({ stats, upcoming }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-xl shadow-sky-100/70 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Overall progress</p>
          <p className="mt-1 text-4xl font-black text-slate-950">{stats.percent}%</p>
        </div>
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-950 text-white">
          <Trophy className="h-8 w-8" />
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100" aria-label={`${stats.percent}% course progress`}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${stats.percent}%` }} className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-amber-400" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <MiniStat label="Quizzes" value={stats.completedQuizzes} />
        <MiniStat label="Work" value={stats.submittedAssignments} />
        <MiniStat label="Modules" value={stats.completedModules} />
      </div>
      <div className="mt-5 space-y-2">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">Up next</p>
        {upcoming.length ? upcoming.slice(0, 2).map((item) => (
          <div key={`${item.title}-${item.due_at}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
            <span className="truncate">{item.title} deadline</span>
            <span className="shrink-0 text-slate-500">{formatDate(item.due_at)}</span>
          </div>
        )) : <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-500">No upcoming deadlines.</p>}
      </div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-lg font-black text-slate-950">{value}</p>
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
    </div>
  )
}

function StudentStream({ feed, submissions, quizResults, onOpenAssignment, onStartQuiz, onOpenModule }) {
  if (!feed.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
        <h2 className="mt-4 text-xl font-black text-slate-950">Nothing posted yet</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">Announcements, modules, quizzes, and assignments will appear here.</p>
      </div>
    )
  }

  return feed.map(({ id, type, item }, index) => (
    <motion.article
      key={id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.2) }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <FeedIcon type={type} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">{type}</p>
            <span className="text-xs font-bold text-slate-400">{formatRelative(item.created_at || item.due_at)}</span>
            {type === 'assignment' ? statusBadge(...Object.values(getDueState(item.due_at, submissions[item.id]?.submittedAt))) : null}
            {type === 'quiz' && quizResults[item.id] ? statusBadge('Completed', 'bg-emerald-100 text-emerald-700 border-emerald-200') : null}
          </div>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">{item.title}</h2>
          <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">
            {item.body || item.instructions || item.description || 'Open this item to continue learning.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {item.due_at ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                <CalendarDays className="h-3.5 w-3.5" /> Due {formatDate(item.due_at)}
              </span>
            ) : null}
            {type === 'quiz' ? <ActionButton onClick={() => onStartQuiz(item)} icon={Zap} label={quizResults[item.id] ? 'Review quiz' : 'Start quiz'} ariaLabel={`Submit quiz: ${item.title}`} /> : null}
            {type === 'assignment' ? <ActionButton onClick={() => onOpenAssignment(item)} icon={UploadCloud} label={submissions[item.id]?.submittedAt ? 'View submission' : 'Submit work'} /> : null}
            {type === 'module' ? <ActionButton onClick={() => onOpenModule(item)} icon={BookOpen} label="Open module" /> : null}
          </div>
        </div>
      </div>
    </motion.article>
  ))
}

function FeedIcon({ type }) {
  const config = {
    announcement: [Megaphone, 'from-amber-400 to-orange-500'],
    assignment: [UploadCloud, 'from-sky-500 to-blue-600'],
    quiz: [Zap, 'from-violet-500 to-fuchsia-600'],
    module: [BookOpen, 'from-emerald-500 to-teal-600'],
  }[type] || [Bell, 'from-slate-500 to-slate-700']
  const [Icon, gradient] = config
  return (
    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
      <Icon className="h-6 w-6" />
    </div>
  )
}

function ActionButton({ onClick, icon: Icon, label, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  )
}

function ModuleAccordion({ modules, assignments, quizzes, expandedModule, onToggle, onOpenAssignment, onStartQuiz }) {
  const fallbackModules = modules.length ? modules : [{ id: 'getting-started', title: 'Getting started', description: 'Course materials will appear here as modules are published.' }]
  return (
    <div className="space-y-4">
      {fallbackModules.map((module, index) => {
        const isOpen = expandedModule === module.id || (!expandedModule && index === 0)
        const moduleAssignments = assignments.filter((item) => !item.module_id || String(item.module_id) === String(module.id))
        const moduleQuizzes = quizzes.filter((item) => !item.module_id || String(item.module_id) === String(module.id))
        return (
          <section key={module.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => onToggle(isOpen ? null : module.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left focus:outline-none focus:ring-4 focus:ring-sky-100"
              aria-expanded={isOpen}
            >
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-emerald-600">Module {index + 1}</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">{module.title}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{module.description || `${moduleAssignments.length + moduleQuizzes.length} activities`}</p>
              </div>
              <ChevronDown className={`h-5 w-5 shrink-0 text-slate-500 transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100">
                  <div className="grid gap-3 p-5">
                    <ModuleResource icon={Video} title="Interactive lesson" meta="Video and notes" />
                    <ModuleResource icon={FileText} title="Reading packet" meta="PDF resource" />
                    {moduleAssignments.map((assignment) => (
                      <ModuleResource key={assignment.id} icon={UploadCloud} title={assignment.title} meta={`Assignment - due ${formatDate(assignment.due_at)}`} action="Submit" onClick={() => onOpenAssignment(assignment)} />
                    ))}
                    {moduleQuizzes.map((quiz) => (
                      <ModuleResource key={quiz.id} icon={Zap} title={quiz.title} meta={`Quiz - due ${formatDate(quiz.due_at)}`} action="Start" onClick={() => onStartQuiz(quiz)} />
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>
        )
      })}
    </div>
  )
}

function ModuleResource({ icon: Icon, title, meta, action, onClick }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-slate-700 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950">{title}</p>
          <p className="truncate text-xs font-bold text-slate-500">{meta}</p>
        </div>
      </div>
      {action ? (
        <button type="button" onClick={onClick} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-800 shadow-sm transition hover:bg-slate-950 hover:text-white focus:outline-none focus:ring-4 focus:ring-slate-200">
          {action}
        </button>
      ) : <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
    </div>
  )
}

function QuizPlayer({ quiz, onClose, onFinish }) {
  const questions = useMemo(() => getQuizQuestions(quiz), [quiz])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(Math.max(60, (quiz.time_limit_minutes || 5) * 60))
  const [confirming, setConfirming] = useState(false)
  const startedAt = useRef(Date.now())
  const question = questions[index]
  const progress = Math.round(((index + 1) / questions.length) * 100)

  useEffect(() => {
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (secondsLeft === 0) submitQuiz()
  }, [secondsLeft])

  const updateAnswer = (value) => {
    setAnswers((current) => ({ ...current, [question.id]: value }))
  }

  const submitQuiz = () => {
    const correct = questions.reduce((total, item) => total + (isCorrect(item, answers[item.id]) ? 1 : 0), 0)
    const percent = Math.round((correct / questions.length) * 100)
    onFinish({
      score: correct,
      total: questions.length,
      percent,
      passed: percent >= 70,
      timeTaken: Math.round((Date.now() - startedAt.current) / 1000),
      answers,
      questions,
      submittedAt: new Date().toISOString(),
    })
  }

  return (
    <motion.div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,.34),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,.25),transparent_30%),linear-gradient(135deg,#111827_0%,#0f172a_100%)]">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
            <button type="button" onClick={onClose} className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-black text-white hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/20">
              <ArrowLeft className="h-4 w-4" /> Exit
            </button>
            <div className="min-w-0 flex-1 md:px-6">
              <p className="truncate text-sm font-black text-white/70">{quiz.title || 'Quiz'}</p>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-sky-400 to-violet-400" animate={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill icon={Target} label={`Question ${index + 1} / ${questions.length}`} />
              <StatusPill icon={Timer} label={formatSeconds(secondsLeft)} />
            </div>
          </div>
        </header>

        <main className="mx-auto flex max-w-5xl flex-col px-4 py-8">
          <AnimatePresence mode="wait">
            <QuestionCard key={question.id} question={question} answer={answers[question.id]} onAnswer={updateAnswer} />
          </AnimatePresence>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15 disabled:opacity-40">
              <ChevronLeft className="h-5 w-5" /> Previous
            </button>
            <p className="text-center text-xs font-bold text-white/60">Auto-saved {Object.keys(answers).length} of {questions.length} answers</p>
            {index < questions.length - 1 ? (
              <button type="button" onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100">
                Next <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300">
                Submit quiz <Send className="h-5 w-5" />
              </button>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {confirming ? (
          <ConfirmSubmit
            answered={Object.keys(answers).length}
            total={questions.length}
            onCancel={() => setConfirming(false)}
            onConfirm={submitQuiz}
          />
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function StatusPill({ icon: Icon, label }) {
  return (
    <span className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-black text-white">
      <Icon className="h-4 w-4" /> {label}
    </span>
  )
}

function QuestionCard({ question, answer, onAnswer }) {
  const isCheckbox = question.type === 'checkbox'
  const options = question.type === 'boolean' ? ['True', 'False'] : question.options
  return (
    <motion.section initial={{ opacity: 0, x: 36 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -36 }} className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur md:p-8">
      <p className="text-sm font-black uppercase tracking-wide text-amber-200">{question.type === 'short' ? 'Short answer' : isCheckbox ? 'Select all that apply' : 'Choose the best answer'}</p>
      <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight text-white md:text-4xl">{question.text}</h2>
      {question.type === 'short' ? (
        <textarea
          value={answer || ''}
          onChange={(event) => onAnswer(event.target.value)}
          className="mt-8 min-h-[180px] w-full resize-none rounded-2xl border border-white/20 bg-white p-5 text-lg font-bold text-slate-950 outline-none transition focus:ring-4 focus:ring-sky-300"
          placeholder="Type your answer here..."
          aria-label="Short answer response"
        />
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {options.map((option, optionIndex) => {
            const selected = isCheckbox ? Array.isArray(answer) && answer.includes(optionIndex) : answer === optionIndex
            return (
              <AnswerCard
                key={`${option}-${optionIndex}`}
                label={option}
                selected={selected}
                onClick={() => {
                  if (isCheckbox) {
                    const current = Array.isArray(answer) ? answer : []
                    onAnswer(current.includes(optionIndex) ? current.filter((item) => item !== optionIndex) : [...current, optionIndex])
                  } else {
                    onAnswer(optionIndex)
                  }
                }}
              />
            )
          })}
        </div>
      )}
    </motion.section>
  )
}

function AnswerCard({ label, selected, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex min-h-[96px] items-center gap-4 rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-4 focus:ring-sky-300 ${
        selected ? 'border-amber-300 bg-amber-300 text-slate-950 shadow-xl shadow-amber-900/20' : 'border-white/15 bg-white text-slate-950 hover:border-sky-300 hover:bg-sky-50'
      }`}
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-sm font-black ${selected ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:border-sky-300'}`}>
        {selected ? <Check className="h-5 w-5" /> : null}
      </span>
      <span className="text-lg font-black leading-snug">{label}</span>
    </motion.button>
  )
}

function ConfirmSubmit({ answered, total, onCancel, onConfirm }) {
  return (
    <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }} className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-950 shadow-2xl">
        <h2 className="text-2xl font-black">Submit quiz?</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">You answered {answered} of {total} questions. You can review before submitting or send your final attempt now.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">Review answers</button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800">Submit now</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function isCorrect(question, answer) {
  if (question.type === 'short') return String(answer || '').toLowerCase().includes(String(question.correctText || '').toLowerCase())
  if (Array.isArray(question.correct)) {
    return Array.isArray(answer) && question.correct.length === answer.length && question.correct.every((item) => answer.includes(item))
  }
  return answer === question.correct
}

function formatSeconds(value) {
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function AssignmentSubmission({ assignment, submission, onClose, onSubmit, onDraft }) {
  const [files, setFiles] = useState(submission?.files || [])
  const [note, setNote] = useState(submission?.note || '')
  const [isDragging, setIsDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)
  const status = submission?.submittedAt ? 'Submitted' : submission?.status === 'draft' ? 'Draft' : new Date(assignment.due_at || Date.now() + 1) < new Date() ? 'Missing' : 'Ready'

  const addFiles = (fileList) => {
    const nextFiles = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
    }))
    setFiles((current) => [...current, ...nextFiles])
    nextFiles.forEach((file) => {
      let progress = 0
      const timer = window.setInterval(() => {
        progress += 20
        setFiles((current) => current.map((item) => item.id === file.id ? { ...item, progress: Math.min(progress, 100) } : item))
        if (progress >= 100) window.clearInterval(timer)
      }, 130)
    })
  }

  const payload = { files, note }

  return (
    <motion.div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/60 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="mx-auto my-6 max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">Assignment</span>
              <SubmissionStatus label={status} />
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{assignment.title}</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">Due {formatDate(assignment.due_at)} - {assignment.points || 100} points</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-100" aria-label="Close assignment">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_360px]">
          <section>
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Instructions</h3>
            <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-700">{assignment.instructions || 'Complete the task and upload your work before the deadline.'}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {['Rubric.pdf', 'Starter-template.docx'].map((name) => (
                <div key={name} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
                  <FileText className="h-5 w-5 text-slate-500" />
                  <span className="text-sm font-black text-slate-700">{name}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <UploadZone
              inputRef={inputRef}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              onFiles={addFiles}
            />
            <input ref={inputRef} type="file" multiple className="sr-only" onChange={(event) => addFiles(event.target.files)} aria-label="Upload assignment files" />
            <div className="mt-4 space-y-3">
              {files.map((file) => <FilePreview key={file.id} file={file} onRemove={() => setFiles((current) => current.filter((item) => item.id !== file.id))} />)}
            </div>
            <label className="mt-4 block text-sm font-black text-slate-700" htmlFor="student-note">Private note</label>
            <textarea id="student-note" value={note} onChange={(event) => setNote(event.target.value)} className="mt-2 min-h-[100px] w-full rounded-2xl border border-slate-200 p-4 text-sm font-semibold outline-none focus:ring-4 focus:ring-sky-100" placeholder="Add a note for your instructor..." />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => onDraft(payload)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">Save draft</button>
              <button
                type="button"
                disabled={saving || (!files.length && !note.trim())}
                onClick={async () => {
                  setSaving(true)
                  try {
                    await onSubmit(payload)
                  } finally {
                    setSaving(false)
                  }
                }}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submission?.submittedAt ? 'Resubmit' : saving ? 'Submitting...' : 'Submit work'}
              </button>
            </div>
            {submission?.submittedAt ? <p className="mt-3 text-xs font-bold text-slate-500">Submitted {formatDate(submission.submittedAt)}</p> : null}
          </section>
        </div>
      </motion.div>
    </motion.div>
  )
}

function UploadZone({ inputRef, isDragging, setIsDragging, onFiles }) {
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        onFiles(event.dataTransfer.files)
      }}
      className={`flex min-h-[190px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition focus:outline-none focus:ring-4 focus:ring-sky-100 ${
        isDragging ? 'border-sky-400 bg-sky-50' : 'border-slate-300 bg-slate-50 hover:border-sky-300 hover:bg-sky-50'
      }`}
    >
      <UploadCloud className="h-10 w-10 text-sky-600" />
      <span className="mt-3 text-base font-black text-slate-950">Drop files or browse</span>
      <span className="mt-1 text-xs font-bold text-slate-500">PDF, DOCX, PPT, ZIP, images, and videos</span>
    </button>
  )
}

function FilePreview({ file, onRemove }) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const Icon = fileTypeIcons[extension] || FileText
  return (
    <div className="rounded-2xl border border-slate-200 p-3">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-800">{file.name}</p>
          <p className="text-xs font-bold text-slate-500">{Math.max(1, Math.round(file.size / 1024))} KB</p>
        </div>
        <button type="button" onClick={onRemove} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${file.name}`}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${file.progress || 0}%` }} />
      </div>
    </div>
  )
}

function SubmissionStatus({ label }) {
  const tones = {
    Submitted: 'bg-emerald-100 text-emerald-700',
    Missing: 'bg-rose-100 text-rose-700',
    Draft: 'bg-amber-100 text-amber-800',
    Ready: 'bg-slate-100 text-slate-700',
    Graded: 'bg-violet-100 text-violet-700',
  }
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${tones[label] || tones.Ready}`}>{label}</span>
}

function NotificationsPanel({ announcements, upcoming }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-950">Reminders</h2>
        <Bell className="h-5 w-5 text-slate-400" />
      </div>
      <div className="mt-4 space-y-3">
        {announcements.slice(0, 2).map((item) => (
          <div key={item.id} className="rounded-2xl bg-amber-50 p-3">
            <p className="text-xs font-black uppercase text-amber-700">Announcement</p>
            <p className="mt-1 text-sm font-black text-slate-800">{item.title}</p>
          </div>
        ))}
        {upcoming.map((item) => (
          <div key={`${item.id}-${item.due_at}`} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-800">{item.title} reminder</p>
              <p className="text-xs font-bold text-slate-500">Due {formatDate(item.due_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function AchievementPanel({ stats }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-black text-slate-950">Achievements</h2>
      <div className="mt-4 grid gap-3">
        <Achievement icon={Award} label="Course streak" value={`${Math.max(1, stats.done)} days`} active />
        <Achievement icon={Zap} label="Quiz energy" value={`${stats.completedQuizzes} done`} active={stats.completedQuizzes > 0} />
        <Achievement icon={CheckCircle2} label="Submission flow" value={`${stats.submittedAssignments} sent`} active={stats.submittedAssignments > 0} />
      </div>
    </section>
  )
}

function Achievement({ icon: Icon, label, value, active }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-3 ${active ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50 opacity-70'}`}>
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${active ? 'bg-amber-300 text-slate-950' : 'bg-white text-slate-400'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-black text-slate-800">{label}</p>
        <p className="text-xs font-bold text-slate-500">{value}</p>
      </div>
    </div>
  )
}

function ProgressDashboard({ stats, assignments, quizzes, modules, submissions, quizResults }) {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">Progress map</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <ProgressCard icon={Zap} label="Completed quizzes" value={`${stats.completedQuizzes}/${quizzes.length}`} color="bg-violet-100 text-violet-700" />
          <ProgressCard icon={UploadCloud} label="Submitted assignments" value={`${stats.submittedAssignments}/${assignments.length}`} color="bg-sky-100 text-sky-700" />
          <ProgressCard icon={BookOpen} label="Module completion" value={`${stats.completedModules}/${modules.length}`} color="bg-emerald-100 text-emerald-700" />
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">Activity status</h2>
        <div className="mt-4 space-y-3">
          {[...assignments.map((item) => ({ ...item, type: 'assignment' })), ...quizzes.map((item) => ({ ...item, type: 'quiz' }))].map((item) => {
            const done = item.type === 'assignment' ? submissions[item.id]?.submittedAt : quizResults[item.id]?.submittedAt
            return (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-800">{item.title}</p>
                  <p className="text-xs font-bold text-slate-500">{item.type} - due {formatDate(item.due_at)}</p>
                </div>
                {done ? statusBadge('Complete', 'bg-emerald-100 text-emerald-700 border-emerald-200') : statusBadge('Open', 'bg-slate-100 text-slate-700 border-slate-200')}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function ProgressCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-2xl font-black text-slate-950">{value}</p>
      <p className="text-sm font-bold text-slate-500">{label}</p>
    </div>
  )
}
