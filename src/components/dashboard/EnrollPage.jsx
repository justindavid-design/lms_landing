import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EnrollForm from '../courses/EnrollForm'
import MessageBanner from '../courses/MessageBanner'
import { useAuth } from '../../lib/AuthProvider'
import { getApiErrorMessage, safeJson } from '../courses/utils'

export default function EnrollPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [enrollCode, setEnrollCode] = useState('')
  const [enrollMsg, setEnrollMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const clearMessage = () => {
    setEnrollMsg('')
  }

  const enrollToCourse = async () => {
    const code = enrollCode.trim().toUpperCase()

    if (!code) {
      setEnrollMsg('Enter a course code.')
      return
    }

    if (!user?.id) {
      setEnrollMsg('Please log in to join a class.')
      return
    }

    try {
      setLoading(true)
      clearMessage()

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enroll_code: code, user_id: user.id }),
      })

      const data = await safeJson(res)

      if (!res.ok) {
        setEnrollMsg(getApiErrorMessage(data, 'We could not find that course code.'))
        return
      }

      const enrolledCourse = data?.course

      if (enrolledCourse) {
        setEnrollMsg(`You joined ${enrolledCourse.title}.`)
      } else {
        setEnrollMsg('You joined the class.')
      }

      setEnrollCode('')

      // Go back after the student joins.
      setTimeout(() => {
        navigate('/courses')
      }, 1500)
    } catch (err) {
      console.error(err)
      setEnrollMsg('We could not join the class. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/courses')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 md:space-y-8">
      <section className="rounded-lg border border-token bg-surface p-5 shadow-sm md:p-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-subtle">Join a class</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-main md:text-4xl">
            Join an existing class
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-muted md:text-base md:leading-8">
            Enter the course code provided by your teacher to join and start learning.
          </p>
        </div>
      </section>

      <MessageBanner message={enrollMsg} onClose={clearMessage} />

      <div className="rounded-lg border border-token bg-surface p-5 shadow-sm md:p-6">
        <EnrollForm
          enrollCode={enrollCode}
          setEnrollCode={setEnrollCode}
          enrollMsg=""
          onJoin={enrollToCourse}
          onCancel={handleCancel}
        />
      </div>

      {loading && (
        <div className="flex justify-center">
            <div className="text-sm text-muted">Joining class...</div>
        </div>
      )}
    </div>
  )
}
