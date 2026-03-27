const {
  computeSubmissionStatus,
  createCourseNotifications,
  ensureCourseAccess,
  fetchProfilesByIds,
  getSupabase,
  requireUserId,
  respondWithError,
} = require('./_lms')

module.exports = async (req, res) => {
  try {
    const courseId = req.params?.id
    const userId = requireUserId(req)

    if (!courseId) return res.status(400).json({ error: 'course id required' })

    if (req.method === 'GET') {
      const access = await ensureCourseAccess(courseId, userId)
      const db = getSupabase()

      const { data: assignments, error: assignmentError } = await db
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .eq('kind', 'assignment')
        .order('due_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (assignmentError) throw assignmentError

      const visibleAssignments = access.isTeacher
        ? assignments || []
        : (assignments || []).filter((item) => item.status === 'published')

      const assignmentIds = visibleAssignments.map((item) => item.id)
      const moduleIds = visibleAssignments.map((item) => item.module_id).filter(Boolean)
      const createdByIds = visibleAssignments.map((item) => item.created_by).filter(Boolean)

      const [{ data: modules, error: modulesError }, { data: submissions, error: submissionsError }, profileMap] =
        await Promise.all([
          moduleIds.length
            ? db.from('course_modules').select('id, title').in('id', moduleIds)
            : Promise.resolve({ data: [], error: null }),
          assignmentIds.length
            ? access.isTeacher
              ? db.from('submissions').select('id, assignment_id, student_id, status, submitted_at, graded_at, score').in('assignment_id', assignmentIds)
              : db.from('submissions').select('*').in('assignment_id', assignmentIds).eq('student_id', userId)
            : Promise.resolve({ data: [], error: null }),
          fetchProfilesByIds(createdByIds),
        ])

      if (modulesError) throw modulesError
      if (submissionsError) throw submissionsError

      const moduleMap = new Map((modules || []).map((item) => [item.id, item.title]))
      const submissionsByAssignment = new Map()
      ;(submissions || []).forEach((submission) => {
        if (!submissionsByAssignment.has(submission.assignment_id)) {
          submissionsByAssignment.set(submission.assignment_id, [])
        }
        submissionsByAssignment.get(submission.assignment_id).push(submission)
      })

      const payload = visibleAssignments.map((assignment) => {
        const rows = submissionsByAssignment.get(assignment.id) || []
        const studentSubmission = access.isTeacher ? null : rows[0] || null

        return {
          ...assignment,
          module_title: assignment.module_id ? moduleMap.get(assignment.module_id) || null : null,
          created_by_name: profileMap[assignment.created_by]?.display_name || null,
          submission: studentSubmission
            ? {
                ...studentSubmission,
                status: computeSubmissionStatus(assignment, studentSubmission),
              }
            : null,
          submission_count: rows.length,
          pending_review_count: rows.filter((row) => row.submitted_at && !row.graded_at).length,
          status_for_user: computeSubmissionStatus(assignment, studentSubmission),
        }
      })

      return res.status(200).json(payload)
    }

    if (req.method === 'POST') {
      const access = await ensureCourseAccess(courseId, userId, { teacherOnly: true })
      const body = req.body || {}
      if (!body.title) return res.status(400).json({ error: 'title required' })

      const { data, error } = await getSupabase()
        .from('assignments')
        .insert([
          {
            course_id: courseId,
            module_id: body.module_id || null,
            kind: 'assignment',
            title: body.title,
            instructions: body.instructions || null,
            status: body.status || 'draft',
            due_at: body.due_at || null,
            attachment_url: body.attachment_url || null,
            link_url: body.link_url || null,
            created_by: userId,
          },
        ])
        .select()
        .maybeSingle()

      if (error) throw error

      if (data.status === 'published') {
        await createCourseNotifications(
          courseId,
          `New assignment in ${access.course.title}`,
          `${data.title}${data.due_at ? ` is due on ${new Date(data.due_at).toLocaleString()}` : ' is now available.'}`,
          'assignment'
        )
      }

      return res.status(201).json(data)
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    return respondWithError(res, err)
  }
}
