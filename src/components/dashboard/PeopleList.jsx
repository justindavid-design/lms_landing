import React, { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/apiClient'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function PeopleList({ courseId }) {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (courseId) {
      loadPeople()
    }
  }, [courseId])

  const loadPeople = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiFetch(`/api/courses/${courseId}/people`)
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }
      const data = await res.json()
      setPeople(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load people:', error)
      setError('Failed to load people list. Please try again.')
      setPeople([])
    } finally {
      setLoading(false)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
            <div className="h-6 bg-slate-200 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 max-w-md w-full text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
          <p className="text-red-800 font-medium mb-4">{error}</p>
          <button
            onClick={loadPeople}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const teachers = people.filter(p => p.role === 'teacher' || p.role === 'instructor')
  const students = people.filter(p => p.role === 'student')

  const PersonCard = ({ person, isTeacher }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 bg-white">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-slate-700">
            {person.name ? person.name.charAt(0).toUpperCase() : '?'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 truncate">{person.name || 'Unknown'}</p>
          <p className="text-sm text-slate-600 truncate">{person.email}</p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
        isTeacher 
          ? 'bg-blue-100 text-blue-700' 
          : 'bg-slate-100 text-slate-700'
      }`}>
        {isTeacher ? 'Instructor' : 'Student'}
      </span>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Teachers Section */}
      {teachers.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Instructors ({teachers.length})</h3>
          <div className="space-y-2">
            {teachers.map((teacher) => (
              <PersonCard key={teacher.id} person={teacher} isTeacher={true} />
            ))}
          </div>
        </div>
      )}

      {/* Students Section */}
      {students.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Students ({students.length})</h3>
          <div className="space-y-2">
            {students.map((student) => (
              <PersonCard key={student.id} person={student} isTeacher={false} />
            ))}
          </div>
        </div>
      )}

      {people.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-slate-600">No people in this course yet</p>
        </div>
      )}
    </div>
  )
}
