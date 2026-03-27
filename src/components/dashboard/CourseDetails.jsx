import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Loading from '../Loading'
import { useAuth } from '../../lib/AuthProvider'
import { getApiErrorMessage, safeJson } from '../courses/utils'

function formatDateTime(value) {
  if (!value) return 'No due date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No due date'
  return date.toLocaleString()
}

function SectionCard({ title, description, children, action }) {
  return (
    <section className="rounded-2xl border border-token bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-main">{title}</h2>
          {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function ItemBadge({ children }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">{children}</span>
}

export default function CourseDetails() {
  const { id } = useParams()
  const { user } = useAuth()

  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [submissionLists, setSubmissionLists] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [moduleForm, setModuleForm] = useState({ title: '', description: '' })
  const [assignmentForm, setAssignmentForm] = useState({ title: '', instructions: '', due_at: '', module_id: '', status: 'published' })
  const [quizForm, setQuizForm] = useState({ title: '', description: '', questions: '', due_at: '', status: 'published' })
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' })
  const [submissionDrafts, setSubmissionDrafts] = useState({})
  const [gradingDrafts, setGradingDrafts] = useState({})

  const userId = user?.id

  async function loadCourseWorkspace() {
    if (!id || !userId) return

    setLoading(true)

    try {
      const [courseRes, modulesRes, assignmentsRes, quizzesRes, announcementsRes] = await Promise.all([
        fetch(`/api/courses/${id}?user_id=${encodeURIComponent(userId)}`),
        fetch(`/api/courses/${id}/modules?user_id=${encodeURIComponent(userId)}`),
        fetch(`/api/courses/${id}/assignments?user_id=${encodeURIComponent(userId)}`),
        fetch(`/api/courses/${id}/quizzes?user_id=${encodeURIComponent(userId)}`),
        fetch(`/api/notifications?user_id=${encodeURIComponent(userId)}&course_id=${encodeURIComponent(id)}&limit=10`),
      ])

      const [courseData, modulesData, assignmentsData, quizzesData, announcementsData] = await Promise.all([
        safeJson(courseRes),
        safeJson(modulesRes),
        safeJson(assignmentsRes),
        safeJson(quizzesRes),
        safeJson(announcementsRes),
      ])

      if (!courseRes.ok) throw new Error(getApiErrorMessage(courseData, 'Failed to load course.'))
      if (!modulesRes.ok) throw new Error(getApiErrorMessage(modulesData, 'Failed to load modules.'))
      if (!assignmentsRes.ok) throw new Error(getApiErrorMessage(assignmentsData, 'Failed to load assignments.'))
      if (!quizzesRes.ok) throw new Error(getApiErrorMessage(quizzesData, 'Failed to load quizzes.'))
      if (!announcementsRes.ok) throw new Error(getApiErrorMessage(announcementsData, 'Failed to load announcements.'))

      setCourse(courseData)
      setModules(Array.isArray(modulesData) ? modulesData : [])
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : [])
      setAnnouncements(Array.isArray(announcementsData) ? announcementsData.filter((item) => item.type === 'announcement') : [])
      setMessage('')
    } catch (err) {
      console.error(err)
      setCourse(null)
      setMessage(err.message || 'Failed to load course.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourseWorkspace()
  }, [id, userId])

  const isTeacher = useMemo(
    () => course && (course.viewer_role === 'teacher' || String(course.author) === String(userId)),
    [course, userId]
  )

  const publishedAssignments = useMemo(() => assignments, [assignments])
  const publishedQuizzes = useMemo(() => quizzes, [quizzes])

  const createModule = async () => {
    const res = await fetch(`/api/courses/${id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...moduleForm, user_id: userId }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to create module.'))
    setModuleForm({ title: '', description: '' })
    await loadCourseWorkspace()
  }

  const createAssignment = async () => {
    const res = await fetch(`/api/courses/${id}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...assignmentForm,
        user_id: userId,
        due_at: assignmentForm.due_at ? new Date(assignmentForm.due_at).toISOString() : null,
        module_id: assignmentForm.module_id || null,
      }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to create assignment.'))
    setAssignmentForm({ title: '', instructions: '', due_at: '', module_id: '', status: 'published' })
    await loadCourseWorkspace()
  }

  const createQuiz = async () => {
    const res = await fetch(`/api/courses/${id}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...quizForm,
        user_id: userId,
        due_at: quizForm.due_at ? new Date(quizForm.due_at).toISOString() : null,
      }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to create quiz.'))
    setQuizForm({ title: '', description: '', questions: '', due_at: '', status: 'published' })
    await loadCourseWorkspace()
  }

  const createAnnouncement = async () => {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actor_user_id: userId,
        user_id: userId,
        course_id: id,
        type: 'announcement',
        title: announcementForm.title,
        body: announcementForm.body,
      }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to publish announcement.'))
    setAnnouncementForm({ title: '', body: '' })
    await loadCourseWorkspace()
  }

  const submitWork = async (assignmentId) => {
    const res = await fetch(`/api/assignments/${assignmentId}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        content: submissionDrafts[assignmentId] || '',
      }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to submit work.'))
    setSubmissionDrafts((current) => ({ ...current, [assignmentId]: '' }))
    await loadCourseWorkspace()
  }

  const loadSubmissions = async (assignmentId) => {
    const res = await fetch(`/api/assignments/${assignmentId}/submissions?user_id=${encodeURIComponent(userId)}`)
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to load submissions.'))
    setSubmissionLists((current) => ({ ...current, [assignmentId]: Array.isArray(data) ? data : [] }))
  }

  const gradeSubmission = async (submissionId, assignmentId) => {
    const draft = gradingDrafts[submissionId] || {}
    const res = await fetch(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        score: draft.score,
        feedback: draft.feedback,
      }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to grade submission.'))
    setGradingDrafts((current) => ({ ...current, [submissionId]: { score: '', feedback: '' } }))
    await Promise.all([loadCourseWorkspace(), loadSubmissions(assignmentId)])
  }

  async function withAction(action, fallbackMessage) {
    try {
      await action()
      setMessage('')
    } catch (err) {
      console.error(err)
      setMessage(err.message || fallbackMessage)
    }
  }

  if (loading) {
    return <Loading message="Loading class..." />
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-2xl border border-token bg-surface p-6">
          <h1 className="text-2xl font-bold text-main">Course not found</h1>
          <p className="mt-2 text-sm text-muted">{message || 'This class could not be loaded.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="rounded-[28px] bg-gradient-to-r from-[#0f3d2e] to-[#14553f] p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.18em] text-white/70">Class Overview</p>
        <h1 className="mt-2 text-4xl font-extrabold">{course.title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/85">
          {course.description || 'No course description available.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/85">
          <span>{course.author_name || 'Unknown teacher'}</span>
          <span>Code {course.course_code || 'N/A'}</span>
          <span>{course.published ? 'Published' : 'Draft'}</span>
          <span>{isTeacher ? 'Teacher view' : 'Student view'}</span>
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-token bg-surface p-4 text-sm text-red-600">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-token bg-surface p-5">
          <p className="text-sm text-subtle">Assignments</p>
          <p className="mt-2 text-lg font-semibold text-main">{course.assignment_count || 0}</p>
        </div>
        <div className="rounded-2xl border border-token bg-surface p-5">
          <p className="text-sm text-subtle">Quizzes</p>
          <p className="mt-2 text-lg font-semibold text-main">{course.quiz_count || 0}</p>
        </div>
        <div className="rounded-2xl border border-token bg-surface p-5">
          <p className="text-sm text-subtle">Learners</p>
          <p className="mt-2 text-lg font-semibold text-main">{course.student_count || 0}</p>
        </div>
        <div className="rounded-2xl border border-token bg-surface p-5">
          <p className="text-sm text-subtle">Next Due</p>
          <p className="mt-2 text-lg font-semibold text-main">{formatDateTime(course.next_due_at)}</p>
        </div>
      </div>

      <SectionCard
        title="Announcements"
        description="Course-wide updates stay visible to both teachers and students."
      >
        {isTeacher ? (
          <div className="mb-5 grid gap-3 rounded-2xl border border-token bg-app p-4">
            <input
              className="input-base"
              placeholder="Announcement title"
              value={announcementForm.title}
              onChange={(event) => setAnnouncementForm((current) => ({ ...current, title: event.target.value }))}
            />
            <textarea
              className="input-base min-h-[100px]"
              placeholder="Share an update with this class"
              value={announcementForm.body}
              onChange={(event) => setAnnouncementForm((current) => ({ ...current, body: event.target.value }))}
            />
            <div className="flex justify-end">
              <button onClick={() => withAction(createAnnouncement, 'Failed to publish announcement.')} className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
                Publish announcement
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {announcements.length === 0 ? <p className="text-sm text-muted">No announcements yet.</p> : null}
          {announcements.map((item) => (
            <div key={item.id} className="rounded-xl border border-token p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="font-semibold text-main">{item.title}</div>
                <span className="text-xs text-muted">{formatDateTime(item.created_at)}</span>
              </div>
              {item.body ? <p className="mt-2 text-sm text-muted">{item.body}</p> : null}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Modules"
        description="Organize lessons and activities in the order learners should follow them."
      >
        {isTeacher ? (
          <div className="mb-5 grid gap-3 rounded-2xl border border-token bg-app p-4 md:grid-cols-[1fr_2fr_auto]">
            <input
              className="input-base"
              placeholder="Module title"
              value={moduleForm.title}
              onChange={(event) => setModuleForm((current) => ({ ...current, title: event.target.value }))}
            />
            <input
              className="input-base"
              placeholder="Short description"
              value={moduleForm.description}
              onChange={(event) => setModuleForm((current) => ({ ...current, description: event.target.value }))}
            />
            <button onClick={() => withAction(createModule, 'Failed to create module.')} className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
              Add module
            </button>
          </div>
        ) : null}

        <div className="space-y-3">
          {modules.length === 0 ? <p className="text-sm text-muted">No modules yet.</p> : null}
          {modules.map((module) => (
            <div key={module.id} className="rounded-xl border border-token p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-main">{module.title}</div>
                <ItemBadge>Lesson</ItemBadge>
              </div>
              {module.description ? <p className="mt-2 text-sm text-muted">{module.description}</p> : null}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Assignments"
        description="Publish work with due dates and collect submissions directly inside the course."
      >
        {isTeacher ? (
          <div className="mb-5 grid gap-3 rounded-2xl border border-token bg-app p-4">
            <input
              className="input-base"
              placeholder="Assignment title"
              value={assignmentForm.title}
              onChange={(event) => setAssignmentForm((current) => ({ ...current, title: event.target.value }))}
            />
            <textarea
              className="input-base min-h-[100px]"
              placeholder="Instructions"
              value={assignmentForm.instructions}
              onChange={(event) => setAssignmentForm((current) => ({ ...current, instructions: event.target.value }))}
            />
            <div className="grid gap-3 md:grid-cols-3">
              <select
                className="input-base"
                value={assignmentForm.module_id}
                onChange={(event) => setAssignmentForm((current) => ({ ...current, module_id: event.target.value }))}
              >
                <option value="">No module</option>
                {modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
              </select>
              <input
                className="input-base"
                type="datetime-local"
                value={assignmentForm.due_at}
                onChange={(event) => setAssignmentForm((current) => ({ ...current, due_at: event.target.value }))}
              />
              <select
                className="input-base"
                value={assignmentForm.status}
                onChange={(event) => setAssignmentForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="published">Publish now</option>
                <option value="draft">Save as draft</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button onClick={() => withAction(createAssignment, 'Failed to create assignment.')} className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
                Add assignment
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          {publishedAssignments.length === 0 ? <p className="text-sm text-muted">No assignments yet.</p> : null}
          {publishedAssignments.map((assignment) => (
            <div key={assignment.id} className="rounded-xl border border-token p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-main">{assignment.title}</div>
                  <div className="text-sm text-muted mt-1">
                    {assignment.module_title ? `${assignment.module_title} • ` : ''}Due {formatDateTime(assignment.due_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ItemBadge>{assignment.status_for_user || assignment.status}</ItemBadge>
                  {isTeacher ? <ItemBadge>{assignment.pending_review_count || 0} pending</ItemBadge> : null}
                </div>
              </div>
              {assignment.instructions ? <p className="mt-3 text-sm text-muted">{assignment.instructions}</p> : null}

              {isTeacher ? (
                <div className="mt-4">
                  <button
                    onClick={() => withAction(() => loadSubmissions(assignment.id), 'Failed to load submissions.')}
                    className="rounded-lg border border-token px-3 py-2 text-sm"
                  >
                    Review submissions
                  </button>

                  {(submissionLists[assignment.id] || []).length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {(submissionLists[assignment.id] || []).map((submission) => (
                        <div key={submission.id} className="rounded-xl border border-token bg-app p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-medium text-main">{submission.student_name}</div>
                              <div className="text-xs text-muted">{submission.status} • {formatDateTime(submission.submitted_at)}</div>
                            </div>
                            <ItemBadge>{submission.status}</ItemBadge>
                          </div>
                          {submission.content ? <p className="mt-3 text-sm text-muted">{submission.content}</p> : null}
                          <div className="mt-3 grid gap-3 md:grid-cols-[140px_1fr_auto]">
                            <input
                              className="input-base"
                              placeholder="Score"
                              value={gradingDrafts[submission.id]?.score ?? ''}
                              onChange={(event) => setGradingDrafts((current) => ({ ...current, [submission.id]: { ...current[submission.id], score: event.target.value } }))}
                            />
                            <input
                              className="input-base"
                              placeholder="Feedback"
                              value={gradingDrafts[submission.id]?.feedback ?? ''}
                              onChange={(event) => setGradingDrafts((current) => ({ ...current, [submission.id]: { ...current[submission.id], feedback: event.target.value } }))}
                            />
                            <button onClick={() => withAction(() => gradeSubmission(submission.id, assignment.id), 'Failed to grade submission.')} className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
                              Save grade
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {assignment.submission ? (
                    <div className="rounded-xl border border-token bg-app p-4 text-sm text-muted">
                      Status: <span className="font-semibold text-main">{assignment.submission.status}</span>
                      {assignment.submission.score != null ? ` • Score: ${assignment.submission.score}` : ''}
                      {assignment.submission.feedback ? ` • Feedback: ${assignment.submission.feedback}` : ''}
                    </div>
                  ) : null}
                  <textarea
                    className="input-base min-h-[110px]"
                    placeholder="Write your submission or paste a link"
                    value={submissionDrafts[assignment.id] || ''}
                    onChange={(event) => setSubmissionDrafts((current) => ({ ...current, [assignment.id]: event.target.value }))}
                  />
                  <div className="flex justify-end">
                    <button onClick={() => withAction(() => submitWork(assignment.id), 'Failed to submit work.')} className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
                      Submit work
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Quizzes"
        description="Post quiz prompts with due dates and reuse the same submission and grading flow."
      >
        {isTeacher ? (
          <div className="mb-5 grid gap-3 rounded-2xl border border-token bg-app p-4">
            <input
              className="input-base"
              placeholder="Quiz title"
              value={quizForm.title}
              onChange={(event) => setQuizForm((current) => ({ ...current, title: event.target.value }))}
            />
            <textarea
              className="input-base min-h-[90px]"
              placeholder="Quiz description"
              value={quizForm.description}
              onChange={(event) => setQuizForm((current) => ({ ...current, description: event.target.value }))}
            />
            <textarea
              className="input-base min-h-[110px]"
              placeholder="One question per line"
              value={quizForm.questions}
              onChange={(event) => setQuizForm((current) => ({ ...current, questions: event.target.value }))}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="input-base"
                type="datetime-local"
                value={quizForm.due_at}
                onChange={(event) => setQuizForm((current) => ({ ...current, due_at: event.target.value }))}
              />
              <select
                className="input-base"
                value={quizForm.status}
                onChange={(event) => setQuizForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="published">Publish now</option>
                <option value="draft">Save as draft</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button onClick={() => withAction(createQuiz, 'Failed to create quiz.')} className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
                Add quiz
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          {publishedQuizzes.length === 0 ? <p className="text-sm text-muted">No quizzes yet.</p> : null}
          {publishedQuizzes.map((quiz) => (
            <div key={quiz.id} className="rounded-xl border border-token p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-main">{quiz.title}</div>
                  <div className="text-sm text-muted mt-1">
                    {quiz.question_count || 0} questions • Due {formatDateTime(quiz.due_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ItemBadge>{quiz.status_for_user || quiz.status}</ItemBadge>
                  {isTeacher ? <ItemBadge>{quiz.pending_review_count || 0} pending</ItemBadge> : null}
                </div>
              </div>
              {quiz.description ? <p className="mt-3 text-sm text-muted">{quiz.description}</p> : null}
              {isTeacher ? (
                <div className="mt-4">
                  <button
                    onClick={() => withAction(() => loadSubmissions(quiz.assignment_id), 'Failed to load submissions.')}
                    className="rounded-lg border border-token px-3 py-2 text-sm"
                  >
                    Review submissions
                  </button>

                  {(submissionLists[quiz.assignment_id] || []).length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {(submissionLists[quiz.assignment_id] || []).map((submission) => (
                        <div key={submission.id} className="rounded-xl border border-token bg-app p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-medium text-main">{submission.student_name}</div>
                              <div className="text-xs text-muted">{submission.status} • {formatDateTime(submission.submitted_at)}</div>
                            </div>
                            <ItemBadge>{submission.status}</ItemBadge>
                          </div>
                          {submission.content ? <p className="mt-3 text-sm text-muted">{submission.content}</p> : null}
                          <div className="mt-3 grid gap-3 md:grid-cols-[140px_1fr_auto]">
                            <input
                              className="input-base"
                              placeholder="Score"
                              value={gradingDrafts[submission.id]?.score ?? ''}
                              onChange={(event) => setGradingDrafts((current) => ({ ...current, [submission.id]: { ...current[submission.id], score: event.target.value } }))}
                            />
                            <input
                              className="input-base"
                              placeholder="Feedback"
                              value={gradingDrafts[submission.id]?.feedback ?? ''}
                              onChange={(event) => setGradingDrafts((current) => ({ ...current, [submission.id]: { ...current[submission.id], feedback: event.target.value } }))}
                            />
                            <button onClick={() => withAction(() => gradeSubmission(submission.id, quiz.assignment_id), 'Failed to grade submission.')} className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
                              Save grade
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {quiz.submission ? (
                    <div className="rounded-xl border border-token bg-app p-4 text-sm text-muted">
                      Quiz status: <span className="font-semibold text-main">{quiz.submission.status}</span>
                      {quiz.submission.score != null ? ` • Score: ${quiz.submission.score}` : ''}
                      {quiz.submission.feedback ? ` • Feedback: ${quiz.submission.feedback}` : ''}
                    </div>
                  ) : null}
                  <textarea
                    className="input-base min-h-[110px]"
                    placeholder="Write your quiz response"
                    value={submissionDrafts[quiz.assignment_id] || ''}
                    onChange={(event) => setSubmissionDrafts((current) => ({ ...current, [quiz.assignment_id]: event.target.value }))}
                  />
                  <div className="flex justify-end">
                    <button onClick={() => withAction(() => submitWork(quiz.assignment_id), 'Failed to submit quiz.')} className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
                      Submit quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
