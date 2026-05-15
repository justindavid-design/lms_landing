import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  MoreVert,
  AssignmentInd,
  FolderOpen,
  CopyAll,
  DeleteOutline,
  ShowChart,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getCourseImage } from './utils'

function formatDueText(nextDueAt) {
  if (!nextDueAt) return 'Due Wednesday'

  const date = new Date(nextDueAt)
  if (Number.isNaN(date.getTime())) return 'Due Wednesday'

  return `Due ${date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  })}`
}

function getActivityText(course) {
  if (course?.next_activity_title) return course.next_activity_title
  return 'Activity #2 (NAT)'
}

function getInitials(name) {
  return String(name || 'Student')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'S'
}

function StudentAvatar({ student, offset = false }) {
  const name = student?.display_name || 'Student'

  return (
    <div
      className={`flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-white bg-[#111827] text-[9px] font-bold text-white ${offset ? '-ml-2' : ''}`}
      title={name}
    >
      {student?.avatar_url ? (
        <img src={student.avatar_url} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}

export default function CourseCard({
  course,
  isTeacher,
  onCopyCode,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const imageUrl = useMemo(() => {
    return course.cover_image || getCourseImage(course.id || course.slug || course.title)
  }, [course])

  const learnerCount = useMemo(() => {
    if (typeof course.learner_count === 'number') return course.learner_count
    if (typeof course.student_count === 'number') return course.student_count
    return Array.isArray(course.enrolled_students) ? course.enrolled_students.length : 0
  }, [course])

  const visibleStudents = useMemo(() => {
    return Array.isArray(course.enrolled_students) ? course.enrolled_students.slice(0, 3) : []
  }, [course.enrolled_students])

  const dueText = useMemo(() => formatDueText(course.next_due_at), [course.next_due_at])
  const activityText = useMemo(() => getActivityText(course), [course])

  const openCourse = () => {
    navigate(`/courses/${course.id}`)
  }

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div className="w-[240px]">
      {/* Card shell */}
      <div className="rounded-[20px] bg-white shadow-sm">
        

        {/* IMAGE SECTION — padded so all 4 rounded corners are visible */}
        <div className="relative px-2 pt-2">

          {/* Inset rounded image */}
          <div className="relative h-[150px] overflow-hidden rounded-[12px]">
            <img
              src={imageUrl}
              alt={course.title || 'Course thumbnail'}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {/* Subtle dark overlay */}
            
            <div className="absolute inset-0 bg-black/10" />

            {/* Student avatars — top left */}
            <div className="absolute bg-white rounded-full left-3 top-3 flex items-center gap-1">
              <div className="flex">
                {visibleStudents.slice(0, 3).map((student, index) => (
                  <StudentAvatar key={student.id || index} student={student} offset={index > 0} />
                ))}
              </div>
              <div className="flex h-5 min-w-[22px] items-center justify-center text-[11px] font-bold text-black shadow-sm">
                {learnerCount}
              </div>
            </div>
          </div>
          

          {/* Menu button — overlaps between image and content area */}
          <div ref={menuRef} className="absolute bottom-[-18px] right-6 z-30">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105"
            >
              <MoreVert className="text-black" fontSize="small" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[50px] z-50 w-44 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                <button
                  type="button"
                  onClick={openCourse}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-gray-50"
                >
                  <FolderOpen fontSize="small" />
                  Open class
                </button>

                {isTeacher && course.course_code && (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onCopyCode(course.course_code) }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-gray-50"
                  >
                    <CopyAll fontSize="small" />
                    Copy code
                  </button>
                )}

                {isTeacher && (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onEdit(course) }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-gray-50"
                  >
                    <AssignmentInd fontSize="small" />
                    Edit course
                  </button>
                )}

                {isTeacher && (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onDelete(course.id) }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50"
                  >
                    <DeleteOutline fontSize="small" />
                    Delete course
                  </button>
                )}
              </div>
            )}
          </div>
        </div>


        {/* CONTENT SECTION */}
        <button
          type="button"
          onClick={openCourse}
          className="w-full px-4 pb-5 pt-7 text-left"
        >
          <p className="mb-0.5 text-[12px] font-medium text-[#888888]">
            By: {course.author_name || 'Teacher name'}
          </p>
          <h2 className="line-clamp-2 text-[20px] font-black leading-tight tracking-[-0.5px] text-black">
            {course.title || 'Subject name'}
          </h2>
        </button>

      </div>
    </div>
  )
}