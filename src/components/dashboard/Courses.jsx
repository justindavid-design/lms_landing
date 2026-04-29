import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Loading from '../Loading'
import { useAuth } from '../../lib/AuthProvider'
import { useCourseModal } from '../../lib/CourseModalContext'

import CourseForm from '../courses/CourseForm'
import MessageBanner from '../courses/MessageBanner'
import EmptyCoursesState from '../courses/EmptyCoursesState'
import CourseSection from '../courses/CourseSection'

import {
  getApiErrorMessage,
  generateCourseCode,
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
  const navigate = useNavigate()
  const { user, profileName } = useAuth()
  const { openCreate, setEditingCourse, closeCreate } = useCourseModal()

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
      const res = await fetch(`/api/courses?user_id=${encodeURIComponent(user.id)}`)
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

  const openEnroll = useCallback(() => {
    navigate('/courses/enroll')
  }, [navigate])

  const closeCourseForm = () => {
    closeCreate()
  }

  const createOrUpdate = async (payload) => {
    try {
      if (!user?.id) {
        setCourseMsg('You need to be logged in to create a course.')
        return
      }

      clearMessages()

      if (payload.id) {
        const res = await fetch(`/api/courses/${payload.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, user_id: user.id }),
        })

        const data = await safeJson(res)

        if (!res.ok) {
          setCourseMsg(getApiErrorMessage(data, 'We could not update the course. Please try again.'))
          return
        }

        setCourses((prev) => prev.map((c) => (c.id === data.id ? data : c)))
        setCourseMsg('Course updated.')
        closeCourseForm()
        return
      }

      const createPayload = {
        ...payload,
        author: user.id,
        author_name: profileName || user.user_metadata?.full_name || user.email,
      }

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
      })

      let data = await safeJson(res)

      if (!res.ok || !data?.id) {
        setCourseMsg(getApiErrorMessage(data, 'We could not finish creating the course. Refreshing the list.'))
        await load()
        closeCourseForm()
        return
      }

      if (!data.course_code) {
        const course_code = generateCourseCode()

        try {
          const patchRes = await fetch(`/api/courses/${data.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_code, user_id: user.id }),
          })

          if (patchRes.ok) {
            const patched = await safeJson(patchRes)
            if (patched) data = patched
          } else {
            const patchData = await safeJson(patchRes)
            setCourseMsg(getApiErrorMessage(patchData, 'Course created, but the class code is not ready yet.'))
          }
        } catch (err) {
          console.warn('failed to patch course_code', err)
        }
      }

      setCourses((prev) => [data, ...prev])
      setCourseMsg(`Course created. Share this code: ${data.course_code || 'code coming soon'}.`)
      closeCourseForm()
    } catch (err) {
      console.error(err)
      setCourseMsg('We could not create the course. Please try again.')
    }
  }

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
      const res = await fetch(`/api/courses/${id}?user_id=${encodeURIComponent(user.id)}`, {
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
      <section className="rounded-lg border border-token bg-surface p-5 shadow-sm md:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-subtle">Course center</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-main md:text-4xl">
              Manage your classes, share codes, and jump into each module workspace.
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-muted md:text-base md:leading-8">
              Create teaching spaces, join existing classes, and keep the student and teacher flows in one place.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={openCreate} className="rounded-lg border border-token bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-sm">
                Create course
              </button>
              <button type="button" onClick={openEnroll} className="rounded-lg border border-token bg-surface px-5 py-3 text-sm font-semibold text-main shadow-sm hover-surface">
                Join course
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <SummaryCard label="All classes" value={courses.length} tone="bg-surface-alt" />
            <SummaryCard label="Teaching" value={teachingCourses.length} tone="bg-surface-alt" />
            <SummaryCard label="Enrolled" value={enrolledCourses.length} tone="bg-surface-alt" />
          </div>
        </div>
      </section>

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
              setEditingCourse(course)
              openCreate()
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
              setEditingCourse(course)
              openCreate()
            }}
            onDelete={removeCourse}
          />
        </div>
      )}
    </div>
  )
}
