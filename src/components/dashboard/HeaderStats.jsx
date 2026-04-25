import React from 'react'

export default function HeaderStats({ stats = [] }){
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={s.onClick}
          disabled={!s.onClick}
          className={`min-w-0 rounded-lg border border-token bg-surface p-4 text-left shadow-sm transition-colors ${
            s.onClick ? 'cursor-pointer hover-surface' : 'cursor-default'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-subtle">{s.label}</div>
          <div className="mt-3 text-3xl font-extrabold text-main">{s.value}</div>
        </button>
      ))}
    </div>
  )
}
