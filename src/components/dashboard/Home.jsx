import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderStats from './HeaderStats'
import CourseCard from './CourseCard'
import StatsChart from './StatsChart'
import TodoWidget from './TodoWidget'
import Notifications from '../Notifications'
import { useAuth } from '../../lib/AuthProvider'
import { safeJson } from '../courses/utils'

export default function Home(){
  const navigate = useNavigate()
  const { user, profileName, isVisible } = useAuth()
  const displayName = profileName || user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'Academee Student'

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
          fetch(`/api/courses?user_id=${encodeURIComponent(user.id)}`),
          fetch(`/api/tasks?user_id=${encodeURIComponent(user.id)}`),
        ])

        const [courseData, taskData] = await Promise.all([safeJson(courseRes), safeJson(taskRes)])

        if (!courseRes.ok) throw new Error(courseData?.error || 'Failed to load courses.')
        if (!taskRes.ok) throw new Error(taskData?.error || 'Failed to load tasks.')

        if (!active) return
        setCourses(Array.isArray(courseData) ? courseData.slice(0, 3) : [])
        setTasks(Array.isArray(taskData) ? taskData : [])
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
    return () => { active = false }
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
    <div className={`grid grid-cols-12 gap-6 ${isVisible ? 'opacity-100 translate-y-0 transition-all duration-300' : 'opacity-0 translate-y-2'}`}>
      <div className="col-span-12 xl:col-span-8">
        <div className="bg-surface rounded-2xl p-6 mb-6 border border-token shadow-sm relative overflow-visible">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">Hello, {displayName}!</h3>
              <p className="text-muted">Your classroom snapshot now includes live courses, deadlines, and grading activity.</p>
            </div>
            <div aria-hidden className="w-24 hidden md:block" />
          </div>
          <img src="/src/assets/b.png" alt="avatar" className="absolute right-4 -top-6 w-32 h-32 object-contain hidden md:block" />
        </div>

        <div className="bg-surface rounded-2xl p-6 mb-6 border border-token shadow-sm flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted">Classroom center</div>
            <div className="font-semibold">Open a course to publish lessons, review submissions, or turn in work.</div>
          </div>
          <button onClick={() => navigate('/courses')} className="px-4 py-2 bg-black text-white rounded-md">Open courses</button>
        </div>

        <HeaderStats stats={[
          { label: 'Teaching', value: teachingCount },
          { label: 'Enrolled', value: enrolledCount },
          { label: 'Due Soon', value: dueSoonCount },
          { label: 'Pending Reviews', value: reviewCount },
        ]} />

        <div className="my-6 flex items-center justify-between">
          <h4 className="text-lg font-semibold">Recent Courses</h4>
          <button onClick={() => navigate('/courses')} className="text-sm text-muted">View all</button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-xl border border-token bg-surface p-4 text-sm text-muted">Loading courses...</div>
          ) : error ? (
            <div className="rounded-xl border border-token bg-surface p-4 text-sm text-red-600">{error}</div>
          ) : courses.length === 0 ? (
            <div className="rounded-xl border border-token bg-surface p-4 text-sm text-muted">You have no classes yet. Create or join one to get started.</div>
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course.id}
                course={{
                  id: course.id,
                  image: course.cover_image || '/src/assets/course.png',
                  title: course.title,
                  author: course.author_name || 'Teacher',
                  length: course.next_activity_title || (String(course.author) === String(user?.id) ? 'Teaching' : 'Enrolled'),
                }}
              />
            ))
          )}
        </div>
      </div>

      <div className="col-span-12 xl:col-span-4 space-y-4">
        <StatsChart />
        <TodoWidget />
        <Notifications />
      </div>
    </div>
  )
}
