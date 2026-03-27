const {
  computeSubmissionStatus,
  createNotification,
  ensureCourseAccess,
  fetchProfilesByIds,
  getSupabase,
  requireUserId,
  respondWithError,
} = require('./_lms')

async function getAssignment(assignmentId) {
  const { data, error } = await getSupabase()
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .maybeSingle()

  if (error) throw error
  return data
}

module.exports = async (req, res) => {
  try {
    const userId = requireUserId(req)

    if (req.params?.submissionId) {
      if (req.method !== 'PATCH') {
        res.setHeader('Allow', 'PATCH')
        return res.status(405).end('Method Not Allowed')
      }

      const { data: currentSubmission, error: fetchError } = await getSupabase()
        .from('submissions')
        .select('*')
        .eq('id', req.params.submissionId)
        .maybeSingle()

      if (fetchError) throw fetchError
      if (!currentSubmission) return res.status(404).json({ error: 'submission not found' })

      const assignment = await getAssignment(currentSubmission.assignment_id)
      if (!assignment) return res.status(404).json({ error: 'assignment not found' })

      await ensureCourseAccess(assignment.course_id, userId, { teacherOnly: true })

      const body = req.body || {}
      const nowIso = new Date().toISOString()
      const updates = {
        feedback: body.feedback,
        score: body.score != null && body.score !== '' ? Number(body.score) : null,
        graded_at: nowIso,
        status: 'graded',
        updated_at: nowIso,
      }

      const { data, error } = await getSupabase()
        .from('submissions')
        .update(updates)
        .eq('id', req.params.submissionId)
        .select()
        .maybeSingle()

      if (error) throw error

      await createNotification({
        user_id: currentSubmission.student_id,
        course_id: assignment.course_id,
        type: 'grade',
        title: 'Work graded',
        body: `${assignment.title} now has feedback${updates.score != null ? ` and a score of ${updates.score}` : ''}.`,
      })

      return res.status(200).json(data)
    }

    const assignmentId = req.params?.id
    if (!assignmentId) return res.status(400).json({ error: 'assignment id required' })

    const assignment = await getAssignment(assignmentId)
    if (!assignment) return res.status(404).json({ error: 'assignment not found' })

    const access = await ensureCourseAccess(assignment.course_id, userId)

    if (req.method === 'GET') {
      const db = getSupabase()
      const query = db.from('submissions').select('*').eq('assignment_id', assignmentId)
      if (!access.isTeacher) query.eq('student_id', userId)
      const { data, error } = await query.order('submitted_at', { ascending: false, nullsFirst: false })
      if (error) throw error

      const profileMap = await fetchProfilesByIds((data || []).map((item) => item.student_id))
      const payload = (data || []).map((item) => ({
        ...item,
        student_name: profileMap[item.student_id]?.display_name || 'Student',
        status: computeSubmissionStatus(assignment, item),
      }))
      return res.status(200).json(payload)
    }

    if (req.method === 'POST') {
      if (access.isTeacher) {
        return res.status(403).json({ error: 'teachers cannot submit student work' })
      }

      const body = req.body || {}
      const submittedAt = new Date().toISOString()
      const computedStatus = computeSubmissionStatus(assignment, { submitted_at: submittedAt })

      const { data, error } = await getSupabase()
        .from('submissions')
        .upsert(
          [
            {
              assignment_id: assignmentId,
              student_id: userId,
              content: body.content || null,
              attachment_url: body.attachment_url || null,
              status: computedStatus === 'late' ? 'late' : 'submitted',
              submitted_at: submittedAt,
              updated_at: submittedAt,
            },
          ],
          { onConflict: 'assignment_id,student_id' }
        )
        .select()
        .maybeSingle()

      if (error) throw error

      await createNotification({
        user_id: assignment.created_by,
        course_id: assignment.course_id,
        type: 'submission',
        title: 'New submission received',
        body: `A learner submitted work for ${assignment.title}.`,
      })

      return res.status(201).json({
        ...data,
        status: computeSubmissionStatus(assignment, data),
      })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    return respondWithError(res, err)
  }
}
