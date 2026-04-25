import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import CourseForm from './courses/CourseForm'
import MessageBanner from './courses/MessageBanner'
import { useCourseModal } from '../lib/CourseModalContext'
import { useAuth } from '../lib/AuthProvider'
import { getApiErrorMessage, generateCourseCode, safeJson } from './courses/utils'

export default function CourseModalOverlay() {
  const navigate = useNavigate()
  const { user, profileName } = useAuth()
  const {
    showCreateForm,
    showEnrollForm,
    editingCourse,
    closeCreate,
    closeEnroll,
  } = useCourseModal()

  const [courseMsg, setCourseMsg] = useState('')
  const [courses, setCourses] = useState([])

  const clearMessage = () => {
    setCourseMsg('')
  }

  const handleCreateOrUpdate = async (payload) => {
    try {
      if (!user?.id) {
        setCourseMsg('You need to be logged in to create a course.')
        return
      }

      clearMessage()

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

        setCourseMsg('Course updated.')
        closeCreate()
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
        setCourseMsg(getApiErrorMessage(data, 'We could not finish creating the course. Please try again.'))
        closeCreate()
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
          }
        } catch (err) {
          console.warn('Failed to patch course_code', err)
        }
      }

      setCourseMsg(`Course created. Share this code: ${data.course_code || 'code coming soon'}.`)
      closeCreate()
    } catch (err) {
      console.error(err)
      setCourseMsg('Failed to create course. Please try again.')
    }
  }

  if (!showCreateForm && !showEnrollForm) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => {
          if (showCreateForm) closeCreate()
          if (showEnrollForm) closeEnroll()
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-token bg-surface shadow-sm">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-main">
                {showCreateForm
                  ? editingCourse
                    ? 'Edit Course'
                    : 'Create a Course'
                  : 'Join a Course'}
              </h2>
              <button
                onClick={() => {
                  if (showCreateForm) closeCreate()
                  if (showEnrollForm) closeEnroll()
                }}
                className="text-muted hover:text-main text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <MessageBanner message={courseMsg} onClose={clearMessage} />

            {showCreateForm && (
              <CourseForm
                initial={editingCourse || {}}
                onSave={handleCreateOrUpdate}
                onCancel={closeCreate}
              />
            )}

            {showEnrollForm && (
              <div className="text-center py-4">
                <p className="text-muted mb-4">Taking you to the join page...</p>
                {typeof window !== 'undefined' &&
                  (() => {
                    setTimeout(() => navigate('/courses/enroll'), 500)
                    return null
                  })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
