import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Loading from '../Loading'
import { useAuth } from '../../lib/AuthProvider'

import CourseForm from '../courses/CourseForm'
import EnrollForm from '../courses/EnrollForm'
import MessageBanner from '../courses/MessageBanner'
import EmptyCoursesState from '../courses/EmptyCoursesState'
import CourseSection from '../courses/CourseSection'

import {
  getApiErrorMessage,
  generateCourseCode,
  safeJson,
} from '../courses/utils'

export default function Courses({ registerHeaderActions }) {
  const { user, profileName } = useAuth()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showEnrollForm, setShowEnrollForm] = useState(false)

  const [courseMsg, setCourseMsg] = useState('')
  const [enrollMsg, setEnrollMsg] = useState('')
  const [enrollCode, setEnrollCode] = useState('')

  const clearMessages = useCallback(() => {
    setCourseMsg('')
    setEnrollMsg('')
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
        setCourseMsg(getApiErrorMessage(data, 'Failed to load courses.'))
        setCourses([])
      } else {
        setCourses(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
      setCourseMsg('Failed to load courses. Please try again.')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = useCallback(() => {
    clearMessages()
    setEditing(null)
    setShowEnrollForm(false)
    setShowForm(true)
  }, [clearMessages])

  const openEnroll = useCallback(() => {
    clearMessages()
    setEditing(null)
    setShowForm(false)
    setShowEnrollForm(true)
  }, [clearMessages])

  useEffect(() => {
    if (!registerHeaderActions) return
    registerHeaderActions({ openCreate, openEnroll })
    return () => registerHeaderActions(null)
  }, [registerHeaderActions, openCreate, openEnroll])

  const closeCourseForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const closeEnrollForm = () => {
    setShowEnrollForm(false)
    setEnrollMsg('')
    setEnrollCode('')
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
          setCourseMsg(getApiErrorMessage(data, 'Update failed.'))
          return
        }

        setCourses((prev) => prev.map((c) => (c.id === data.id ? data : c)))
        setCourseMsg('Course updated successfully.')
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
        setCourseMsg(getApiErrorMessage(data, 'Course create response was incomplete. Reloading list.'))
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
            setCourseMsg(
              getApiErrorMessage(
                patchData,
                'Course created, but code setup needs database migration.'
              )
            )
          }
        } catch (err) {
          console.warn('failed to patch course_code', err)
        }
      }

      setCourses((prev) => [data, ...prev])
      setCourseMsg(`Course created. Share code ${data.course_code || '(no code yet)'} so others can enroll.`)
      closeCourseForm()
    } catch (err) {
      console.error(err)
      setCourseMsg('Failed to create course. Please try again.')
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
      const res = await fetch(
        `/api/courses/${id}?user_id=${encodeURIComponent(user.id)}`,
        { method: 'DELETE' }
      )

      const data = await safeJson(res)

      if (!res.ok) {
        setCourseMsg(getApiErrorMessage(data, 'Failed to delete course.'))
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
    const code = enrollCode.trim().toUpperCase()

    if (!code) {
      setEnrollMsg('Enter a course code.')
      return
    }

    try {
      clearMessages()

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enroll_code: code, user_id: user.id }),
      })

      const data = await safeJson(res)

      if (!res.ok) {
        setEnrollMsg(getApiErrorMessage(data, 'Course code not found.'))
        return
      }

      const enrolledCourse = data?.course

      if (enrolledCourse) {
        setCourses((prev) => {
          if (prev.some((c) => String(c.id) === String(enrolledCourse.id))) return prev
          return [enrolledCourse, ...prev]
        })
        setEnrollMsg(`Enrolled to ${enrolledCourse.title}`)
      } else {
        setEnrollMsg('Enrolled successfully.')
        await load()
      }

      setEnrollCode('')
    } catch (err) {
      console.error(err)
      setEnrollMsg('Enrollment failed. Please try again.')
    }
  }

  const teachingCourses = useMemo(
    () => courses.filter((c) => String(c.author) === String(user?.id)),
    [courses, user?.id]
  )

  const enrolledCourses = useMemo(
    () => courses.filter((c) => String(c.author) !== String(user?.id)),
    [courses, user?.id]
  )

  const activeMessage = courseMsg || enrollMsg

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">

      <MessageBanner message={activeMessage} onClose={clearMessages} />

      {(showForm || showEnrollForm) && (
        <div className="rounded-3xl border border-token bg-surface p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-main">
            {showForm ? (editing ? 'Edit Course' : 'Create New Course') : 'Join a Class'}
          </h3>

          {showForm && (
            <CourseForm initial={editing || {}} onSave={createOrUpdate} onCancel={closeCourseForm} />
          )}

          {showEnrollForm && (
            <EnrollForm
              enrollCode={enrollCode}
              setEnrollCode={setEnrollCode}
              enrollMsg={enrollMsg}
              onJoin={enrollToCourse}
              onCancel={closeEnrollForm}
            />
          )}
        </div>
      )}

      {loading ? (
        <Loading message="Loading courses…">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-3xl border border-token bg-surface" />
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
              setShowEnrollForm(false)
              setEditing(course)
              setShowForm(true)
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
              setShowEnrollForm(false)
              setEditing(course)
              setShowForm(true)
            }}
            onDelete={removeCourse}
          />
        </div>
      )}
    </div>
  )
}