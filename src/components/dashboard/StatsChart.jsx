import React, { useEffect, useState } from 'react'
import Loading from '../Loading'
import { useAuth } from '../../lib/AuthProvider'

function Sparkline({ data = [], width = 300, height = 80, stroke = 'currentColor' }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const len = data.length
  const points = data
    .map((d, i) => {
      const x = (i / (len - 1 || 1)) * width
      const y = height - ((d - min) / Math.max(1, max - min)) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="block max-w-full text-main" aria-hidden="true">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function StatsChart() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setStats({ metrics: { activeUsers: 0, totalCourses: 0, avgScore: null, dueSoon: 0, pendingReviews: 0 }, series: [] })
      setLoading(false)
      return undefined
    }

    let mounted = true
    fetch(`/api/stats?user_id=${encodeURIComponent(user.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return
        setStats(data)
      })
      .catch(() => {
        if (!mounted) return
        setStats({ metrics: { activeUsers: 0, totalCourses: 0, avgScore: null, dueSoon: 0, pendingReviews: 0 }, series: [0, 0, 0, 0, 0, 0, 0] })
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [user?.id])

  if (loading) {
    return (
      <Loading message="Loading your overview...">
        <div className="animate-pulse rounded-lg border border-token bg-surface p-5 shadow-sm" aria-hidden>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="mb-2 h-4 w-24 rounded bg-token-muted" />
              <div className="h-4 w-32 rounded bg-token-muted" />
            </div>
            <div className="h-3 w-12 rounded bg-token-muted" />
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="h-14 rounded-lg bg-token-muted" />
            <div className="h-14 rounded-lg bg-token-muted" />
            <div className="h-14 rounded-lg bg-token-muted" />
          </div>

          <div className="h-24 rounded-lg bg-token-muted" />
        </div>
      </Loading>
    )
  }

  const m = stats?.metrics || {}
  const series = stats?.series || []

  return (
    <div className="rounded-lg border border-token bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-subtle">Class Overview</div>
          <div className="mt-2 text-lg font-bold text-main">Progress</div>
        </div>
        <div className="rounded-full border border-token bg-app px-3 py-1 text-xs text-muted">Last 12 weeks</div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-token bg-app px-3 py-4 text-center">
          <div className="text-2xl font-extrabold text-main">{m.activeUsers ?? '-'}</div>
          <div className="mt-1 text-xs text-muted">Active students</div>
        </div>
        <div className="rounded-lg border border-token bg-app px-3 py-4 text-center">
          <div className="text-2xl font-extrabold text-main">{m.totalCourses ?? '-'}</div>
          <div className="mt-1 text-xs text-muted">Courses</div>
        </div>
        <div className="rounded-lg border border-token bg-app px-3 py-4 text-center">
          <div className="text-2xl font-extrabold text-main">{m.avgScore ? `${Math.round(m.avgScore)}%` : '-'}</div>
          <div className="mt-1 text-xs text-muted">Average score</div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-xs font-medium text-muted">
        <span>Due soon: {m.dueSoon ?? 0}</span>
        <span>Needs checking: {m.pendingReviews ?? 0}</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-token bg-app px-3 py-4">
        <Sparkline data={series} width={260} height={70} />
      </div>
    </div>
  )
}
