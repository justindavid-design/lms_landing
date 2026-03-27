import React, { useEffect, useState } from 'react'

const DEFAULT_TODOS = [
  { id: 1, title: 'Add dashboard analytics (StatsChart)', done: true },
  { id: 2, title: 'Profile & settings pages', done: false },
  { id: 3, title: 'Notifications center + real-time updates', done: true },
  { id: 4, title: 'Course management CRUD UI', done: true },
  { id: 5, title: 'Improve accessibility (ARIA, keyboard, contrast)', done: false },
  { id: 6, title: 'Performance: lazy-load widgets', done: false },
  { id: 7, title: 'Add tests (unit + e2e)', done: false },
  { id: 8, title: 'Prepare deployment + monitoring', done: false }
]

const STORAGE_KEY = 'projectTodos'
const ASSIGNED_KEY = 'assignedTasks'

export default function TodoWidget(){
  const [todos, setTodos] = useState([])
  const [isAssigned, setIsAssigned] = useState(false)

  useEffect(()=>{
    try{
      const assignedRaw = localStorage.getItem(ASSIGNED_KEY)
      if(assignedRaw){
        setTodos(JSON.parse(assignedRaw))
        setIsAssigned(true)
        return
      }
      const raw = localStorage.getItem(STORAGE_KEY)
      if(raw){
        setTodos(JSON.parse(raw))
      }else{
        setTodos(DEFAULT_TODOS)
      }
    }catch(e){
      console.warn('Failed to load todos', e)
      setTodos(DEFAULT_TODOS)
    }
  }, [])

  useEffect(()=>{
    // persist only the editable todo list (not assigned tasks)
    try{ if(!isAssigned) localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)) }catch(e){ console.warn('Failed to save todos', e) }
  }, [todos, isAssigned])

  const completed = todos.filter(t=>t.done).length

  return (
    <div className="bg-surface rounded-xl-card p-4 border border-token shadow-sm" role="region" aria-label="Tasks Assigned">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Tasks Assigned</div>
        <div className="text-xs text-muted" aria-live="polite">{completed}/{todos.length}</div>
      </div>

      <ul className="space-y-2 max-h-56 overflow-auto" aria-label="Assigned tasks">
        {todos.map(t => (
          <li key={t.id} className="flex items-start gap-3">
            <input type="checkbox" checked={t.done} disabled className="mt-1" aria-label={`Mark ${t.title} completed`} />
            <div className="flex-1">
              <div className={`text-sm ${t.done ? 'line-through text-subtle' : 'text-main'}`}>{t.title}</div>
            </div>
          </li>
        ))}
        {todos.length===0 && <li className="text-sm text-muted">No assigned tasks.</li>}
      </ul>
    </div>
  )
}
