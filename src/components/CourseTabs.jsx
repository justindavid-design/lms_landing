import React from 'react'

const TABS = [
  { id: 'stream', label: 'Stream' },
  { id: 'classwork', label: 'Classwork' },
  { id: 'people', label: 'People' },
  { id: 'grades', label: 'Grades' },
]

export default function CourseTabs({ activeTab = 'overview', onChange = () => {} }) {
  return (
    <div className="border-b border-[#dadce0] bg-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between">
        <div className="flex overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`h-9 whitespace-nowrap border-b-2 px-5 text-[12px] font-semibold transition-colors ${
                isActive
                  ? 'border-[#1a73e8] text-[#1a73e8]'
                  : 'border-transparent text-[#202124] hover:bg-[#f8fafd] hover:text-[#1a73e8]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
        </div>
      </div>
    </div>
  )
}
