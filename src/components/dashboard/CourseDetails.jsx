import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loading from '../Loading'
import CourseTabs from '../CourseTabs'
import StudentProgress from './StudentProgress'
import TeacherStudentProgress from './TeacherStudentProgress'
import { useAuth } from '../../lib/AuthProvider'
import { apiFetch } from '../../lib/apiClient'
import { useCourseName } from '../../lib/CourseNameContext'
import { getApiErrorMessage, safeJson } from '../courses/utils'
import QuizComposer, { createEmptyQuizDraft } from '../quizzes/QuizComposer'
import QuizAttemptCard from '../quizzes/QuizAttemptCard'
import { normalizeQuizQuestions } from '../quizzes/quizUtils'
import ConfirmDialog from './ConfirmDialog'
import EditModuleModal from './EditModuleModal'
import EditAssignmentModal from './EditAssignmentModal'
import EditQuizModal from './EditQuizModal'
import {
  AssignmentOutlined,
  ChangeHistoryOutlined,
  Delete,
  Edit,
  EditOutlined,
  FullscreenOutlined,
  InfoOutlined,
  MoreVert,
  SettingsOutlined,
  SwapHoriz,
} from '@mui/icons-material'

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
  const courseNameContext = useCourseName() || {}
  const { setCurrentCourseName = () => {} } = courseNameContext
  const userId = user?.id

  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [submissionLists, setSubmissionLists] = useState({})
  const [submissionDrafts, setSubmissionDrafts] = useState({})
  const [gradingDrafts, setGradingDrafts] = useState({})
  const [loadingSubmissions, setLoadingSubmissions] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeComposer, setActiveComposer] = useState('')
  const [activeTab, setActiveTab] = useState('stream')

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
        apiFetch(`/api/courses/${id}?user_id=${encodeURIComponent(userId)}`),
        apiFetch(`/api/courses/${id}/modules?user_id=${encodeURIComponent(userId)}`),
        apiFetch(`/api/courses/${id}/assignments?user_id=${encodeURIComponent(userId)}`),
        apiFetch(`/api/courses/${id}/quizzes?user_id=${encodeURIComponent(userId)}`),
        apiFetch(`/api/notifications?user_id=${encodeURIComponent(userId)}&course_id=${encodeURIComponent(id)}&limit=10`),
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

  const activityFeed = useMemo(() => {
    const items = []

    // Add announcements
    announcements.forEach((item) => {
      items.push({
        id: `ann-${item.id}`,
        type: 'announcement',
        title: item.title,
        body: item.body,
        timestamp: item.created_at,
        icon: '📢',
        color: 'bg-[#fff7e0]',
        data: item,
      })
    })

    // Add modules
    modules.forEach((item) => {
      items.push({
        id: `mod-${item.id}`,
        type: 'module',
        title: item.title,
        description: item.description,
        timestamp: item.created_at,
        icon: '📚',
        color: 'bg-[#dff4d8]',
        data: item,
      })
    })

    // Add assignments
    assignments.forEach((item) => {
      items.push({
        id: `asg-${item.id}`,
        type: 'assignment',
        title: item.title,
        instructions: item.instructions,
        timestamp: item.created_at,
        dueAt: item.due_at,
        icon: '📝',
        color: 'bg-[#dbe8ff]',
        data: item,
      })
    })

    // Add quizzes
    quizzes.forEach((item) => {
      items.push({
        id: `quiz-${item.id}`,
        type: 'quiz',
        title: item.title,
        description: item.description,
        timestamp: item.created_at,
        dueAt: item.due_at,
        icon: '📋',
        color: 'bg-[#ffe38a]',
        data: item,
      })
    })

    // Sort by timestamp descending (newest first)
    return items.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
  }, [announcements, modules, assignments, quizzes])

  const nextDueItem = useMemo(() => {
    const datedItems = [...assignments, ...quizzes]
      .filter((item) => item.due_at)
      .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))
    return datedItems[0] || null
  }, [assignments, quizzes])

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
    setLoadingSubmissions((current) => ({ ...current, [activityId]: true }))
    try {
      const res = await apiFetch(`/api/assignments/${activityId}/submissions?user_id=${encodeURIComponent(userId)}`)
      const data = await safeJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'We could not load the submitted work.'))
      const submissions = Array.isArray(data) ? data : []
      setSubmissionLists((current) => ({ ...current, [activityId]: submissions }))
      setGradingDrafts((current) => {
        const next = { ...current }
        submissions.forEach((submission) => {
          if (!next[submission.id]) {
            next[submission.id] = {
              score: submission.score ?? '',
              feedback: submission.feedback || '',
            }
          }
        })
        return next
      })
    } finally {
      setLoadingSubmissions((current) => ({ ...current, [activityId]: false }))
    }
  }

  const createModule = async () => {
    if (!moduleForm.title.trim()) throw new Error('Add a module title before saving.')
    const res = await apiFetch(`/api/courses/${id}/modules`, {
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
    const res = await apiFetch(`/api/courses/${id}/assignments`, {
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

    const res = await apiFetch(`/api/courses/${id}/quizzes`, {
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
    const res = await apiFetch('/api/notifications', {
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
    const res = await apiFetch(`/api/assignments/${activityId}/submissions`, {
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
    const res = await apiFetch(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, score: draft.score, feedback: draft.feedback }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'We could not save the grade.'))
    setGradingDrafts((current) => ({ ...current, [submissionId]: { score: '', feedback: '' } }))
    await Promise.all([loadCourseWorkspace(), loadSubmissions(activityId)])
  }

  const updateGradingDraft = (submissionId, updates) => {
    setGradingDrafts((current) => ({
      ...current,
      [submissionId]: {
        ...(current[submissionId] || {}),
        ...updates,
      },
    }))
  }

  // Edit module
  const updateModule = async (updates) => {
    setIsSavingEdit(true)
    try {
      const res = await apiFetch(`/api/courses/${id}/modules`, {
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
      const res = await apiFetch(`/api/courses/${id}/assignments`, {
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
      const res = await apiFetch(`/api/courses/${id}/quizzes`, {
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
      const res = await apiFetch(`/api/courses/${id}/modules`, {
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
      const res = await apiFetch(`/api/courses/${id}/assignments`, {
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
      const res = await apiFetch(`/api/courses/${id}/quizzes`, {
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
    <div className="-mx-4 -my-6 min-h-screen bg-white text-[#202124] md:-mx-8 lg:-mx-10">
        subtitle={`${course.course_code || 'Code N/A'} • ${course.author_name || 'Unknown teacher'}`}
      <CourseTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="mx-auto max-w-[800px] px-4 py-[18px]">
        <div className="overflow-hidden rounded-lg bg-[#3367d6]">
          <div className="relative min-h-[192px] p-5 text-white sm:p-6">
            <div className="relative z-10 max-w-[52%]">
              <h1 className="break-words text-[28px] font-medium leading-tight">{course.title}</h1>
              <p className="mt-2 break-words text-base font-semibold">{course.description || course.author_name || 'Class stream'}</p>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] overflow-hidden sm:block">
              <ClassroomHeroArt />
            </div>
            {isTeacher ? (
              <button type="button" className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-[12px] font-semibold text-[#1967d2] shadow-[0_1px_4px_rgba(60,64,67,.3)] transition hover:bg-[#f8fafd]">
                <EditOutlined sx={{ fontSize: 17 }} />
                Customize
              </button>
            ) : null}
            <InfoOutlined className="absolute bottom-3 right-3 z-10 text-white/90" sx={{ fontSize: 19 }} />
          </div>
        </div>

      {/* Message/Error Display */}
      {message ? <div className="rounded-[24px] border border-token bg-[#fff1f1] p-4 text-sm text-red-700 shadow-sm">{message}</div> : null}

      {/* Progress Tab */}
      {activeTab === 'people' ? (
        isTeacher ? (
          <TeacherStudentProgress courseId={id} />
        ) : (
          <StudentProgress courseId={id} />
        )
      ) : null}

      {activeTab === 'stream' ? (
        <>
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Class Code Card */}
              {course?.course_code && (
                <div className="rounded-[24px] border border-token bg-surface p-4">
                  <h3 className="text-sm font-semibold text-main uppercase">Class code</h3>
                  <p className="mt-3 text-lg font-bold text-main font-mono">{course.course_code}</p>
                </div>
              )}
              
              {/* Upcoming Card */}
              <div className="rounded-[24px] border border-token bg-surface p-4">
                <h3 className="text-sm font-semibold text-main uppercase">Upcoming</h3>
                <p className="mt-3 text-sm text-muted">No work due soon</p>
                <button className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700">View all</button>
              </div>
            </div>

            {/* Right Main Content */}
            <div className="lg:col-span-3 space-y-4">
              {/* Teacher Action Buttons */}
              {isTeacher && (
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
              )}

              {/* Composers */}
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

              {/* Activity Feed */}
              <div className="rounded-[24px] border border-token bg-surface p-6">
                {activityFeed.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-lg font-semibold text-muted">No activity yet</p>
                    <p className="mt-1 text-sm text-muted">When teachers add content, it will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityFeed.map((item) => (
                      <div key={item.id} className={`rounded-[24px] border border-token ${item.color} p-4`}>
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="text-2xl">{item.icon}</div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-main">{item.title}</h3>
                                <p className="text-xs text-muted mt-1">{formatDateTime(item.timestamp)}</p>
                                
                                {item.type === 'announcement' && item.body && (
                                  <p className="mt-3 text-sm leading-7 text-muted">{item.body}</p>
                                )}
                                
                                {item.type === 'module' && item.description && (
                                  <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
                                )}
                                
                                {item.type === 'assignment' && (
                                  <>
                                    {item.instructions && <p className="mt-3 text-sm leading-7 text-muted">{item.instructions}</p>}
                                    <p className="mt-2 text-xs text-muted">Due: {formatDateTime(item.dueAt)}</p>
                                    {!isTeacher ? (
                                      <div className="mt-4 space-y-3">
                                        <textarea className="input-base min-h-[110px]" placeholder="Write your submission or paste a link" value={submissionDrafts[item.data.id] || ''} onChange={(e) => setSubmissionDrafts((c) => ({ ...c, [item.data.id]: e.target.value }))} />
                                        <div className="flex justify-end"><button type="button" onClick={() => submitWork(item.data.id)} className="rounded-2xl border border-token bg-[#243041] px-4 py-3 text-sm font-semibold text-white">Submit work</button></div>
                                      </div>
                                    ) : null}
                                    {isTeacher ? (
                                      <SubmissionPanel
                                        activityId={item.data.id}
                                        submissions={submissionLists[item.data.id]}
                                        loading={loadingSubmissions[item.data.id]}
                                        gradingDrafts={gradingDrafts}
                                        onLoad={() => withAction(() => loadSubmissions(item.data.id), 'Failed to load submissions.')}
                                        onDraftChange={updateGradingDraft}
                                        onGrade={(submissionId) => withAction(() => gradeSubmission(submissionId, item.data.id), 'Failed to save grade.')}
                                      />
                                    ) : null}
                                  </>
                                )}
                                
                                {item.type === 'quiz' && (
                                  <>
                                    {item.description && <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>}
                                    <p className="mt-2 text-xs text-muted">Due: {formatDateTime(item.dueAt)}</p>
                                    {!isTeacher ? (
                                      <div className="mt-4 space-y-3">
                                        <textarea className="input-base min-h-[110px]" placeholder="Write your quiz response" />
                                        <div className="flex justify-end"><button type="button" onClick={() => submitWork(item.data.assignment_id || item.data.id)} className="rounded-2xl border border-token bg-[#243041] px-4 py-3 text-sm font-semibold text-white">Submit quiz</button></div>
                                      </div>
                                    ) : null}
                                    {isTeacher ? (
                                      <SubmissionPanel
                                        activityId={item.data.assignment_id || item.data.id}
                                        submissions={submissionLists[item.data.assignment_id || item.data.id]}
                                        loading={loadingSubmissions[item.data.assignment_id || item.data.id]}
                                        gradingDrafts={gradingDrafts}
                                        onLoad={() => withAction(() => loadSubmissions(item.data.assignment_id || item.data.id), 'Failed to load submissions.')}
                                        onDraftChange={updateGradingDraft}
                                        onGrade={(submissionId) => withAction(() => gradeSubmission(submissionId, item.data.assignment_id || item.data.id), 'Failed to save grade.')}
                                      />
                                    ) : null}
                                  </>
                                )}
                              </div>

                              {/* Actions */}
                              {isTeacher && (
                                <div className="flex gap-1">
                                  {item.type === 'module' && (
                                    <>
                                      <button
                                        onClick={() => { setEditingModule(item.data); setEditModuleModalOpen(true) }}
                                        className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                        title="Edit module"
                                      >
                                        <Edit className="w-5 h-5" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm({ isOpen: true, type: 'module', item: item.data })}
                                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                        title="Delete module"
                                      >
                                        <Delete className="w-5 h-5" />
                                      </button>
                                    </>
                                  )}
                                  
                                  {item.type === 'assignment' && (
                                    <>
                                      <button
                                        onClick={() => { setEditingAssignment(item.data); setEditAssignmentModalOpen(true) }}
                                        className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                        title="Edit assignment"
                                      >
                                        <Edit className="w-5 h-5" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm({ isOpen: true, type: 'assignment', item: item.data })}
                                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                        title="Delete assignment"
                                      >
                                        <Delete className="w-5 h-5" />
                                      </button>
                                    </>
                                  )}
                                  
                                  {item.type === 'quiz' && (
                                    <>
                                      <button
                                        onClick={() => { setEditingQuiz(item.data); setEditQuizModalOpen(true) }}
                                        className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                        title="Edit quiz"
                                      >
                                        <Edit className="w-5 h-5" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm({ isOpen: true, type: 'quiz', item: item.data })}
                                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                        title="Delete quiz"
                                      >
                                        <Delete className="w-5 h-5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}

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
      </div>
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

function SubmissionPanel({
  activityId,
  submissions,
  loading,
  gradingDrafts,
  onLoad,
  onDraftChange,
  onGrade,
}) {
  const hasLoaded = Array.isArray(submissions)

  return (
    <div className="mt-4 rounded-2xl border border-token bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-black text-main">Student submissions</h4>
          <p className="mt-1 text-xs font-semibold text-muted">
            {hasLoaded ? `${submissions.length} submitted` : 'Load submitted work for this item.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onLoad}
          disabled={loading}
          className="rounded-xl border border-token bg-app px-3 py-2 text-xs font-bold text-main disabled:opacity-60"
        >
          {loading ? 'Loading...' : hasLoaded ? 'Refresh' : 'View submissions'}
        </button>
      </div>

      {hasLoaded && submissions.length === 0 ? (
        <div className="mt-4 rounded-xl border border-token bg-app p-3 text-sm text-muted">
          No submissions yet.
        </div>
      ) : null}

      {hasLoaded && submissions.length > 0 ? (
        <div className="mt-4 space-y-3">
          {submissions.map((submission) => {
            const draft = gradingDrafts[submission.id] || {}
            const submittedText = submission.content || submission.attachment_url || 'No written response.'

            return (
              <div key={submission.id} className="rounded-xl border border-token bg-app p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-black text-main">{submission.student_name || 'Student'}</div>
                    <div className="mt-1 text-xs font-semibold text-muted">
                      {submission.submitted_at ? `Submitted ${formatDateTime(submission.submitted_at)}` : 'Not submitted'}
                    </div>
                  </div>
                  <Badge tone={submission.status === 'graded' ? 'bg-[#e6f6ec]' : 'bg-[#fff7e0]'}>
                    {submission.status || 'submitted'}
                  </Badge>
                </div>

                <div className="mt-3 whitespace-pre-wrap rounded-xl border border-token bg-surface p-3 text-sm leading-6 text-main">
                  {submittedText}
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-[140px_1fr_auto]">
                  <input
                    className="input-base"
                    type="number"
                    min="0"
                    placeholder="Score"
                    value={draft.score ?? submission.score ?? ''}
                    onChange={(e) => onDraftChange(submission.id, { score: e.target.value })}
                  />
                  <input
                    className="input-base"
                    placeholder="Feedback"
                    value={draft.feedback ?? submission.feedback ?? ''}
                    onChange={(e) => onDraftChange(submission.id, { feedback: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => onGrade(submission.id)}
                    className="rounded-xl border border-token bg-[#243041] px-4 py-3 text-sm font-semibold text-white"
                  >
                    Return grade
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function ClassroomHeroArt() {
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      <div className="absolute -right-10 bottom-0 h-[148px] w-[116px] -rotate-12 rounded-lg bg-[#6fa0b7] shadow-[inset_-20px_0_40px_rgba(0,0,0,.18)]" />
      <div className="absolute right-[84px] top-0 h-[188px] w-[140px] -rotate-12 rounded-[6px] bg-[#f6d229] shadow-[inset_-18px_0_32px_rgba(0,0,0,.13)]">
        <div className="absolute left-3 top-0 h-full w-2 bg-[#f5a800]" />
        <div className="absolute left-11 top-[45px] h-16 w-16 rounded-lg bg-[#e0aa21]" />
        <div className="absolute left-16 top-16 h-16 w-16 rotate-45 rounded-lg bg-[#e6b326]" />
        <div className="absolute bottom-9 left-20 h-14 w-24 rounded-md bg-[#d9a520]" />
      </div>
      <div className="absolute bottom-0 left-10 h-[118px] w-[96px] rounded-t-full border-l-2 border-[#173179]" />
      <div className="absolute bottom-0 left-20 h-[104px] w-[86px] rounded-t-full border-l-2 border-[#173179]" />
      <div className="absolute bottom-20 left-8 h-20 w-4 rounded-full bg-[#0e2b7b] shadow-[6px_18px_0_#0e2b7b]" />
      <div className="absolute bottom-16 left-12 h-2 w-2 rounded-full bg-[#f6d229] shadow-[15px_24px_0_#f6d229]" />
    </div>
  )
}

