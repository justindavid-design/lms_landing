import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  MoreVert,
  AssignmentInd,
  FolderOpen,
  CopyAll,
  DeleteOutline,
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

export default function CourseCard({
  course,
  isTeacher,
  profileName,
  userEmail,
  onCopyCode,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const teacherInitial = (course.author_name || 'T').trim().charAt(0).toUpperCase()
  const userInitial = (profileName || userEmail || 'U').trim().charAt(0).toUpperCase()

  const imageUrl = useMemo(() => {
    return course.cover_image || getCourseImage(course.id || course.slug || course.title)
  }, [course])

  const learnerCount = useMemo(() => {
    if (typeof course.learner_count === 'number') return course.learner_count
    return 18
  }, [course])

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
    <div className="w-[280px]">
      <div className="overflow-hidden rounded-lg border border-token bg-surface shadow-sm transition-shadow hover:shadow-md">
        {/* Thumbnail Section */}
        <div className="relative h-[200px] bg-gray-800 overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/65 z-10" />

          {/* Course image */}
          <img
            src={imageUrl}
            alt={course.title || 'Course thumbnail'}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />

          {/* Top left — avatars + count */}
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
            <div className="flex">
              <div className="w-6 h-6 rounded-full bg-[#111827] border border-white flex items-center justify-center text-white text-[10px] font-bold">
                {teacherInitial}
              </div>
              <div className="w-6 h-6 rounded-full bg-[#6b7280] border border-white -ml-2 flex items-center justify-center text-white text-[10px] font-bold">
                {userInitial}
              </div>
            </div>
            <div className="bg-black/50 rounded-full px-2 py-0.5">
              <span className="text-white text-xs font-medium">{learnerCount}</span>
            </div>
          </div>

          {/* Top right — menu */}
          <div ref={menuRef} className="absolute top-2.5 right-3 z-20">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-white text-lg tracking-widest hover:opacity-80 transition-opacity"
              aria-label="Card options"
              aria-expanded={menuOpen}
            >
              ···
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-token bg-surface shadow-xl">
                <button
                  type="button"
                  onClick={openCourse}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-main hover:bg-surface-alt"
                >
                  <FolderOpen fontSize="small" />
                  Open class
                </button>

                {isTeacher && course.course_code && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onCopyCode(course.course_code)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-main hover:bg-surface-alt"
                  >
                    <CopyAll fontSize="small" />
                    Copy code
                  </button>
                )}

                {isTeacher && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit(course)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-main hover:bg-surface-alt"
                  >
                    <AssignmentInd fontSize="small" />
                    Edit course
                  </button>
                )}

                {isTeacher && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete(course.id)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <DeleteOutline fontSize="small" />
                    Delete course
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom — teacher + subject */}
          <div className="absolute bottom-4 left-3.5 right-3.5 z-20">
            <p className="text-white/80 text-[11px] mb-0.5">By: {course.author_name || 'Teacher name'}</p>
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-tight line-clamp-2">
              {course.title || 'Subject name'}
            </h2>
          </div>
        </div>

        {/* Info Section */}
        <div className="px-3.5 pt-3.5 pb-1.5">
          <p className="text-sm font-bold text-main mb-0.5">{dueText}</p>
          <p className="text-[13px] text-muted">{activityText}</p>
        </div>

        {/* Button */}
        <div className="px-3.5 pt-3 pb-4">
          <button
            type="button"
            onClick={openCourse}
            className="w-full rounded-lg bg-[#111827] py-3.5 text-[15px] font-semibold tracking-wide text-white transition-colors hover:bg-[#374151] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
          >
            Enter class
          </button>
        </div>
      </div>
    </div>
  )
}
