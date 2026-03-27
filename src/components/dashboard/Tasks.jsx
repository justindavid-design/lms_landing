import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/AuthProvider'
import { safeJson } from '../courses/utils'

function formatDue(value) {
  if (!value) return 'No due date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No due date'
  return date.toLocaleString()
}

function badgeClasses(status) {
  if (status === 'graded') return 'bg-emerald-100 text-emerald-700'
  if (status === 'submitted') return 'bg-sky-100 text-sky-700'
  if (status === 'late') return 'bg-red-100 text-red-700'
  if (status === 'review') return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-700'
}

export default function Tasks(){
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadTasks() {
      if (!user?.id) {
        setTasks([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const res = await fetch(`/api/tasks?user_id=${encodeURIComponent(user.id)}`)
        const data = await safeJson(res)
        if (!res.ok) throw new Error(data?.error || 'Failed to load tasks.')
        if (active) setTasks(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        if (active) {
          setError(err.message || 'Failed to load tasks.')
          setTasks([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadTasks()
    return () => { active = false }
  }, [user?.id])

  const grouped = useMemo(() => {
    return {
      learner: tasks.filter((task) => !task.is_teacher_view),
      teacher: tasks.filter((task) => task.is_teacher_view),
    }
  }, [tasks])

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Tasks</h2>
        <p className="text-sm text-muted">Track assigned work, graded items, and teacher review queues in one place.</p>
      </div>

      {loading ? <div className="rounded-2xl border border-token bg-surface p-6 text-sm text-muted">Loading tasks...</div> : null}
      {error ? <div className="rounded-2xl border border-token bg-surface p-6 text-sm text-red-600">{error}</div> : null}

      {!loading && !error && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-token bg-surface p-6">
            <h3 className="text-lg font-semibold">Learner Work</h3>
            <div className="mt-4 space-y-3">
              {grouped.learner.length === 0 ? <p className="text-sm text-muted">No student tasks yet.</p> : null}
              {grouped.learner.map((task) => (
                <div key={task.id} className="rounded-xl border border-token p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-main">{task.title}</div>
                      <div className="text-sm text-muted mt-1">{task.course_title}</div>
                      <div className="text-xs text-subtle mt-2">Due {formatDue(task.due_at)}</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${badgeClasses(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-token bg-surface p-6">
            <h3 className="text-lg font-semibold">Teacher Review Queue</h3>
            <div className="mt-4 space-y-3">
              {grouped.teacher.length === 0 ? <p className="text-sm text-muted">No teacher-owned tasks yet.</p> : null}
              {grouped.teacher.map((task) => (
                <div key={task.id} className="rounded-xl border border-token p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-main">{task.title}</div>
                      <div className="text-sm text-muted mt-1">{task.course_title}</div>
                      <div className="text-xs text-subtle mt-2">
                        {task.pending_review_count ? `${task.pending_review_count} submissions waiting for review` : `Due ${formatDue(task.due_at)}`}
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${badgeClasses(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
