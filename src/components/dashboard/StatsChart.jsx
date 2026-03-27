import React, { useEffect, useState } from 'react'
import Loading from '../Loading'

function Sparkline({ data = [], width = 300, height = 80, stroke = '#3b82f6' }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const len = data.length
  const points = data.map((d, i) => {
    const x = (i / (len - 1)) * width
    const y = height - ((d - min) / Math.max(1, max - min)) * height
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} className="block">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function StatsChart(){
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const url = '/api/stats'
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!mounted) return
        setStats(data)
      })
      .catch(() => {
        // fallback sample if API unavailable
        if (!mounted) return
        setStats({ metrics: { activeUsers: 12, totalCourses: 8, avgScore: 78 }, series: [50,55,60,58,62,64,66,70] })
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  if (loading) return (
    <Loading message="Loading analytics…">
      <div className="bg-surface rounded-xl-card p-4 border border-token shadow-sm animate-pulse" aria-hidden>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="h-4 bg-token-muted rounded w-24 mb-2"></div>
            <div className="h-4 bg-token-muted rounded w-32"></div>
          </div>
          <div className="h-3 bg-token-muted rounded w-12"></div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="h-10 bg-token-muted rounded"></div>
          <div className="h-10 bg-token-muted rounded"></div>
          <div className="h-10 bg-token-muted rounded"></div>
        </div>

        <div className="h-20 bg-token-muted rounded"></div>
      </div>
    </Loading>
  )

  const m = stats?.metrics || {}
  const series = stats?.series || []

  return (
    <div className="bg-surface rounded-xl-card p-4 border border-token shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-muted">Analytics</div>
          <div className="font-semibold">Overview</div>
        </div>
        <div className="text-xs text-muted">Last 12</div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold">{m.activeUsers ?? '-'}</div>
          <div className="text-xs text-muted">Active users</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{m.totalCourses ?? '-'}</div>
          <div className="text-xs text-muted">Courses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{m.avgScore ? `${Math.round(m.avgScore)}%` : '-'}</div>
          <div className="text-xs text-muted">Avg score</div>
        </div>
      </div>

      <div>
        <Sparkline data={series} width={260} height={70} stroke="#10b981" />
      </div>
    </div>
  )
}

