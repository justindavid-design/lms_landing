import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderStats from './HeaderStats'
import CourseCard from './CourseCard'
import StatsChart from './StatsChart'
import TodoWidget from './TodoWidget'
import Notifications from '../Notifications'
import { useAuth } from '../../lib/AuthProvider'
import { safeJson } from '../courses/utils'
import defaultCourseImage from '../../assets/course.png'

const welcomeQuotes = [
  'Every lesson you open is another step forward.',
  'Small progress today becomes real confidence tomorrow.',
  'Keep showing up. Consistency turns effort into mastery.',
  'Your learning space is ready for another meaningful win.',
  'Teach with clarity, learn with courage, and keep moving.',
  'One focused session can change the shape of your whole week.',
]

function SurfaceCard({ className = '', children }) {
  return <div className={`rounded-lg border border-token bg-surface shadow-sm ${className}`}>{children}</div>
}

export default function Home() {
  const navigate = useNavigate()
  const { user, profileName, isVisible } = useAuth()
  const displayName = profileName || user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'Academee Student'

  const [courses, setCourses] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [welcomeQuote, setWelcomeQuote] = useState(welcomeQuotes[0])

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomeQuotes.length)
    setWelcomeQuote(welcomeQuotes[randomIndex])
  }, [user?.id])

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
          fetch(`/api/courses?user_id=${encodeURIComponent(user.id)}`),
          fetch(`/api/tasks?user_id=${encodeURIComponent(user.id)}`),
        ])

        const [courseData, taskData] = await Promise.all([safeJson(courseRes), safeJson(taskRes)])

        if (!courseRes.ok) throw new Error(courseData?.error || 'Failed to load courses.')
        if (!taskRes.ok) throw new Error(taskData?.error || 'Failed to load tasks.')

        if (!active) return
        setCourses(Array.isArray(courseData) ? courseData.slice(0, 4) : [])
        setTasks(Array.isArray(taskData) ? taskData : [])
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

  const teachingCount = useMemo(
    () => courses.filter((course) => String(course.author) === String(user?.id)).length,
    [courses, user?.id]
  )

  const enrolledCount = useMemo(
    () => courses.filter((course) => String(course.author) !== String(user?.id)).length,
    [courses, user?.id]
  )

  const dueSoonCount = useMemo(
    () => tasks.filter((task) => !task.is_teacher_view && (task.status === 'assigned' || task.status === 'late')).length,
    [tasks]
  )

  const reviewCount = useMemo(
    () => tasks.reduce((sum, task) => sum + (task.pending_review_count || 0), 0),
    [tasks]
  )

  return (
    <div className={`grid grid-cols-12 gap-5 md:gap-6 ${isVisible ? 'translate-y-0 opacity-100 transition-all duration-300' : 'translate-y-2 opacity-0'}`}>
      <div className="col-span-12 space-y-5 xl:col-span-8">
        <SurfaceCard className="relative overflow-hidden p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-subtle">Classroom overview</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-main md:text-4xl">
                Hello, {displayName}. {welcomeQuote}
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted md:text-base md:leading-8">
                Check upcoming work, open active classes, and jump back into the course module without digging through menus.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate('/courses')}
                  className="rounded-lg border border-token bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#374151]"
                >
                  Open courses
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/tasks')}
                  className="rounded-lg border border-token bg-surface px-5 py-3 text-sm font-semibold text-main transition hover-surface"
                >
                  Review tasks
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-lg border border-token bg-surface-alt p-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-subtle">Courses</div>
                <div className="mt-2 text-2xl font-extrabold text-main">{courses.length}</div>
                <div className="mt-1 text-sm text-muted">Active classroom spaces</div>
              </div>
              <div className="rounded-lg border border-token bg-surface-alt p-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-subtle">Due soon</div>
                <div className="mt-2 text-2xl font-extrabold text-main">{dueSoonCount}</div>
                <div className="mt-1 text-sm text-muted">Items needing attention</div>
              </div>
              <div className="rounded-lg border border-token bg-surface-alt p-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-subtle">Reviews</div>
                <div className="mt-2 text-2xl font-extrabold text-main">{reviewCount}</div>
                <div className="mt-1 text-sm text-muted">Pending teacher feedback</div>
              </div>
            </div>
          </div>


        </SurfaceCard>

        <HeaderStats
          stats={[
            { label: 'Teaching', value: teachingCount, onClick: () => navigate('/courses') },
            { label: 'Enrolled', value: enrolledCount, onClick: () => navigate('/courses') },
            { label: 'Due Soon', value: dueSoonCount, onClick: () => navigate('/tasks') },
            { label: 'Pending Reviews', value: reviewCount, onClick: () => navigate('/tasks') },
          ]}
        />

        <SurfaceCard className="p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-subtle">Recent courses</p>
              <h3 className="mt-2 text-xl font-bold text-main">Continue where you left off</h3>
            </div>
            <button type="button" onClick={() => navigate('/courses')} className="text-sm font-semibold text-main underline-offset-4 hover:underline">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="rounded-lg border border-token bg-app p-4 text-sm text-muted">Loading courses...</div>
            ) : error ? (
              <div className="rounded-lg border border-token bg-[#fff1f1] p-4 text-sm text-red-700">{error}</div>
            ) : courses.length === 0 ? (
              <div className="rounded-lg border border-token bg-app p-4 text-sm text-muted">
                You have no classes yet. Create or join one to get started.
              </div>
            ) : (
              courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={{
                    id: course.id,
                    image: course.cover_image || defaultCourseImage,
                    title: course.title,
                    author: course.author_name || 'Teacher',
                    length:
                      course.next_activity_title ||
                      (String(course.author) === String(user?.id) ? 'Teaching' : 'Enrolled'),
                  }}
                />
              ))
            )}
          </div>
        </SurfaceCard>
      </div>

      <div className="col-span-12 space-y-4 xl:col-span-4">
        <StatsChart />
        <TodoWidget />
        <Notifications />
      </div>
    </div>
  )
}
