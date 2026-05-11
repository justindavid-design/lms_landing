import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AssignmentTurnedInOutlined,
  AutoFixHighOutlined,
  CheckCircleOutline,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LinkOutlined,
  SendOutlined,
} from '@mui/icons-material'
import supabase from '../../lib/supabaseClient'
import { apiFetch } from '../../lib/apiClient'

function formatDate(value) {
  if (!value) return 'Not submitted'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not submitted' : date.toLocaleString()
}

function normalizePercent(value) {
  const score = Number(value)
  if (!Number.isFinite(score)) return null
  return Math.max(0, Math.min(100, score))
}

function getSuggestedReviewText(materials = []) {
  if (!materials.length) {
    return 'Suggested review: revisit the lesson materials for this assignment before resubmitting.'
  }

  const links = materials
    .slice(0, 3)
    .map((item) => {
      const label = item.title || item.name || 'Review material'
      const url = item.link_url || item.url || item.attachment_url || `/courses/${item.course_id || ''}#module-${item.id}`
      return `${label}: ${url}`
    })

  return `Suggested review:\n${links.join('\n')}`
}

export default function TeacherGradingDashboard({ assignmentId, teacherId, passingScore = 75 }) {
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [materials, setMaterials] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const selectedSubmission = submissions[selectedIndex] || null

  const loadSubmissions = useCallback(async () => {
    if (!assignmentId) return
    setLoading(true)
    setMessage('')

    try {
      const { data: assignmentRow, error: assignmentError } = await supabase
        .from('assignments')
        .select('id, course_id, module_id, title, kind, due_at')
        .eq('id', assignmentId)
        .maybeSingle()

      if (assignmentError) throw assignmentError
      if (!assignmentRow) throw new Error('Assignment not found.')

      const [{ data: submissionRows, error: submissionError }, { data: moduleRows, error: moduleError }] = await Promise.all([
        supabase
          .from('submissions')
          .select('id, assignment_id, student_id, content, attachment_url, status, submitted_at, graded_at, score, feedback, updated_at')
          .eq('assignment_id', assignmentId)
          .order('submitted_at', { ascending: true, nullsFirst: false }),
        supabase
          .from('course_modules')
          .select('id, course_id, title, description')
          .eq('course_id', assignmentRow.course_id)
          .order('position', { ascending: true }),
      ])

      if (submissionError) throw submissionError
      if (moduleError) throw moduleError

      const studentIds = [...new Set((submissionRows || []).map((row) => row.student_id).filter(Boolean))]
      const { data: profiles, error: profileError } = studentIds.length
        ? await supabase.from('profiles').select('id, display_name, avatar_url').in('id', studentIds)
        : { data: [], error: null }

      if (profileError) throw profileError

      const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]))
      const enrichedSubmissions = (submissionRows || []).map((row) => ({
        ...row,
        student_name: profileMap.get(row.student_id)?.display_name || 'Student',
        avatar_url: profileMap.get(row.student_id)?.avatar_url || null,
      }))

      setAssignment(assignmentRow)
      setSubmissions(enrichedSubmissions)
      setMaterials(moduleRows || [])
      setSelectedIndex(0)
      setDrafts(
        enrichedSubmissions.reduce((acc, row) => {
          acc[row.id] = {
            score: row.score ?? '',
            feedback: row.feedback || '',
          }
          return acc
        }, {})
      )
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Unable to load grading data.')
    } finally {
      setLoading(false)
    }
  }, [assignmentId])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  const gradedCount = useMemo(
    () => submissions.filter((submission) => submission.status === 'graded' || submission.graded_at).length,
    [submissions]
  )

  const updateDraft = (submissionId, updates) => {
    setDrafts((current) => ({
      ...current,
      [submissionId]: {
        ...current[submissionId],
        ...updates,
      },
    }))
  }

  const applyFeedbackTrigger = (submissionId, rawScore) => {
    const score = normalizePercent(rawScore)
    if (score == null) return

    if (score < passingScore) {
      updateDraft(submissionId, {
        score,
        feedback: getSuggestedReviewText(materials),
      })
    } else {
      updateDraft(submissionId, { score })
    }
  }

  const saveGrade = async (submission) => {
    const draft = drafts[submission.id] || {}

    const res = await apiFetch(`/api/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: teacherId,
        score: draft.score === '' ? null : Number(draft.score),
        feedback: draft.feedback || null,
      }),
    })

    const payload = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(payload?.error || 'Unable to save grade.')
  }

  const returnOne = async (submission) => {
    setSaving(true)
    setMessage('')
    try {
      await saveGrade(submission)
      await loadSubmissions()
      setMessage(`Returned feedback to ${submission.student_name}.`)
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Unable to return feedback.')
    } finally {
      setSaving(false)
    }
  }

  const returnAll = async () => {
    setSaving(true)
    setMessage('')

    try {
      await Promise.all(submissions.map((submission) => saveGrade(submission)))
      await loadSubmissions()
      setMessage(`Returned ${submissions.length} submissions.`)
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Unable to return all submissions.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="rounded-3xl border border-[#dfe9e2] bg-white p-6 text-sm font-bold text-[#66776d]">Loading submissions...</div>
  }

  return (
    <section className="rounded-[30px] border border-[#dfe9e2] bg-white shadow-[0_22px_70px_rgba(31,42,35,0.08)]">
      <div className="flex flex-col gap-4 border-b border-[#e6eee8] p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1f7a4d]">Teacher grading</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#17251d]">{assignment?.title || 'Assignment submissions'}</h2>
          <p className="mt-1 text-sm font-bold text-[#66776d]">{gradedCount}/{submissions.length} returned</p>
        </div>

        <button
          type="button"
          onClick={returnAll}
          disabled={saving || submissions.length === 0}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[#1f7a4d] px-5 text-sm font-black text-white shadow-[0_16px_30px_rgba(31,122,77,0.22)] transition hover:bg-[#18613d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SendOutlined sx={{ fontSize: 18 }} />
          Return All
        </button>
      </div>

      {message ? (
        <div className="mx-5 mt-5 rounded-2xl border border-[#dfe9e2] bg-[#f7fcf8] px-4 py-3 text-sm font-bold text-[#145c39]">{message}</div>
      ) : null}

      <div className="grid min-h-[560px] lg:grid-cols-[360px_1fr]">
        <div className="border-b border-[#e6eee8] p-4 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-black text-[#17251d]">Students</h3>
            <span className="rounded-full bg-[#e6f6ec] px-2.5 py-1 text-xs font-black text-[#145c39]">{submissions.length}</span>
          </div>

          <div className="max-h-[500px] overflow-auto rounded-2xl border border-[#e6eee8]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-[#f7fcf8] text-xs font-black uppercase tracking-[0.12em] text-[#66776d]">
                <tr>
                  <th className="px-3 py-3">Student</th>
                  <th className="px-3 py-3">Score</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, index) => {
                  const active = selectedSubmission?.id === submission.id
                  const score = drafts[submission.id]?.score ?? submission.score ?? '-'
                  return (
                    <tr
                      key={submission.id}
                      onClick={() => setSelectedIndex(index)}
                      className={`cursor-pointer border-t border-[#edf3ef] outline-none transition hover:bg-[#f7fcf8] ${active ? 'bg-[#e6f6ec]' : 'bg-white'}`}
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') setSelectedIndex(index)
                      }}
                    >
                      <td className="px-3 py-3">
                        <div className="font-black text-[#17251d]">{submission.student_name}</div>
                        <div className="text-xs font-bold text-[#66776d]">{formatDate(submission.submitted_at)}</div>
                      </td>
                      <td className="px-3 py-3 font-black text-[#17251d]">{score}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-black ${submission.status === 'graded' ? 'bg-[#e6f6ec] text-[#145c39]' : 'bg-[#fff5df] text-[#995d13]'}`}>
                          {submission.status || 'submitted'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-5">
          {selectedSubmission ? (
            <div className="grid gap-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e6f6ec] text-[#145c39]">
                    <AssignmentTurnedInOutlined />
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-[#17251d]">{selectedSubmission.student_name}</h3>
                    <p className="text-sm font-bold text-[#66776d]">{formatDate(selectedSubmission.submitted_at)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSelectedIndex((value) => Math.max(0, value - 1))} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe9e2] hover:bg-[#f7fcf8]" aria-label="Previous student">
                    <KeyboardArrowLeft />
                  </button>
                  <button type="button" onClick={() => setSelectedIndex((value) => Math.min(submissions.length - 1, value + 1))} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe9e2] hover:bg-[#f7fcf8]" aria-label="Next student">
                    <KeyboardArrowRight />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-[#dfe9e2] bg-[#f7fcf8] p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#66776d]">Submission</p>
                <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-7 text-[#17251d]">{selectedSubmission.content || 'No written response.'}</p>
                {selectedSubmission.attachment_url ? (
                  <a href={selectedSubmission.attachment_url} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-black text-[#145c39] hover:bg-[#e6f6ec]">
                    <LinkOutlined sx={{ fontSize: 17 }} />
                    Attachment
                  </a>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <label className="block">
                  <span className="text-sm font-black text-[#17251d]">Score (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={drafts[selectedSubmission.id]?.score ?? ''}
                    onChange={(event) => applyFeedbackTrigger(selectedSubmission.id, event.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-[#cfded4] bg-white px-4 text-sm font-black text-[#17251d] outline-none focus:ring-4 focus:ring-[#1f7a4d]/20"
                  />
                </label>
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-black text-[#17251d]">
                    <AutoFixHighOutlined sx={{ fontSize: 18 }} />
                    Feedback / Suggested Review
                  </span>
                  <textarea
                    value={drafts[selectedSubmission.id]?.feedback ?? ''}
                    onChange={(event) => updateDraft(selectedSubmission.id, { feedback: event.target.value })}
                    className="mt-2 min-h-[150px] w-full rounded-2xl border border-[#cfded4] bg-white px-4 py-3 text-sm font-semibold leading-7 text-[#17251d] outline-none focus:ring-4 focus:ring-[#1f7a4d]/20"
                    placeholder="Write feedback or let the score trigger suggested review materials."
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-bold text-[#66776d]">
                  Scores below {passingScore}% automatically suggest relevant review materials.
                </div>
                <button
                  type="button"
                  onClick={() => returnOne(selectedSubmission)}
                  disabled={saving}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-[#1f7a4d] px-5 text-sm font-black text-white shadow-[0_16px_30px_rgba(31,122,77,0.22)] transition hover:bg-[#18613d] disabled:opacity-60"
                >
                  <CheckCircleOutline sx={{ fontSize: 18 }} />
                  Return Selected
                </button>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[420px] place-items-center rounded-3xl border border-dashed border-[#cfded4] bg-[#f7fcf8] text-center">
              <div>
                <AssignmentTurnedInOutlined className="text-[#1f7a4d]" sx={{ fontSize: 48 }} />
                <h3 className="mt-3 text-xl font-black text-[#17251d]">No submissions yet</h3>
                <p className="mt-2 text-sm font-bold text-[#66776d]">Student work will appear here once submitted.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
