import React from 'react'
import { LibraryBooks, Description, Assignment, BarChart, TrendingUp } from '@mui/icons-material'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LibraryBooks },
  { id: 'materials', label: 'Materials', icon: Description },
  { id: 'assignments', label: 'Assignments', icon: Assignment },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'grades', label: 'Grades', icon: BarChart },
]

export default function CourseTabs({ activeTab = 'overview', onChange = () => {} }) {
  return (
    <div className="border-b border-token">
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-muted hover:text-main'
              }`}
            >
              <Icon sx={{ fontSize: '1rem' }} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
