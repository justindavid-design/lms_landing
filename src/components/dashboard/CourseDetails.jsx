import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loading from '../Loading'
import PageHeader from '../PageHeader'
import CourseTabs from '../CourseTabs'
import HeaderStats from './HeaderStats'
import StudentProgress from './StudentProgress'
import TeacherStudentProgress from './TeacherStudentProgress'
import { useAuth } from '../../lib/AuthProvider'
import { useCourseName } from '../../lib/CourseNameContext'
import { getApiErrorMessage, safeJson } from '../courses/utils'
import QuizComposer, { createEmptyQuizDraft } from '../quizzes/QuizComposer'
import QuizAttemptCard from '../quizzes/QuizAttemptCard'
import { normalizeQuizQuestions } from '../quizzes/quizUtils'
import ConfirmDialog from './ConfirmDialog'
import EditModuleModal from './EditModuleModal'
import EditAssignmentModal from './EditAssignmentModal'
import EditQuizModal from './EditQuizModal'
import { Edit, Delete } from '@mui/icons-material'

const emptyModule = { title: '', description: '' }
const emptyAssignment = { title: '', instructions: '', due_at: '', module_id: '', status: 'published' }
const emptyAnnouncement = { title: '', body: '' }

function formatDateTime(value) {
  if (!value) return 'No due date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'No due date' : date.toLocaleString()
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-[28px] border border-token bg-surface p-5 shadow-sm md:p-6">
      <h2 className="text-2xl font-black tracking-[-0.03em] text-main">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-7 text-muted">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Badge({ children, tone = 'bg-surface' }) {
  return <span className={`rounded-full border border-token px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-main ${tone}`}>{children}</span>
}

function EmptyState({ children }) {
  return <div className="rounded-2xl border border-token bg-app p-4 text-sm text-muted">{children}</div>
}

export default function CourseDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const { setCurrentCourseName } = useCourseName()
  const userId = user?.id

  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [submissionLists, setSubmissionLists] = useState({})
  const [submissionDrafts, setSubmissionDrafts] = useState({})
  const [gradingDrafts, setGradingDrafts] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeComposer, setActiveComposer] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const [moduleForm, setModuleForm] = useState(emptyModule)
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignment)
  const [quizForm, setQuizForm] = useState(createEmptyQuizDraft())
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncement)

  // Edit modal states
  const [editingModule, setEditingModule] = useState(null)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [editModuleModalOpen, setEditModuleModalOpen] = useState(false)
  const [editAssignmentModalOpen, setEditAssignmentModalOpen] = useState(false)
  const [editQuizModalOpen, setEditQuizModalOpen] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Delete confirmation states
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: '', item: null })
  const [isDeleting, setIsDeleting] = useState(false)

  async function loadCourseWorkspace() {
    if (!id || !userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [courseRes, modulesRes, assignmentsRes, quizzesRes, noticesRes] = await Promise.all([
        fetch(`/api/courses/${id}?user_id=${encodeURIComponent(userId)}`),
        fetch(`/api/courses/${id}/modules?user_id=${encodeURIComponent(userId)}`),
        fetch(`/api/courses/${id}/assignments?user_id=${encodeURIComponent(userId)}`),
        fetch(`/api/courses/${id}/quizzes?user_id=${encodeURIComponent(userId)}`),
        fetch(`/api/notifications?user_id=${encodeURIComponent(userId)}&course_id=${encodeURIComponent(id)}&limit=10`),
      ])
      const [courseData, modulesData, assignmentsData, quizzesData, noticesData] = await Promise.all([
        safeJson(courseRes),
        safeJson(modulesRes),
        safeJson(assignmentsRes),
        safeJson(quizzesRes),
        safeJson(noticesRes),
      ])
      if (!courseRes.ok) throw new Error(getApiErrorMessage(courseData, 'We could not load this course.'))
      if (!modulesRes.ok) throw new Error(getApiErrorMessage(modulesData, 'We could not load the lessons.'))
      if (!assignmentsRes.ok) throw new Error(getApiErrorMessage(assignmentsData, 'We could not load the assignments.'))
      if (!quizzesRes.ok) throw new Error(getApiErrorMessage(quizzesData, 'We could not load the quizzes.'))
      if (!noticesRes.ok) throw new Error(getApiErrorMessage(noticesData, 'We could not load the announcements.'))

      setCourse(courseData)
      setCurrentCourseName(courseData?.title || 'Course Details')
      setModules(Array.isArray(modulesData) ? modulesData : [])
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : [])
      setAnnouncements(Array.isArray(noticesData) ? noticesData.filter((item) => item.type === 'announcement') : [])
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
    () => Boolean(course) && (course.viewer_role === 'teacher' || String(course.author) === String(userId)),
    [course, userId]
  )

  const stats = useMemo(() => {
    if (!course) return []
    return [
      { label: 'Modules', value: modules.length },
      { label: 'Assignments', value: assignments.length },
      { label: 'Quizzes', value: quizzes.length },
      { label: 'Announcements', value: announcements.length },
    ]
  }, [course, modules, assignments, quizzes, announcements])

  const withAction = async (action, fallback) => {
    try {
      await action()
      setMessage('')
    } catch (err) {
      console.error(err)
      setMessage(err.message || fallback)
    }
  }

  const loadSubmissions = async (activityId) => {
    const res = await fetch(`/api/assignments/${activityId}/submissions?user_id=${encodeURIComponent(userId)}`)
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'We could not load the submitted work.'))
    setSubmissionLists((current) => ({ ...current, [activityId]: Array.isArray(data) ? data : [] }))
  }

  const createModule = async () => {
    if (!moduleForm.title.trim()) throw new Error('Add a module title before saving.')
    const res = await fetch(`/api/courses/${id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...moduleForm, title: moduleForm.title.trim(), description: moduleForm.description.trim(), user_id: userId }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'We could not create the lesson.'))
    setModuleForm(emptyModule)
    setActiveComposer('')
    await loadCourseWorkspace()
  }

  const createAssignment = async () => {
    if (!assignmentForm.title.trim()) throw new Error('Add an assignment title before publishing.')
    const res = await fetch(`/api/courses/${id}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...assignmentForm,
        title: assignmentForm.title.trim(),
        instructions: assignmentForm.instructions.trim(),
        due_at: assignmentForm.due_at ? new Date(assignmentForm.due_at).toISOString() : null,
        module_id: assignmentForm.module_id || null,
        user_id: userId,
      }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'We could not create the assignment.'))
    setAssignmentForm(emptyAssignment)
    setActiveComposer('')
    await loadCourseWorkspace()
  }

  const createQuiz = async () => {
    if (!quizForm.title.trim()) throw new Error('Add a quiz title before publishing.')
    const normalizedQuestions = quizForm.questions
      .map((question) => ({
        text: String(question.text || '').trim(),
        options: Array.isArray(question.options) ? question.options.map((option) => String(option || '').trim()) : [],
        correct: Number.isInteger(question.correct) ? question.correct : 0,
      }))
      .filter((question) => question.text && question.options.every(Boolean))

    if (!normalizedQuestions.length) throw new Error('Add at least one complete question before publishing.')

    const res = await fetch(`/api/courses/${id}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: quizForm.title.trim(),
        description: quizForm.description.trim(),
        due_at: quizForm.due_at ? new Date(quizForm.due_at).toISOString() : null,
        status: quizForm.status,
        questions: normalizedQuestions,
        user_id: userId,
      }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'We could not create the quiz.'))
    setQuizForm(createEmptyQuizDraft())
    setActiveComposer('')
    await loadCourseWorkspace()
  }

  const createAnnouncement = async () => {
    if (!announcementForm.title.trim()) throw new Error('Add an announcement title before publishing.')
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actor_user_id: userId,
        user_id: userId,
        course_id: id,
        type: 'announcement',
        title: announcementForm.title.trim(),
        body: announcementForm.body.trim(),
      }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'We could not post the announcement.'))
    setAnnouncementForm(emptyAnnouncement)
    setActiveComposer('')
    await loadCourseWorkspace()
  }

  const submitWork = async (activityId, contentOverride = null) => {
    const contentValue = contentOverride ?? (submissionDrafts[activityId] || '')
    const serializedContent = typeof contentValue === 'string' ? contentValue.trim() : JSON.stringify(contentValue)
    if (!serializedContent) throw new Error('Add a response before submitting.')
    const res = await fetch(`/api/assignments/${activityId}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, content: serializedContent }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'We could not submit your work.'))
    setSubmissionDrafts((current) => ({ ...current, [activityId]: '' }))
    await loadCourseWorkspace()
  }

  const gradeSubmission = async (submissionId, activityId) => {
    const draft = gradingDrafts[submissionId] || {}
    const res = await fetch(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, score: draft.score, feedback: draft.feedback }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'We could not save the grade.'))
    setGradingDrafts((current) => ({ ...current, [submissionId]: { score: '', feedback: '' } }))
    await Promise.all([loadCourseWorkspace(), loadSubmissions(activityId)])
  }

  // Edit module
  const updateModule = async (updates) => {
    setIsSavingEdit(true)
    try {
      const res = await fetch(`/api/courses/${id}/modules`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, user_id: userId }),
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to update module.'))
      setModules(prev => prev.map(m => m.id === data.id ? data : m))
      setEditModuleModalOpen(false)
      setEditingModule(null)
      setMessage('')
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Failed to update module.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Edit assignment
  const updateAssignment = async (updates) => {
    setIsSavingEdit(true)
    try {
      const res = await fetch(`/api/courses/${id}/assignments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, user_id: userId }),
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to update assignment.'))
      setAssignments(prev => prev.map(a => a.id === data.id ? data : a))
      setEditAssignmentModalOpen(false)
      setEditingAssignment(null)
      setMessage('')
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Failed to update assignment.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Edit quiz
  const updateQuiz = async (updates) => {
    setIsSavingEdit(true)
    try {
      const res = await fetch(`/api/courses/${id}/quizzes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, user_id: userId }),
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to update quiz.'))
      setQuizzes(prev => prev.map(q => q.id === data.id ? data : q))
      setEditQuizModalOpen(false)
      setEditingQuiz(null)
      setMessage('')
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Failed to update quiz.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Delete module
  const deleteModule = async (moduleId) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/courses/${id}/modules`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: moduleId, user_id: userId }),
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to delete module.'))
      setModules(prev => prev.filter(m => m.id !== moduleId))
      setDeleteConfirm({ isOpen: false, type: '', item: null })
      setMessage('')
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Failed to delete module.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Delete assignment
  const deleteAssignment = async (assignmentId) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/courses/${id}/assignments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assignmentId, user_id: userId }),
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to delete assignment.'))
      setAssignments(prev => prev.filter(a => a.id !== assignmentId))
      setDeleteConfirm({ isOpen: false, type: '', item: null })
      setMessage('')
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Failed to delete assignment.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Delete quiz
  const deleteQuiz = async (quizId, assignmentId) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/courses/${id}/quizzes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: quizId, assignment_id: assignmentId, user_id: userId }),
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to delete quiz.'))
      setQuizzes(prev => prev.filter(q => q.id !== quizId))
      setDeleteConfirm({ isOpen: false, type: '', item: null })
      setMessage('')
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Failed to delete quiz.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) return <Loading message="Loading class..." />

  if (!course) {
    return (
      <div className="mx-auto max-w-5xl rounded-[28px] border border-token bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-black text-main">Course not found</h1>
        <p className="mt-2 text-sm text-muted">{message || 'This class could not be loaded.'}</p>
        <Link to="/courses" className="mt-5 inline-flex rounded-2xl border border-token bg-[#243041] px-4 py-2 text-sm font-semibold text-white">Back to courses</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header with Breadcrumb */}
      <PageHeader
        logo="Academee"
        items={[
          { label: 'Courses', href: '/courses' },
          { label: course.title }
        ]}
        title={course.title}
        subtitle={`${course.course_code || 'Code N/A'} • ${course.author_name || 'Unknown teacher'}`}
      />

      {/* Course Tabs */}
      <CourseTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Header Stats */}
      <div>
        <HeaderStats stats={stats} />
      </div>

      {/* Message/Error Display */}
      {message ? <div className="rounded-[24px] border border-token bg-[#fff1f1] p-4 text-sm text-red-700 shadow-sm">{message}</div> : null}

      {/* Progress Tab */}
      {activeTab === 'progress' ? (
        isTeacher ? (
          <TeacherStudentProgress courseId={id} />
        ) : (
          <StudentProgress courseId={id} />
        )
      ) : null}

      {activeTab === 'overview' ? (
        <>
        <Section title="Teacher actions" description="Choose what you want to add, then fill in just that form.">
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'announcement', label: 'Add announcement', tone: 'bg-[#fff7e0]' },
              { key: 'module', label: 'Add module', tone: 'bg-[#dff4d8]' },
              { key: 'assignment', label: 'Add assignment', tone: 'bg-[#dbe8ff]' },
              { key: 'quiz', label: 'Add quiz', tone: 'bg-[#ffe38a]' },
            ].map((item) => (
              <button key={item.key} type="button" onClick={() => setActiveComposer((current) => (current === item.key ? '' : item.key))} className={`rounded-2xl border border-token px-4 py-3 text-sm font-semibold text-main shadow-sm transition hover:-translate-y-0.5 ${item.tone} ${activeComposer === item.key ? 'ring-2 ring-[#243041]' : ''}`}>
                {item.label}
              </button>
            ))}
          </div>

          {activeComposer === 'announcement' ? <Composer onCancel={() => setActiveComposer('')} onSubmit={() => withAction(createAnnouncement, 'Failed to publish announcement.')} submitLabel="Publish announcement">
            <input className="input-base" placeholder="Announcement title" value={announcementForm.title} onChange={(e) => setAnnouncementForm((c) => ({ ...c, title: e.target.value }))} />
            <textarea className="input-base min-h-[100px]" placeholder="Share an update with this class" value={announcementForm.body} onChange={(e) => setAnnouncementForm((c) => ({ ...c, body: e.target.value }))} />
          </Composer> : null}

          {activeComposer === 'module' ? <Composer onCancel={() => setActiveComposer('')} onSubmit={() => withAction(createModule, 'Failed to create module.')} submitLabel="Add module">
            <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
              <input className="input-base" placeholder="Module title" value={moduleForm.title} onChange={(e) => setModuleForm((c) => ({ ...c, title: e.target.value }))} />
              <input className="input-base" placeholder="Short description" value={moduleForm.description} onChange={(e) => setModuleForm((c) => ({ ...c, description: e.target.value }))} />
            </div>
          </Composer> : null}

          {activeComposer === 'assignment' ? <Composer onCancel={() => setActiveComposer('')} onSubmit={() => withAction(createAssignment, 'Failed to create assignment.')} submitLabel="Add assignment">
            <input className="input-base" placeholder="Assignment title" value={assignmentForm.title} onChange={(e) => setAssignmentForm((c) => ({ ...c, title: e.target.value }))} />
            <textarea className="input-base min-h-[100px]" placeholder="Instructions" value={assignmentForm.instructions} onChange={(e) => setAssignmentForm((c) => ({ ...c, instructions: e.target.value }))} />
            <div className="grid gap-3 md:grid-cols-3">
              <select className="input-base" value={assignmentForm.module_id} onChange={(e) => setAssignmentForm((c) => ({ ...c, module_id: e.target.value }))}><option value="">No module</option>{modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</select>
              <input className="input-base" type="datetime-local" value={assignmentForm.due_at} onChange={(e) => setAssignmentForm((c) => ({ ...c, due_at: e.target.value }))} />
              <select className="input-base" value={assignmentForm.status} onChange={(e) => setAssignmentForm((c) => ({ ...c, status: e.target.value }))}><option value="published">Publish now</option><option value="draft">Save as draft</option></select>
            </div>
          </Composer> : null}

          {activeComposer === 'quiz' ? <Composer onCancel={() => setActiveComposer('')} onSubmit={() => withAction(createQuiz, 'Failed to create quiz.')} submitLabel="Add quiz">
            <QuizComposer value={quizForm} onChange={setQuizForm} />
          </Composer> : null}
        </Section>
      ) : null}

      <Section title="Announcements" description="Course-wide updates stay visible to both teachers and students.">
        <div className="space-y-3">
          {announcements.length === 0 ? <EmptyState>No announcements yet.</EmptyState> : null}
          {announcements.map((item) => <div key={item.id} className="rounded-[24px] border border-token bg-app p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="font-semibold text-main">{item.title}</div><span className="text-xs text-muted">{formatDateTime(item.created_at)}</span></div>{item.body ? <p className="mt-2 text-sm leading-7 text-muted">{item.body}</p> : null}</div>)}
        </div>
      </Section>

      <Section title="Modules" description="Organize lessons and activities in the order learners should follow.">
        <div className="space-y-3">
          {modules.length === 0 ? <EmptyState>No modules yet.</EmptyState> : null}
          {modules.map((module, index) => (
            <div key={module.id} className="rounded-[24px] border border-token bg-app p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-main">{module.title}</div>
                  {module.description && <p className="mt-2 text-sm leading-7 text-muted">{module.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Badge tone={index % 2 === 0 ? 'bg-[#dbe8ff]' : 'bg-[#dff4d8]'}>Lesson</Badge>
                  {isTeacher && (
                    <>
                      <button
                        onClick={() => { setEditingModule(module); setEditModuleModalOpen(true) }}
                        className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Edit module"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, type: 'module', item: module })}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        title="Delete module"
                      >
                        <Delete className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Assignments" description="Publish work with due dates and collect submissions inside the course.">
        <div className="space-y-4">
          {assignments.length === 0 ? <EmptyState>No assignments yet.</EmptyState> : null}
          {assignments.map((assignment) => (
            <ActivityCard
              key={assignment.id}
              item={assignment}
              type="assignment"
              isTeacher={isTeacher}
              activityId={assignment.id}
              onLoadSubmissions={loadSubmissions}
              submissionLists={submissionLists}
              gradingDrafts={gradingDrafts}
              setGradingDrafts={setGradingDrafts}
              onGrade={gradeSubmission}
              submissionDrafts={submissionDrafts}
              setSubmissionDrafts={setSubmissionDrafts}
              onSubmit={submitWork}
              onEdit={(a) => { setEditingAssignment(a); setEditAssignmentModalOpen(true) }}
              onDelete={(a) => setDeleteConfirm({ isOpen: true, type: 'assignment', item: a })}
            />
          ))}
        </div>
      </Section>

      <Section title="Quizzes" description="Build, publish, take, and review richer multiple-choice quizzes inside the course workspace.">
        <div className="space-y-4">
          {quizzes.length === 0 ? <EmptyState>No quizzes yet.</EmptyState> : null}
          {quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} isTeacher={isTeacher} onLoadSubmissions={loadSubmissions} submissionLists={submissionLists} gradingDrafts={gradingDrafts} setGradingDrafts={setGradingDrafts} onGrade={gradeSubmission} onSubmit={submitWork} onEdit={(q) => { setEditingQuiz(q); setEditQuizModalOpen(true) }} onDelete={(q) => setDeleteConfirm({ isOpen: true, type: 'quiz', item: q })} />)}
        </div>
      </Section>

      {/* Edit Modals */}
      <EditModuleModal
        isOpen={editModuleModalOpen}
        module={editingModule}
        onSave={updateModule}
        onCancel={() => { setEditModuleModalOpen(false); setEditingModule(null) }}
        isLoading={isSavingEdit}
      />

      <EditAssignmentModal
        isOpen={editAssignmentModalOpen}
        assignment={editingAssignment}
        modules={modules}
        onSave={updateAssignment}
        onCancel={() => { setEditAssignmentModalOpen(false); setEditingAssignment(null) }}
        isLoading={isSavingEdit}
      />

      <EditQuizModal
        isOpen={editQuizModalOpen}
        quiz={editingQuiz}
        onSave={updateQuiz}
        onCancel={() => { setEditQuizModalOpen(false); setEditingQuiz(null) }}
        isLoading={isSavingEdit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={`Delete ${deleteConfirm.type}`}
        message={`Are you sure you want to delete "${deleteConfirm.item?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous={true}
        onConfirm={() => {
          if (deleteConfirm.type === 'module') {
            deleteModule(deleteConfirm.item.id)
          } else if (deleteConfirm.type === 'assignment') {
            deleteAssignment(deleteConfirm.item.id)
          } else if (deleteConfirm.type === 'quiz') {
            deleteQuiz(deleteConfirm.item.id, deleteConfirm.item.assignment_id)
          }
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: '', item: null })}
        isLoading={isDeleting}
      />
      </>
      ) : null}
    </div>
  )
}

function Composer({ children, onCancel, onSubmit, submitLabel }) {
  return (
    <div className="mt-5 grid gap-3 rounded-[24px] border border-token bg-app p-4">
      {children}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-2xl border border-token bg-surface px-4 py-3 text-sm font-semibold text-main">Cancel</button>
        <button type="button" onClick={onSubmit} className="rounded-2xl border border-token bg-[#243041] px-4 py-3 text-sm font-semibold text-white">{submitLabel}</button>
      </div>
    </div>
  )
}

function ActivityCard({ item, type, isTeacher, activityId, onLoadSubmissions, submissionLists, gradingDrafts, setGradingDrafts, onGrade, submissionDrafts, setSubmissionDrafts, onSubmit, onEdit, onDelete }) {
  const detailText = `${item.module_title ? `${item.module_title} • ` : ''}Due ${formatDateTime(item.due_at)}`

  return (
    <div className="rounded-[24px] border border-token bg-app p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1">
          <div className="font-semibold text-main">{item.title}</div>
          <div className="mt-1 text-sm text-muted">{detailText}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="bg-[#fffdfa]">{item.status_for_user || item.status}</Badge>
          {isTeacher ? <Badge tone="bg-[#ffe38a]">{item.pending_review_count || 0} pending</Badge> : null}
          {isTeacher && (
            <>
              <button
                onClick={() => onEdit(item)}
                className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                title="Edit assignment"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(item)}
                className="p-2 text-red-600 hover:text-red-700 transition-colors"
                title="Delete assignment"
              >
                <Delete className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
      {item.instructions ? <p className="mt-3 text-sm leading-7 text-muted">{item.instructions}</p> : null}

      {isTeacher ? (
        <div className="mt-4">
          <button type="button" onClick={() => onLoadSubmissions(activityId)} className="rounded-2xl border border-token bg-surface px-3 py-2 text-sm font-medium text-main">Review submissions</button>
          {(submissionLists[activityId] || []).length > 0 ? <div className="mt-4 space-y-3">{(submissionLists[activityId] || []).map((submission) => <div key={submission.id} className="rounded-[22px] border border-token bg-surface p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="font-medium text-main">{submission.student_name}</div><div className="text-xs text-muted">{submission.status} • {formatDateTime(submission.submitted_at)}</div></div><Badge tone="bg-[#edf2ff]">{submission.status}</Badge></div>{submission.content ? <p className="mt-3 text-sm leading-7 text-muted">{submission.content}</p> : null}<div className="mt-3 grid gap-3 md:grid-cols-[140px_1fr_auto]"><input className="input-base" placeholder="Score" value={gradingDrafts[submission.id]?.score ?? ''} onChange={(e) => setGradingDrafts((c) => ({ ...c, [submission.id]: { ...c[submission.id], score: e.target.value } }))} /><input className="input-base" placeholder="Feedback" value={gradingDrafts[submission.id]?.feedback ?? ''} onChange={(e) => setGradingDrafts((c) => ({ ...c, [submission.id]: { ...c[submission.id], feedback: e.target.value } }))} /><button type="button" onClick={() => onGrade(submission.id, activityId)} className="rounded-2xl border border-token bg-[#243041] px-4 py-2 text-sm font-semibold text-white">Save grade</button></div></div>)}</div> : null}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <textarea className="input-base min-h-[110px]" placeholder="Write your submission or paste a link" value={submissionDrafts[activityId] || ''} onChange={(e) => setSubmissionDrafts((c) => ({ ...c, [activityId]: e.target.value }))} />
          <div className="flex justify-end"><button type="button" onClick={() => onSubmit(activityId)} className="rounded-2xl border border-token bg-[#243041] px-4 py-3 text-sm font-semibold text-white">Submit work</button></div>
        </div>
      )}
    </div>
  )
}

function QuizCard({ quiz, isTeacher, onLoadSubmissions, submissionLists, gradingDrafts, setGradingDrafts, onGrade, onSubmit, onEdit, onDelete }) {
  const activityId = quiz.assignment_id || quiz.id
  const questions = normalizeQuizQuestions(quiz?.meta?.questions)

  return (
    <div className="rounded-[24px] border border-token bg-app p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1">
          <div className="font-semibold text-main">{quiz.title}</div>
          <div className="mt-1 text-sm text-muted">{questions.length || quiz.question_count || 0} questions • Due {formatDateTime(quiz.due_at)}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="bg-[#fffdfa]">{quiz.status_for_user || quiz.status}</Badge>
          {isTeacher ? <Badge tone="bg-[#ffe38a]">{quiz.pending_review_count || 0} pending</Badge> : null}
          {isTeacher && (
            <>
              <button
                onClick={() => onEdit(quiz)}
                className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                title="Edit quiz"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(quiz)}
                className="p-2 text-red-600 hover:text-red-700 transition-colors"
                title="Delete quiz"
              >
                <Delete className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {quiz.description ? <p className="mt-3 text-sm leading-7 text-muted">{quiz.description}</p> : null}

      {isTeacher ? (
        <div className="mt-4">
          <button type="button" onClick={() => onLoadSubmissions(activityId)} className="rounded-2xl border border-token bg-surface px-3 py-2 text-sm font-medium text-main">Review submissions</button>
          {(submissionLists[activityId] || []).length > 0 ? <div className="mt-4 space-y-3">{(submissionLists[activityId] || []).map((submission) => <div key={submission.id} className="rounded-[22px] border border-token bg-surface p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="font-medium text-main">{submission.student_name}</div><div className="text-xs text-muted">{submission.status} • {formatDateTime(submission.submitted_at)}</div></div><Badge tone="bg-[#edf2ff]">{submission.status}</Badge></div>{submission.content ? <p className="mt-3 text-sm leading-7 text-muted">{submission.content}</p> : null}<div className="mt-3 grid gap-3 md:grid-cols-[140px_1fr_auto]"><input className="input-base" placeholder="Score" value={gradingDrafts[submission.id]?.score ?? ''} onChange={(e) => setGradingDrafts((c) => ({ ...c, [submission.id]: { ...c[submission.id], score: e.target.value } }))} /><input className="input-base" placeholder="Feedback" value={gradingDrafts[submission.id]?.feedback ?? ''} onChange={(e) => setGradingDrafts((c) => ({ ...c, [submission.id]: { ...c[submission.id], feedback: e.target.value } }))} /><button type="button" onClick={() => onGrade(submission.id, activityId)} className="rounded-2xl border border-token bg-[#243041] px-4 py-2 text-sm font-semibold text-white">Save grade</button></div></div>)}</div> : null}
        </div>
      ) : (
        questions.length ? (
          <QuizAttemptCard quiz={quiz} submission={quiz.submission} onSubmit={(attempt) => onSubmit(activityId, attempt)} />
        ) : (
          <div className="mt-4 space-y-3">
            <textarea className="input-base min-h-[110px]" placeholder="Write your quiz response" />
            <div className="flex justify-end">
              <button type="button" onClick={() => onSubmit(activityId)} className="rounded-2xl border border-token bg-[#243041] px-4 py-3 text-sm font-semibold text-white">
                Submit quiz
              </button>
            </div>
          </div>
        )
      )}
    </div>
  )
}
