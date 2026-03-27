const {
  computeSubmissionStatus,
  getSupabase,
  listAccessibleCourseIds,
  requireUserId,
  respondWithError,
} = require('./_lms')

module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).end('Method Not Allowed')
    }

    const userId = requireUserId(req)
    const db = getSupabase()

    const [{ data: teachingCourses, error: teachingError }, accessibleCourseIds] = await Promise.all([
      db.from('courses').select('id').eq('author', userId),
      listAccessibleCourseIds(userId),
    ])

    if (teachingError) throw teachingError
    if (accessibleCourseIds.length === 0) return res.status(200).json([])

    const teacherCourseIds = new Set((teachingCourses || []).map((item) => item.id))
    const { data: assignments, error: assignmentError } = await db
      .from('assignments')
      .select('id, course_id, title, due_at, status, kind')
      .in('course_id', accessibleCourseIds)
      .order('due_at', { ascending: true, nullsFirst: false })

    if (assignmentError) throw assignmentError

    const visibleAssignments = (assignments || []).filter((item) =>
      teacherCourseIds.has(item.course_id) ? true : item.status === 'published'
    )

    const assignmentIds = visibleAssignments.map((item) => item.id)
    const courseIds = [...new Set(visibleAssignments.map((item) => item.course_id))]

    const [{ data: courses, error: coursesError }, { data: submissions, error: submissionsError }] = await Promise.all([
      db.from('courses').select('id, title').in('id', courseIds),
      assignmentIds.length
        ? db.from('submissions').select('*').in('assignment_id', assignmentIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (coursesError) throw coursesError
    if (submissionsError) throw submissionsError

    const courseMap = new Map((courses || []).map((course) => [course.id, course.title]))
    const submissionsByAssignment = new Map()
    ;(submissions || []).forEach((submission) => {
      if (!submissionsByAssignment.has(submission.assignment_id)) {
        submissionsByAssignment.set(submission.assignment_id, [])
      }
      submissionsByAssignment.get(submission.assignment_id).push(submission)
    })

    const payload = visibleAssignments.map((assignment) => {
      const isTeacher = teacherCourseIds.has(assignment.course_id)
      const rows = submissionsByAssignment.get(assignment.id) || []
      const studentSubmission = rows.find((row) => String(row.student_id) === String(userId)) || null

      return {
        id: assignment.id,
        title: assignment.title,
        course_id: assignment.course_id,
        course_title: courseMap.get(assignment.course_id) || 'Course',
        due_at: assignment.due_at,
        kind: assignment.kind,
        is_teacher_view: isTeacher,
        status: isTeacher
          ? rows.some((row) => row.submitted_at && !row.graded_at)
            ? 'review'
            : assignment.status
          : computeSubmissionStatus(assignment, studentSubmission),
        submission_id: studentSubmission?.id || null,
        submission_score: studentSubmission?.score ?? null,
        pending_review_count: rows.filter((row) => row.submitted_at && !row.graded_at).length,
      }
    })

    return res.status(200).json(payload)
  } catch (err) {
    return respondWithError(res, err)
  }
}
