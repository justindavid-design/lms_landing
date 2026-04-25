import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/AuthProvider'
import { safeJson } from '../courses/utils'

function labelForStatus(task) {
  if (task.is_teacher_view) {
    return task.pending_review_count ? `${task.pending_review_count} to review` : 'Published'
  }

  if (task.status === 'graded') {
    return task.submission_score != null ? `Scored ${task.submission_score}` : 'Graded'
  }

  if (task.status === 'submitted') return 'Submitted'
  if (task.status === 'late') return 'Late'
  return 'Assigned'
}

export default function TodoWidget(){
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      if (!user?.id) {
        setTasks([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/tasks?user_id=${encodeURIComponent(user.id)}`)
        const data = await safeJson(res)
        if (!res.ok) throw new Error(data?.error || 'Failed to load tasks')
        if (active) setTasks(Array.isArray(data) ? data.slice(0, 6) : [])
      } catch (err) {
        console.error(err)
        if (active) setTasks([])
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [user?.id])

  const completed = useMemo(
    () => tasks.filter((task) => task.status === 'graded' || task.status === 'submitted').length,
    [tasks]
  )

  return (
    <div className="rounded-lg border border-token bg-surface p-5 shadow-sm" role="region" aria-label="Tasks Assigned">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-subtle">Task list</div>
          <div className="mt-2 font-semibold text-main">Tasks Assigned</div>
        </div>
        <div className="text-xs text-muted" aria-live="polite">{completed}/{tasks.length}</div>
      </div>

      {loading ? (
        <div className="text-sm text-muted">Loading tasks...</div>
      ) : (
        <ul className="space-y-2 max-h-56 overflow-auto" aria-label="Assigned tasks">
          {tasks.map((task) => (
            <li key={task.id} className="rounded-lg border border-token bg-app p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-main truncate">{task.title}</div>
                  <div className="text-xs text-muted mt-1">{task.course_title}</div>
                </div>
                <span className="text-[11px] uppercase tracking-wide text-subtle">{labelForStatus(task)}</span>
              </div>
            </li>
          ))}
          {tasks.length===0 && <li className="text-sm text-muted">No assigned tasks.</li>}
        </ul>
      )}
    </div>
  )
}
