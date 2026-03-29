import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function CourseCard({ course }){
  const navigate = useNavigate()
  const openCourse = () => navigate(`/courses/${course.id}`)

  return (
    <div className="flex items-center justify-between bg-surface rounded-xl border border-token p-4 shadow-sm transition-colors hover-surface">
      <button
        type="button"
        onClick={openCourse}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
      >
        <img src={course.image} alt={course.title} className="w-14 h-14 object-cover rounded-md" />
        <div className="min-w-0">
          <div className="font-semibold">{course.title}</div>
          <div className="text-[13px] text-muted truncate">by {course.author} - {course.length}</div>
        </div>
      </button>
      <div className="flex items-center gap-3 pl-4">
        <button
          type="button"
          onClick={openCourse}
          className="px-3 py-1 bg-black text-white rounded-full text-sm"
        >
          View course
        </button>
      </div>
    </div>
  )
}
