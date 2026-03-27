import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function CourseCard({ course }){
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between bg-surface rounded-xl border border-token p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <img src={course.image} alt={course.title} className="w-14 h-14 object-cover rounded-md" />
        <div>
          <div className="font-semibold">{course.title}</div>
          <div className="text-[13px] text-muted">by {course.author} · {course.length}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/courses/${course.id}`)}
          className="px-3 py-1 bg-black text-white rounded-full text-sm"
        >
          View course
        </button>
      </div>
    </div>
  )
}
