import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AddTaskOutlined,
  AssignmentOutlined,
  AutoStoriesOutlined,
  CalendarTodayOutlined,
  CheckCircleOutline,
  CloudUploadOutlined,
  GroupsOutlined,
  LibraryBooksOutlined,
  PlayArrowRounded,
  QuizOutlined,
  SchoolOutlined,
  TimelineOutlined,
  TrendingUp,
} from '@mui/icons-material'
import { useAuth } from '../../lib/AuthProvider'
import { useCourseModal } from '../../lib/CourseModalContext'
import { apiFetch } from '../../lib/apiClient'
import { safeJson } from '../courses/utils'
import defaultCourseImage from '../../assets/hero_pic.png'

const green = '#1f7a4d'

function Panel({ className = '', children }) {
  return (
    <div className={`rounded-[26px] border border-[#dfe9e2] bg-white shadow-[0_20px_55px_rgba(31,42,35,0.07)] ${className}`}>
      {children}
    </div>
  )
}

function MiniTrend({ tone = 'green' }) {
  const color = tone === 'amber' ? '#c97a17' : tone === 'blue' ? '#2563eb' : green
  return (
    <svg viewBox="0 0 100 32" className="h-8 w-24" aria-hidden="true">
      <path d="M2 25 C16 24 18 10 31 13 C45 16 44 25 58 21 C72 17 72 6 87 8 C93 9 97 6 99 4" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M2 29 C16 28 18 14 31 17 C45 20 44 29 58 25 C72 21 72 10 87 12 C93 13 97 10 99 8 L99 32 L2 32 Z" fill={color} opacity="0.08" />
    </svg>
  )
}

function StatCard({ icon: Icon, label, value, change, tone = 'green' }) {
  const palette = {
    green: 'bg-[#e6f6ec] text-[#145c39]',
    amber: 'bg-[#fff5df] text-[#995d13]',
    blue: 'bg-[#eaf1ff] text-[#1d4ed8]',
  }[tone]

  return (
    <Panel className="group overflow-hidden p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(31,122,77,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl ${palette}`}>
          <Icon sx={{ fontSize: 23 }} />
        </span>
        <span className="rounded-full bg-[#f3faf5] px-2.5 py-1 text-xs font-black text-[#145c39]">{change}</span>
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#66776d]">{label}</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-[#17251d]">{value}</p>
        </div>
        <MiniTrend tone={tone} />
      </div>
    </Panel>
  )
}

function formatDue(value, fallback = 'No deadline') {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getCourseProgress(course, index) {
  const explicit = Number(course.progress ?? course.completion_rate ?? course.percent_complete)
  if (Number.isFinite(explicit)) return Math.max(0, Math.min(100, explicit))
  return [72, 48, 86, 34][index % 4]
}

function CourseCard({ course, index, onOpen }) {
  const progress = getCourseProgress(course, index)
  const nextDeadline = course.next_due_at || course.due_at

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-[26px] border border-[#dfe9e2] bg-white text-left shadow-[0_20px_55px_rgba(31,42,35,0.07)] outline-none transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(31,122,77,0.13)] focus-visible:ring-4 focus-visible:ring-[#1f7a4d]/20"
    >
      <div className="relative h-36 overflow-hidden bg-[#e6f6ec]">
        <img src={course.cover_image || course.image || defaultCourseImage} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2115]/74 via-[#0d2115]/12 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-black text-[#145c39]">Active</span>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="truncate text-xs font-bold text-white/80">{course.author_name || course.instructor || course.author || 'Instructor'}</p>
          <h3 className="mt-1 line-clamp-2 text-xl font-black leading-6 text-white">{course.title || 'Course title'}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66776d]">Progress</span>
          <span className="text-sm font-black text-[#145c39]">{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf4ef]">
          <div className="h-full rounded-full bg-gradient-to-r from-[#1f7a4d] to-[#66b982]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span className="font-bold text-[#66776d]">Next deadline</span>
          <span className="font-black text-[#17251d]">{formatDue(nextDeadline)}</span>
        </div>
      </div>
    </button>
  )
}

function TaskItem({ task, index }) {
  const title = task?.title || ['Submit lesson reflection', 'Complete quiz review', 'Upload activity sheet'][index % 3]
  const due = task?.due_at || task?.deadline
  const urgent = index === 0 || task?.status === 'late'

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e2ebe5] bg-[#fbfffc] p-3.5 transition hover:border-[#b9d7c4] hover:bg-white">
      <span className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl ${urgent ? 'bg-[#fff3df] text-[#995d13]' : 'bg-[#e6f6ec] text-[#145c39]'}`}>
        <AssignmentOutlined sx={{ fontSize: 21 }} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-[#17251d]">{title}</p>
        <p className="mt-0.5 text-xs font-bold text-[#66776d]">{urgent ? 'Due soon' : 'Upcoming'} · {formatDue(due, 'This week')}</p>
      </div>
      <button type="button" className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#1f7a4d] shadow-sm transition hover:bg-[#e6f6ec]" aria-label={`Open ${title}`}>
        <PlayArrowRounded sx={{ fontSize: 20 }} />
      </button>
    </div>
  )
}

function EmptyTaskState({ onCreate }) {
  return (
    <div className="grid min-h-[240px] place-items-center rounded-3xl border border-dashed border-[#b9d7c4] bg-[#f7fcf8] p-6 text-center">
      <div>
        <div className="mx-auto flex h-20 w-24 items-end justify-center gap-1 rounded-[28px] bg-white shadow-[0_16px_38px_rgba(31,122,77,0.08)]">
          <span className="mb-4 h-8 w-3 rounded-full bg-[#b9d7c4]" />
          <span className="mb-4 h-12 w-3 rounded-full bg-[#66b982]" />
          <span className="mb-4 h-6 w-3 rounded-full bg-[#dfe9e2]" />
        </div>
        <h3 className="mt-5 text-lg font-black text-[#17251d]">No tasks yet</h3>
        <p className="mx-auto mt-2 max-w-xs text-sm font-bold leading-6 text-[#66776d]">Create a task or publish an assignment to help learners know what comes next.</p>
        <button type="button" onClick={onCreate} className="mt-5 rounded-2xl bg-[#1f7a4d] px-5 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(31,122,77,0.22)] transition hover:bg-[#18613d]">
          Create Task
        </button>
      </div>
    </div>
  )
}

function ActivityFeed({ courses, tasks }) {
  const items = [
    { icon: CheckCircleOutline, title: 'New submission received', detail: tasks[0]?.title || 'Activity sheet submitted', time: '8 min ago', tone: 'green' },
    { icon: AutoStoriesOutlined, title: 'Announcement posted', detail: courses[0]?.title || 'Course update shared', time: '1 hr ago', tone: 'blue' },
    { icon: QuizOutlined, title: 'Quiz result available', detail: 'Adaptive feedback generated', time: 'Yesterday', tone: 'amber' },
    { icon: CloudUploadOutlined, title: 'Material uploaded', detail: courses[1]?.title || 'New reading material', time: 'May 10', tone: 'green' },
  ]

  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#17251d]">Recent Activity</h2>
          <p className="mt-1 text-sm font-bold text-[#66776d]">Submissions, announcements, results, and uploads</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {items.map((item) => {
          const Icon = item.icon
          const tone = item.tone === 'amber' ? 'bg-[#fff5df] text-[#995d13]' : item.tone === 'blue' ? 'bg-[#eaf1ff] text-[#1d4ed8]' : 'bg-[#e6f6ec] text-[#145c39]'
          return (
            <div key={item.title} className="flex gap-3 rounded-2xl p-2.5 transition hover:bg-[#f7fcf8]">
              <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl ${tone}`}>
                <Icon sx={{ fontSize: 20 }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-[#17251d]">{item.title}</p>
                <p className="mt-0.5 truncate text-xs font-bold text-[#66776d]">{item.detail}</p>
              </div>
              <span className="text-xs font-bold text-[#839187]">{item.time}</span>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function QuickActions({ onJoin, onCreateQuiz, onUpload, onAssignment }) {
  const actions = [
    { label: 'Join Course', icon: GroupsOutlined, onClick: onJoin },
    { label: 'Create Quiz', icon: QuizOutlined, onClick: onCreateQuiz },
    { label: 'Upload Material', icon: CloudUploadOutlined, onClick: onUpload },
    { label: 'Add Assignment', icon: AddTaskOutlined, onClick: onAssignment },
  ]

  return (
    <Panel className="p-5">
      <h2 className="text-xl font-black text-[#17251d]">Quick Actions</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button key={action.label} type="button" onClick={action.onClick} className="min-h-[92px] rounded-2xl border border-[#dfe9e2] bg-[#fbfffc] p-3 text-left transition hover:-translate-y-0.5 hover:border-[#b9d7c4] hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1f7a4d]/20">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e6f6ec] text-[#145c39]">
                <Icon sx={{ fontSize: 20 }} />
              </span>
              <span className="mt-3 block text-sm font-black text-[#17251d]">{action.label}</span>
            </button>
          )
        })}
      </div>
    </Panel>
  )
}

function EventsWidget({ tasks }) {
  const events = [
    { date: '10', month: 'May', title: tasks[0]?.title || 'Assignment check-in', time: '10:00 AM' },
    { date: '12', month: 'May', title: 'Weekly progress review', time: '2:30 PM' },
    { date: '14', month: 'May', title: 'Quiz window closes', time: '5:00 PM' },
  ]

  return (
    <Panel className="p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e6f6ec] text-[#145c39]">
          <CalendarTodayOutlined sx={{ fontSize: 21 }} />
        </span>
        <div>
          <h2 className="text-xl font-black text-[#17251d]">Upcoming Events</h2>
          <p className="text-sm font-bold text-[#66776d]">This week</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {events.map((event) => (
          <div key={`${event.date}-${event.title}`} className="flex items-center gap-3 rounded-2xl bg-[#f7fcf8] p-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-center shadow-sm">
              <span className="text-[10px] font-black uppercase text-[#66776d]">{event.month}</span>
              <span className="-mt-2 text-lg font-black text-[#145c39]">{event.date}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#17251d]">{event.title}</p>
              <p className="mt-0.5 text-xs font-bold text-[#66776d]">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { openCreate, openEnroll } = useCourseModal()
  const { user, profileName, isVisible } = useAuth()
  const displayName = profileName || user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'Justin'

  const [courses, setCourses] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      if (!user?.id) {
        setCourses([])
        setTasks([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const [courseRes, taskRes] = await Promise.all([
          apiFetch(`/api/courses?user_id=${encodeURIComponent(user.id)}`),
          apiFetch(`/api/tasks?user_id=${encodeURIComponent(user.id)}`),
        ])

        const [courseData, taskData] = await Promise.all([safeJson(courseRes), safeJson(taskRes)])

        if (!courseRes.ok) throw new Error(courseData?.error || 'Failed to load courses.')
        if (!taskRes.ok) throw new Error(taskData?.error || 'Failed to load tasks.')

        if (!active) return
        setCourses(Array.isArray(courseData) ? courseData.slice(0, 4) : [])
        setTasks(Array.isArray(taskData) ? taskData.slice(0, 5) : [])
        setError('')
      } catch (err) {
        console.error(err)
        if (!active) return
        setError(err.message || 'Failed to load dashboard.')
        setCourses([])
        setTasks([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      active = false
    }
  }, [user?.id])

  const dueSoonCount = useMemo(
    () => tasks.filter((task) => !task.is_teacher_view && (task.status === 'assigned' || task.status === 'late' || task.due_at)).length,
    [tasks]
  )
  const averageProgress = courses.length
    ? Math.round(courses.reduce((sum, course, index) => sum + getCourseProgress(course, index), 0) / courses.length)
    : 0
  const completionRate = courses.length || tasks.length ? Math.max(64, Math.min(96, averageProgress + 8)) : 0

  return (
    <div className={`space-y-7 ${isVisible ? 'translate-y-0 opacity-100 transition-all duration-300' : 'translate-y-2 opacity-0'}`}>
      <section className="overflow-hidden rounded-[32px] border border-[#dfe9e2] bg-gradient-to-br from-white via-[#f7fcf8] to-[#e6f6ec] p-6 shadow-[0_24px_70px_rgba(31,122,77,0.10)] md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1f7a4d]">Learning overview</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-[#17251d] md:text-4xl">
              Good morning, {String(displayName).split(/\s+/)[0] || 'Student'}
            </h1>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#52645a]">
              Track courses, assignments, quiz progress, and upcoming events from one focused workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={openEnroll} className="rounded-2xl border border-[#b9d7c4] bg-white px-5 py-3 text-sm font-black text-[#145c39] transition hover:bg-[#f7fcf8]">
              Join Course
            </button>
            <button type="button" onClick={openCreate} className="rounded-2xl bg-[#1f7a4d] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(31,122,77,0.24)] transition hover:bg-[#18613d]">
              Create Course
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard statistics">
        <StatCard icon={LibraryBooksOutlined} label="Active Courses" value={courses.length} change="+12%" />
        <StatCard icon={AssignmentOutlined} label="Due Soon" value={dueSoonCount} change={dueSoonCount ? 'Action' : 'Clear'} tone="amber" />
        <StatCard icon={TimelineOutlined} label="Weekly Progress" value={`${averageProgress}%`} change="+8%" tone="blue" />
        <StatCard icon={TrendingUp} label="Completion Rate" value={`${completionRate}%`} change="+5%" />
      </section>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 xl:col-span-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-[#17251d]">Courses</h2>
              <p className="mt-1 text-sm font-bold text-[#66776d]">Continue where you left off</p>
            </div>
            <button type="button" onClick={() => navigate('/courses')} className="rounded-2xl px-4 py-2 text-sm font-black text-[#145c39] hover:bg-[#e6f6ec]">
              View all
            </button>
          </div>

          {loading ? (
            <Panel className="p-6 text-sm font-bold text-[#66776d]">Loading dashboard...</Panel>
          ) : error ? (
            <Panel className="p-6 text-sm font-bold text-red-700">{error}</Panel>
          ) : courses.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {courses.map((course, index) => (
                <CourseCard key={course.id || index} course={course} index={index} onOpen={() => course.id && navigate(`/courses/${course.id}`)} />
              ))}
            </div>
          ) : (
            <Panel className="grid min-h-[286px] place-items-center p-6 text-center">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#e6f6ec] text-[#145c39]">
                  <SchoolOutlined />
                </div>
                <h3 className="mt-4 text-xl font-black text-[#17251d]">No courses yet</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-6 text-[#66776d]">Create or join a course and your learning cards will appear here.</p>
                <button type="button" onClick={openEnroll} className="mt-5 rounded-2xl bg-[#1f7a4d] px-5 py-3 text-sm font-black text-white">Join Course</button>
              </div>
            </Panel>
          )}
        </section>

        <section className="col-span-12 xl:col-span-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-[#17251d]">Tasks</h2>
              <p className="mt-1 text-sm font-bold text-[#66776d]">Assignments and reminders</p>
            </div>
            <button type="button" onClick={() => navigate('/tasks')} className="rounded-2xl px-4 py-2 text-sm font-black text-[#145c39] hover:bg-[#e6f6ec]">View all</button>
          </div>
          <Panel className="p-4">
            {tasks.length > 0 ? (
              <div className="grid gap-3">
                {tasks.map((task, index) => (
                  <TaskItem key={task.id || index} task={task} index={index} />
                ))}
              </div>
            ) : (
              <EmptyTaskState onCreate={() => navigate('/tasks')} />
            )}
          </Panel>
        </section>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 xl:col-span-5">
          <ActivityFeed courses={courses} tasks={tasks} />
        </section>
        <section className="col-span-12 md:col-span-6 xl:col-span-3">
          <QuickActions
            onJoin={openEnroll}
            onCreateQuiz={() => navigate('/quiz-maker')}
            onUpload={() => navigate('/courses')}
            onAssignment={() => navigate('/tasks')}
          />
        </section>
        <section className="col-span-12 md:col-span-6 xl:col-span-4">
          <EventsWidget tasks={tasks} />
        </section>
      </div>
    </div>
  )
}
