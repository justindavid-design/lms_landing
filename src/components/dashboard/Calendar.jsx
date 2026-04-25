import React, { useEffect, useMemo, useState } from 'react'
import { CalendarMonth, FormatListBulleted } from '@mui/icons-material'
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

function getEventDate(event) {
  if (!event?.date) return null
  const date = new Date(event.date)
  return Number.isNaN(date.getTime()) ? null : date
}

function getStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getMonthDays(anchorDate) {
  const year = anchorDate.getFullYear()
  const month = anchorDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    days.push(null)
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month, day))
  }

  return days
}

function sortEventsByDate(events = []) {
  return [...events].sort((a, b) => {
    const first = getEventDate(a)?.getTime() ?? Number.MAX_SAFE_INTEGER
    const second = getEventDate(b)?.getTime() ?? Number.MAX_SAFE_INTEGER
    return first - second
  })
}

export default function Calendar(){
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('list')
  const [selectedCourse, setSelectedCourse] = useState('all')

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

  const courses = useMemo(() => {
    const uniqueCourses = [...new Set(events.map(event => event.course_title).filter(Boolean))]
    return uniqueCourses.sort()
  }, [events])

  const filteredEvents = useMemo(() => {
    if (selectedCourse === 'all') return events
    return events.filter(event => event.course_title === selectedCourse)
  }, [events, selectedCourse])

  const sortedEvents = useMemo(() => sortEventsByDate(filteredEvents), [filteredEvents])
  const groups = useMemo(() => groupEvents(sortedEvents), [sortedEvents])
  const datedEvents = useMemo(() => sortedEvents.filter((event) => getEventDate(event)), [sortedEvents])
  const calendarAnchor = useMemo(() => {
    const firstDate = datedEvents[0] ? getEventDate(datedEvents[0]) : new Date()
    return new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
  }, [datedEvents])
  const monthDays = useMemo(() => getMonthDays(calendarAnchor), [calendarAnchor])
  const eventsByDay = useMemo(() => {
    return datedEvents.reduce((acc, event) => {
      const key = getStartOfDay(getEventDate(event)).toDateString()
      if (!acc[key]) acc[key] = []
      acc[key].push(event)
      return acc
    }, {})
  }, [datedEvents])

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
        <div className="relative inline-flex items-center rounded-full border border-gray-300 bg-gray-100 p-1 dark:border-zinc-700 dark:bg-zinc-900 ml-auto">
          {/* Sliding Background Indicator */}
          <div
            aria-hidden="true"
            className={`absolute h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-all duration-300 ease-in-out dark:bg-zinc-800 dark:shadow-zinc-950/50 ${view === "calendar" ? "translate-x-full" : "translate-x-0"}`}
          />
          {/* List Button */}
          <button
            type="button"
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={`
      relative z-10 flex h-9 w-12 items-center justify-center rounded-full 
      transition-colors duration-200
      ${view === "list" ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}
    `}
          >
            <FormatListBulleted fontSize="small" />
            <span className="sr-only">List view</span>
          </button>

          {/* Calendar Button */}
          <button
            type="button"
            onClick={() => setView("calendar")}
            aria-pressed={view === "calendar"}
            className={`
      relative z-10 flex h-9 w-12 items-center justify-center rounded-full 
      transition-colors duration-200
      ${view === "calendar" ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}
    `}
          >
            <CalendarMonth fontSize="small" />
            <span className="sr-only">Calendar view</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-token bg-surface p-6 text-sm text-muted">
          Loading calendar...
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-token bg-surface p-6 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {!loading && !error && view === "list" && (
        <div className="space-y-4">
          {Object.keys(groups).length === 0 ? (
            <div className="rounded-2xl border border-token bg-surface p-6 text-sm text-muted">
              No scheduled due dates yet.
            </div>
          ) : (
            Object.entries(groups).map(([dateLabel, items]) => (
              <section
                key={dateLabel}
                className="rounded-2xl border border-token bg-surface p-6"
              >
                <h3 className="text-lg font-semibold">{dateLabel}</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {items.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-xl border border-token p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold text-main">
                            {event.title}
                          </div>
                          <div className="text-sm text-muted mt-1">
                            {event.course_title}
                          </div>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                          {event.kind}
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-subtle">
                        {event.date
                          ? new Date(event.date).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "All day"}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {!loading && !error && view === "calendar" && (
        <section className="rounded-2xl border border-token bg-surface p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold text-main">
                {calendarAnchor.toLocaleDateString([], {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <p className="text-sm text-muted">
                Tasks appear on the day they are due.
              </p>
            </div>
            <span className="rounded-full bg-[#e8f3de] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-main">
              {datedEvents.length} task{datedEvents.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-subtle">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {monthDays.map((day, index) => {
              const key = day ? day.toDateString() : `empty-${index}`;
              const items = day ? eventsByDay[day.toDateString()] || [] : [];

              return (
                <div
                  key={key}
                  className={`min-h-28 rounded-xl border border-token p-2 text-left ${day ? "bg-app" : "bg-transparent border-transparent"}`}
                >
                  {day ? (
                    <>
                      <div className="mb-2 text-sm font-bold text-main">
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {items.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="truncate rounded-md bg-[#dfeaff] px-2 py-1 text-[11px] font-semibold text-main"
                          >
                            {event.title}
                          </div>
                        ))}
                        {items.length > 3 ? (
                          <div className="text-[11px] font-semibold text-muted">
                            +{items.length - 3} more
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>

          {datedEvents.length === 0 ? (
            <div className="mt-4 rounded-xl border border-token bg-app p-4 text-sm text-muted">
              No dated tasks to show on the calendar yet.
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
