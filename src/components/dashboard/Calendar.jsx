import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/AuthProvider'
import { safeJson } from '../courses/utils'

function groupEvents(events = []) {
  return events.reduce((acc, event) => {
    const key = event.date ? new Date(event.date).toDateString() : 'No date'
    if (!acc[key]) acc[key] = []
    acc[key].push(event)
    return acc
  }, {})
}

export default function Calendar(){
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadCalendar() {
      if (!user?.id) {
        setEvents([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/calendar?user_id=${encodeURIComponent(user.id)}`)
        const data = await safeJson(res)
        if (!res.ok) throw new Error(data?.error || 'Failed to load calendar.')
        if (active) setEvents(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        if (active) {
          setError(err.message || 'Failed to load calendar.')
          setEvents([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadCalendar()
    return () => { active = false }
  }, [user?.id])

  const groups = useMemo(() => groupEvents(events), [events])

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Calendar</h2>
        <p className="text-sm text-muted">Upcoming due dates from assignments and quizzes appear here automatically.</p>
      </div>

      {loading ? <div className="rounded-2xl border border-token bg-surface p-6 text-sm text-muted">Loading calendar...</div> : null}
      {error ? <div className="rounded-2xl border border-token bg-surface p-6 text-sm text-red-600">{error}</div> : null}

      {!loading && !error && (
        <div className="space-y-4">
          {Object.keys(groups).length === 0 ? (
            <div className="rounded-2xl border border-token bg-surface p-6 text-sm text-muted">No scheduled due dates yet.</div>
          ) : (
            Object.entries(groups).map(([dateLabel, items]) => (
              <section key={dateLabel} className="rounded-2xl border border-token bg-surface p-6">
                <h3 className="text-lg font-semibold">{dateLabel}</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {items.map((event) => (
                    <div key={event.id} className="rounded-xl border border-token p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold text-main">{event.title}</div>
                          <div className="text-sm text-muted mt-1">{event.course_title}</div>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                          {event.kind}
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-subtle">
                        {event.date ? new Date(event.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'All day'}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}
    </div>
  )
}
