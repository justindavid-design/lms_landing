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
    <div className="w-full max-w-[370px]">
      <div className="overflow-hidden rounded-[34px] border border-slate-300 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
        <div className="relative h-[250px] overflow-hidden rounded-[30px]">
          <img
            src={imageUrl}
            alt={course.title || 'Course cover'}
            className="h-full w-full object-cover"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute left-5 top-4 flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-slate-900 shadow-sm">
            <div className="flex -space-x-1.5">
              <span className="grid h-5 w-5 place-items-center rounded-full border border-white bg-green-700 text-[10px] text-white">
                {teacherInitial}
              </span>
              <span className="grid h-5 w-5 place-items-center rounded-full border border-white bg-black text-[10px] text-white">
                {userInitial}
              </span>
            </div>
            <span>{learnerCount}</span>
          </div>

          <div ref={menuRef} className="absolute right-4 top-4">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="grid h-8 w-8 place-items-center rounded-full bg-black/20 text-white backdrop-blur-sm"
              aria-label="Card options"
            >
              <MoreVert fontSize="small" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <button
                  type="button"
                  onClick={openCourse}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
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
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
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
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
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
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <DeleteOutline fontSize="small" />
                    Delete course
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="absolute left-6 bottom-5 right-6 text-white">
            <p className="text-[15px] font-medium text-white/90">
              By: {course.author_name || 'Teacher name'}
            </p>
            <h3
              className="mt-1 line-clamp-2 text-[28px] font-extrabold leading-[0.95] tracking-[-0.02em]"
              title={course.title}
            >
              {course.title || 'Subject name'}
            </h3>
          </div>
        </div>

        <div className="flex min-h-[220px] flex-col px-6 pb-5 pt-5">
          <div>
            <p className="text-[17px] font-semibold leading-none text-black">
              {dueText}
            </p>
            <p className="mt-2 text-[14px] leading-none text-slate-700">
              {activityText}
            </p>
          </div>

          <div className="flex-1" />

          <button
            type="button"
            onClick={openCourse}
            className="mt-6 w-full rounded-[18px] bg-[#004b33] py-4 text-[18px] font-semibold text-white transition hover:bg-[#003c29]"
          >
            Enter class
          </button>
        </div>
      </div>
    </div>
  )
}