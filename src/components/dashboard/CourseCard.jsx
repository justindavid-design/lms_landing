import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function CourseCard({ course }){
  const navigate = useNavigate()
  const openCourse = () => navigate(`/courses/${course.id}`)

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-token bg-app p-4 shadow-sm transition-colors md:flex-row md:items-center md:justify-between hover-surface">
      <button
        type="button"
        onClick={openCourse}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
      >
        <img src={course.image} alt={course.title} className="h-14 w-14 rounded-lg border border-token object-cover" />
        <div className="min-w-0">
          <div className="font-semibold text-main">{course.title}</div>
          <div className="text-[13px] text-muted truncate">by {course.author} - {course.length}</div>
        </div>
      </button>
      <div className="flex items-center gap-3 md:pl-4">
        <button
          type="button"
          onClick={openCourse}
          className="w-full rounded-lg border border-token bg-[#111827] px-4 py-2 text-sm font-semibold text-white md:w-auto"
        >
          View course
        </button>
      </div>
    </div>
  )
}
