import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Loading from '../Loading'
import { useAuth } from '../../lib/AuthProvider'
import { useCourseModal } from '../../lib/CourseModalContext'
import { apiFetch } from '../../lib/apiClient'

import MessageBanner from '../courses/MessageBanner'
import EmptyCoursesState from '../courses/EmptyCoursesState'
import CourseSection from '../courses/CourseSection'

import {
  getApiErrorMessage,
  safeJson,
} from '../courses/utils'

function SummaryCard({ label, value, tone = 'bg-surface' }) {
  return (
    <div className={`rounded-lg border border-token p-4 shadow-sm ${tone}`}>
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-subtle">{label}</div>
      <div className="mt-3 text-3xl font-extrabold text-main">{value}</div>
    </div>
  )
}

export default function Courses() {
  const { user, profileName } = useAuth()
  const { openCreate, openEnroll } = useCourseModal()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [courseMsg, setCourseMsg] = useState('')

  const clearMessages = useCallback(() => {
    setCourseMsg('')
  }, [])

  const load = useCallback(async () => {
    if (!user?.id) {
      setCourses([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const res = await apiFetch(`/api/courses?user_id=${encodeURIComponent(user.id)}`)
      const data = await safeJson(res)

      if (!res.ok) {
        setCourseMsg(getApiErrorMessage(data, 'We could not load your courses.'))
        setCourses([])
      } else {
        setCourses(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
      setCourseMsg('We could not load your courses. Please try again.')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const refreshCourses = () => load()
    window.addEventListener('academee:courses-updated', refreshCourses)
    return () => window.removeEventListener('academee:courses-updated', refreshCourses)
  }, [load])

  const copyCode = async (code) => {
    if (!code) return

    try {
      await navigator.clipboard.writeText(code)
      setCourseMsg(`Copied course code ${code}. Share it with learners to enroll.`)
    } catch (err) {
      console.warn('clipboard failed', err)
      setCourseMsg(`Course code: ${code}`)
    }
  }

  const removeCourse = async (id) => {
    if (!window.confirm('Delete course?')) return

    try {
      const res = await apiFetch(`/api/courses/${id}?user_id=${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
      })

      const data = await safeJson(res)

      if (!res.ok) {
        setCourseMsg(getApiErrorMessage(data, 'We could not delete the course.'))
        return
      }

      setCourses((prev) => prev.filter((c) => String(c.id) !== String(id)))
      setCourseMsg('Course deleted successfully.')
    } catch (err) {
      console.error(err)
      setCourseMsg('Failed to delete course. Please try again.')
    }
  }

  const enrollToCourse = async () => {
    // Enrollment is now handled on the separate page
    // This function can be removed
  }

  const teachingCourses = useMemo(
    () => courses.filter((c) => String(c.author) === String(user?.id)),
    [courses, user?.id]
  )

  const enrolledCourses = useMemo(
    () => courses.filter((c) => String(c.author) !== String(user?.id)),
    [courses, user?.id]
  )

  const activeMessage = courseMsg

  return (
    <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">

      <MessageBanner message={activeMessage} onClose={clearMessages} />

      {loading ? (
        <Loading message="Loading courses...">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-lg border border-token bg-surface" />
            ))}
          </div>
        </Loading>
      ) : courses.length === 0 ? (
        <EmptyCoursesState />
      ) : (
        <div className="space-y-10">
          <CourseSection
            title="Teaching"
            items={teachingCourses}
            emptyText="You are not teaching any classes yet."
            user={user}
            profileName={profileName}
            onCopyCode={copyCode}
            onEdit={(course) => {
              openCreate(course)
            }}
            onDelete={removeCourse}
          />

          <CourseSection
            title="Enrolled"
            items={enrolledCourses}
            emptyText="You have not enrolled in any classes yet."
            user={user}
            profileName={profileName}
            onCopyCode={copyCode}
            onEdit={(course) => {
              openCreate(course)
            }}
            onDelete={removeCourse}
          />
        </div>
      )}
    </div>
  )
}
