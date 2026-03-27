import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Loading from '../Loading'
import { safeJson, getApiErrorMessage } from '../courses/utils'

export default function CourseDetails() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadCourse() {
      setLoading(true)

      try {
        const currentUserId = window.localStorage.getItem('academee_last_user_id')
        const qs = currentUserId ? `?user_id=${encodeURIComponent(currentUserId)}` : ''
        const res = await fetch(`/api/courses/${id}${qs}`)
        const data = await safeJson(res)

        if (!res.ok) {
          setMessage(getApiErrorMessage(data, 'Failed to load course.'))
          setCourse(null)
        } else {
          setCourse(data)
        }
      } catch (err) {
        console.error(err)
        setMessage('Failed to load course. Please try again.')
        setCourse(null)
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [id])

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
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-token bg-surface p-5">
          <p className="text-sm text-subtle">Teacher</p>
          <p className="mt-2 text-lg font-semibold text-main">{course.author_name || 'Unknown'}</p>
        </div>

        <div className="rounded-2xl border border-token bg-surface p-5">
          <p className="text-sm text-subtle">Course Code</p>
          <p className="mt-2 text-lg font-semibold tracking-[0.14em] text-main">
            {course.course_code || 'N/A'}
          </p>
        </div>

        <div className="rounded-2xl border border-token bg-surface p-5">
          <p className="text-sm text-subtle">Status</p>
          <p className="mt-2 text-lg font-semibold text-main">
            {course.published ? 'Published' : 'Draft'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-token bg-surface p-6">
        <h2 className="text-xl font-semibold text-main">Upcoming activity</h2>
        <p className="mt-3 text-sm text-muted">
          {course.next_activity_title || 'No activity scheduled yet.'}
        </p>
      </div>
    </div>
  )
}