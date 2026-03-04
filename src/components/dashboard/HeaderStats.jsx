import React from 'react'

export default function HeaderStats({ stats = [] }){
  return (
    <div className="flex gap-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 w-40">
          <div className="text-xs text-slate-400">{s.label}</div>
          <div className="text-2xl font-bold mt-2">{s.value}</div>
        </div>
      ))}
    </div>
  )
}
