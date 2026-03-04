import React from 'react'

export default function CourseCard({ course }){
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <img src={course.image} alt={course.title} className="w-14 h-14 object-cover rounded-md" />
        <div>
          <div className="font-semibold">{course.title}</div>
          <div className="text-[13px] text-slate-500">by {course.author} · {course.length}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="px-3 py-1 bg-black text-white rounded-full text-sm">View course</button>
      </div>
    </div>
  )
}
