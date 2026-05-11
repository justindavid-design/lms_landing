import React from 'react'
import { Edit, Delete } from '@mui/icons-material'

function formatDateTime(value) {
  if (!value) return 'No date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'No date' : date.toLocaleString()
}

function Badge({ children, tone = 'bg-surface' }) {
  return <span className={`rounded-full border border-token px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-main ${tone}`}>{children}</span>
}

export default function ActivityFeed({ 
  items, 
  isTeacher,
  onEditModule,
  onEditAssignment,
  onEditQuiz,
  onDeleteModule,
  onDeleteAssignment,
  onDeleteQuiz,
  courseTitle,
  courseCode,
}) {
  return (
    <div>
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Class Code Card */}
          {courseCode && (
            <div className="rounded-[24px] border border-token bg-surface p-4">
              <h3 className="text-sm font-semibold text-main uppercase">Class code</h3>
              <p className="mt-3 text-lg font-bold text-main font-mono">{courseCode}</p>
            </div>
          )}
          
          {/* Upcoming Card */}
          <div className="rounded-[24px] border border-token bg-surface p-4">
            <h3 className="text-sm font-semibold text-main uppercase">Upcoming</h3>
            <p className="mt-3 text-sm text-muted">No work due soon</p>
            <button className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700">View all</button>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="lg:col-span-3">
          {/* Stream Content */}
          {items.length === 0 ? (
            <div className="rounded-[24px] border border-token bg-app p-8 text-center">
              <p className="text-lg font-semibold text-muted">No activity yet</p>
              <p className="mt-1 text-sm text-muted">When teachers add content, it will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className={`rounded-[24px] border border-token ${item.color} p-4`}>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-2xl">{item.icon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-main">{item.title}</h3>
                          <p className="text-xs text-muted mt-1">{formatDateTime(item.timestamp)}</p>
                          
                          {item.type === 'announcement' && item.body && (
                            <p className="mt-3 text-sm leading-7 text-muted">{item.body}</p>
                          )}
                          
                          {item.type === 'module' && item.description && (
                            <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
                          )}
                          
                          {item.type === 'assignment' && (
                            <>
                              {item.instructions && <p className="mt-3 text-sm leading-7 text-muted">{item.instructions}</p>}
                              <p className="mt-2 text-xs text-muted">Due: {formatDateTime(item.dueAt)}</p>
                            </>
                          )}
                          
                          {item.type === 'quiz' && (
                            <>
                              {item.description && <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>}
                              <p className="mt-2 text-xs text-muted">Due: {formatDateTime(item.dueAt)}</p>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        {isTeacher && (
                          <div className="flex gap-1">
                            {item.type === 'module' && (
                              <>
                                <button
                                  onClick={() => onEditModule(item.data)}
                                  className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Edit module"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => onDeleteModule(item.data)}
                                  className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                  title="Delete module"
                                >
                                  <Delete className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            
                            {item.type === 'assignment' && (
                              <>
                                <button
                                  onClick={() => onEditAssignment(item.data)}
                                  className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Edit assignment"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => onDeleteAssignment(item.data)}
                                  className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                  title="Delete assignment"
                                >
                                  <Delete className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            
                            {item.type === 'quiz' && (
                              <>
                                <button
                                  onClick={() => onEditQuiz(item.data)}
                                  className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Edit quiz"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => onDeleteQuiz(item.data)}
                                  className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                  title="Delete quiz"
                                >
                                  <Delete className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
