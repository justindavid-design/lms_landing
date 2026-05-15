import React, { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/apiClient'

export default function SubmissionsPanel({ assignment, courseId, onClose }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [gradingId, setGradingId] = useState(null)
  const [gradingScore, setGradingScore] = useState('')
  const [gradingFeedback, setGradingFeedback] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSubmissions()
  }, [assignment?.id])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const res = await apiFetch(`/api/assignments/${assignment.id}/submissions`)
      const data = await res.json()
      setSubmissions(data || [])
    } catch (err) {
      setError('Failed to load submissions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGrade = (submission) => {
    setGradingId(submission.id)
    setGradingScore(submission.score || '')
    setGradingFeedback(submission.feedback || '')
  }

  const saveGrade = async () => {
    if (!gradingScore) {
      alert('Please enter a score')
      return
    }

    try {
      setSaving(true)
      const res = await apiFetch(`/api/submissions/${gradingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: parseFloat(gradingScore),
          feedback: gradingFeedback
        })
      })
      const updatedSubmission = await res.json()

      // Update local state
      setSubmissions(prev => prev.map(s => 
        s.id === gradingId 
          ? { ...s, ...updatedSubmission }
          : s
      ))

      setGradingId(null)
      alert('Grade saved successfully')
    } catch (err) {
      alert('Failed to save grade')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const isLate = (submittedAt) => {
    if (!submittedAt || !assignment.due_at) return false
    return new Date(submittedAt) > new Date(assignment.due_at)
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Loading submissions...</div>
  }

  const submitted = submissions.filter(s => s.submitted_at)
  const graded = submissions.filter(s => s.score !== null)
  const pending = submitted.length - graded.length

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{assignment.title}</h2>
          <p className="text-sm text-slate-600 mt-1">Due: {formatDate(assignment.due_at)}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 font-semibold text-sm"
        >
          ✕ Close
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase">Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{submissions.length}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase">Submitted</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{submitted.length}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase">Graded</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{graded.length}</p>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">{error}</div>}

      {/* Submissions List */}
      <div className="space-y-3">
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600">No submissions yet</p>
          </div>
        ) : (
          submissions.map(sub => (
            <div key={sub.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{sub.student_name || 'Anonymous Student'}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Submitted: {formatDate(sub.submitted_at) || 'Not submitted'}
                  </p>
                  {sub.submitted_at && isLate(sub.submitted_at) && (
                    <p className="text-xs text-red-600 font-semibold mt-1">⚠ Late submission</p>
                  )}
                </div>
                <div className="text-right">
                  {sub.score !== null ? (
                    <div>
                      <p className="text-3xl font-bold text-blue-600">{sub.score}</p>
                      <p className="text-xs text-slate-600">Points</p>
                    </div>
                  ) : (
                    <span className="inline-block px-2.5 py-1.5 bg-yellow-100 border border-yellow-300 rounded-lg text-xs font-semibold text-yellow-700">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Submission Content Preview */}
              {sub.content && (
                <div className="mb-3 p-3 bg-slate-50 rounded border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Submission Content:</p>
                  <p className="text-sm text-slate-700 line-clamp-3 font-mono">{sub.content}</p>
                </div>
              )}

              {/* Grading Section */}
              {gradingId === sub.id ? (
                <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">Score / Points</label>
                    <input
                      type="number"
                      value={gradingScore}
                      onChange={e => setGradingScore(e.target.value)}
                      placeholder="Enter score"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">Feedback</label>
                    <textarea
                      value={gradingFeedback}
                      onChange={e => setGradingFeedback(e.target.value)}
                      placeholder="Add feedback for student..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      rows="3"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveGrade}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Grade'}
                    </button>
                    <button
                      onClick={() => setGradingId(null)}
                      className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleGrade(sub)}
                  className="w-full px-3 py-2 bg-blue-100 text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-200 transition-colors"
                >
                  {sub.score !== null ? '✎ Edit Grade' : 'Grade Submission'}
                </button>
              )}

              {/* Show Existing Feedback */}
              {sub.feedback && gradingId !== sub.id && (
                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Teacher Feedback:</p>
                  <p className="text-sm text-blue-900">{sub.feedback}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
