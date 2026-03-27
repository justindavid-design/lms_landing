import React from 'react'

export default function HeaderStats({ stats = [] }){
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-surface rounded-xl shadow-sm border border-token p-4 min-w-0">
          <div className="text-xs text-subtle">{s.label}</div>
          <div className="text-2xl font-bold mt-2">{s.value}</div>
        </div>
      ))}
    </div>
  )
}
