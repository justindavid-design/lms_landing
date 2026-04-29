import React, { useEffect, useState } from 'react'
import { useAuth } from '../../lib/AuthProvider'
import Loading from '../Loading'
import StudentProgress from './StudentProgress'

/**
 * TeacherStudentProgress - Teacher view for viewing a specific student's progress
 * Allows teachers to select and view progress for any student in their course
 * Parents: CourseDetails
 */
export default function TeacherStudentProgress({ courseId }) {
  const { user } = useAuth()
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStudents() {
      if (!courseId || !user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/courses/${courseId}/students?user_id=${encodeURIComponent(user.id)}`)
        if (!res.ok) {
          // If students endpoint doesn't exist, try getting enrollments another way
          throw new Error('Failed to load students')
        }

        const data = await res.json()
        setEnrolledStudents(Array.isArray(data) ? data : [])
        if (data.length > 0) {
          setSelectedStudentId(data[0].id)
        }
      } catch (err) {
        console.error('Error loading students:', err)
        // Don't set error - we'll handle this gracefully
        setEnrolledStudents([])
      } finally {
        setLoading(false)
      }
    }

    loadStudents()
  }, [courseId, user?.id])

  if (loading) {
    return (
      <Loading message="Loading students…">
        <div className="h-20 bg-surface-alt rounded-lg animate-pulse" />
      </Loading>
    )
  }

  return (
    <div className="space-y-4">
      {/* Student Selector */}
      {enrolledStudents.length > 0 ? (
        <>
          <div className="rounded-lg border border-token bg-surface p-4 shadow-sm">
            <label className="block text-sm font-semibold text-main mb-2">Select Student</label>
            <select
              value={selectedStudentId || ''}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-token rounded-lg bg-app text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a student...</option>
              {enrolledStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.display_name || 'Unknown Student'}
                </option>
              ))}
            </select>
          </div>

          {selectedStudentId && (
            <StudentProgress courseId={courseId} studentId={selectedStudentId} />
          )}
        </>
      ) : (
        <div className="rounded-lg border border-token bg-surface p-6 text-center">
          <p className="text-muted text-sm">No students enrolled in this course yet.</p>
        </div>
      )}
    </div>
  )
}
