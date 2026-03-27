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
    const courseIds = await listAccessibleCourseIds(userId)

    if (courseIds.length === 0) return res.status(200).json([])

    const [{ data: courses, error: coursesError }, { data: assignments, error: assignmentsError }, { data: submissions, error: submissionsError }] =
      await Promise.all([
        db.from('courses').select('id, title, author').in('id', courseIds),
        db.from('assignments')
          .select('id, course_id, title, due_at, status, kind')
          .in('course_id', courseIds)
          .not('due_at', 'is', null)
          .order('due_at', { ascending: true }),
        db.from('submissions').select('assignment_id, student_id, status, submitted_at, graded_at, score'),
      ])

    if (coursesError) throw coursesError
    if (assignmentsError) throw assignmentsError
    if (submissionsError) throw submissionsError

    const courseMap = new Map((courses || []).map((course) => [course.id, course]))
    const submissionsByAssignment = new Map()
    ;(submissions || []).forEach((submission) => {
      if (!submissionsByAssignment.has(submission.assignment_id)) {
        submissionsByAssignment.set(submission.assignment_id, [])
      }
      submissionsByAssignment.get(submission.assignment_id).push(submission)
    })

    const payload = (assignments || [])
      .filter((assignment) => {
        const course = courseMap.get(assignment.course_id)
        return course && (String(course.author) === String(userId) || assignment.status === 'published')
      })
      .map((assignment) => {
        const course = courseMap.get(assignment.course_id)
        const studentSubmission = (submissionsByAssignment.get(assignment.id) || []).find(
          (submission) => String(submission.student_id) === String(userId)
        )

        return {
          id: assignment.id,
          title: assignment.title,
          date: assignment.due_at,
          course_id: assignment.course_id,
          course_title: course?.title || 'Course',
          kind: assignment.kind,
          status: String(course?.author) === String(userId)
            ? assignment.status
            : computeSubmissionStatus(assignment, studentSubmission),
        }
      })

    return res.status(200).json(payload)
  } catch (err) {
    return respondWithError(res, err)
  }
}
