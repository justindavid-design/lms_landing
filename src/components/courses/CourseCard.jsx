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
    <div className="w-[280px]">
      <div className="overflow-hidden rounded-lg border border-token bg-surface shadow-sm transition-shadow hover:shadow-md">
        <div className="relative h-[135px] overflow-hidden bg-gray-800">
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/10 via-transparent to-black/70" />

          <img
            src={imageUrl}
            alt={course.title || 'Course thumbnail'}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />

          <div className="absolute left-2.5 top-2.5 z-20 flex items-center gap-1.5">
            {visibleStudents.length > 0 ? (
              <div className="flex" aria-label={`${learnerCount} enrolled students`}>
                {visibleStudents.map((student, index) => (
                  <StudentAvatar key={student.id || index} student={student} offset={index > 0} />
                ))}
              </div>
            ) : null}
            <div className="rounded-full bg-black/55 px-2 py-0.5" title={`${learnerCount} enrolled student${learnerCount === 1 ? '' : 's'}`}>
              <span className="text-xs font-medium text-white">{learnerCount}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={openCourse}
            className="absolute inset-0 z-10"
            aria-label={`Open ${course.title || 'course'}`}
          />

          <div className="absolute bottom-4 left-3.5 right-3.5 z-20">
            <p className="mb-0.5 text-[11px] text-white/80">By: {course.author_name || 'Teacher name'}</p>
            <h2 className="line-clamp-2 text-[22px] font-bold leading-tight tracking-tight text-white">
              {course.title || 'Subject name'}
            </h2>
          </div>
        </div>

        <div className="min-h-[150px] border-b border-token px-3.5 pb-4 pt-4">
          <p className="mb-0.5 text-sm font-bold text-main">{dueText}</p>
          <p className="text-[13px] text-muted">{activityText}</p>
        </div>

        <div className="flex h-[52px] items-center justify-end gap-4 bg-surface px-3">
          <button
            type="button"
            onClick={openCourse}
            className="rounded-full p-2 text-muted transition-colors hover:bg-surface-alt hover:text-main"
            aria-label="Open class activity"
          >
            <ShowChart fontSize="small" />
          </button>
          <button
            type="button"
            onClick={openCourse}
            className="rounded-full p-2 text-muted transition-colors hover:bg-surface-alt hover:text-main"
            aria-label="Open class folder"
          >
            <FolderOpen fontSize="small" />
          </button>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-full p-2 text-muted transition-colors hover:bg-surface-alt hover:text-main"
              aria-label="Card options"
              aria-expanded={menuOpen}
            >
              <MoreVert fontSize="small" />
            </button>

            {menuOpen && (
              <div className="absolute bottom-full right-0 z-20 mb-2 w-44 overflow-hidden rounded-lg border border-token bg-surface shadow-xl">
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
        </div>
      </div>
    </div>
  )
}
