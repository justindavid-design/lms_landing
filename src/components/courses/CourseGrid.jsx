import React from 'react'
import CourseCard from './CourseCard'

export default function CourseGrid({
  items,
  user,
  profileName,
  onCopyCode,
  onEdit,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((course) => (
        <div key={course.id} className="flex justify-center">
          <CourseCard
            course={course}
            isTeacher={String(course.author) === String(user?.id)}
            profileName={profileName}
            userEmail={user?.email}
            onCopyCode={onCopyCode}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  )
}