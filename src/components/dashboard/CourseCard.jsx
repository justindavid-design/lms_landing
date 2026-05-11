import React from 'react'
import { useNavigate } from 'react-router-dom'

function getInitials(name) {
  return String(name || 'Student')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'S'
}

export default function CourseCard({ course }) {
  const navigate = useNavigate()
  
  const openCourse = () => navigate(`/courses/${course.id}`)

  return (
    <div className="overflow-hidden rounded-lg border border-token bg-surface shadow-sm transition-shadow hover:shadow-md cursor-pointer" onClick={openCourse}>
      {/* Header Image */}
      <div className="relative h-[135px] overflow-hidden bg-gray-800">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
        
        <img 
          src={course.image} 
          alt={course.title} 
          className="absolute inset-0 h-full w-full object-cover" 
        />

        {/* Course Info Overlay */}
        <div className="absolute bottom-4 left-3.5 right-3.5 z-20">
          <p className="mb-0.5 text-[11px] text-white/80">By: {course.author}</p>
          <h2 className="line-clamp-2 text-[20px] font-bold leading-tight tracking-tight text-white">
            {course.title}
          </h2>
        </div>
      </div>

      {/* Info Section */}
      <div className="px-3.5 py-4 border-b border-token">
        <p className="text-[13px] text-muted">{course.length}</p>
      </div>

      {/* Action Button */}
      <div className="px-3.5 py-3">
        <button
          type="button"
          onClick={openCourse}
          className="w-full rounded-lg border border-token bg-[#111827] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#374151]"
        >
          View course
        </button>
      </div>
    </div>
  )
}
