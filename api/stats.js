const {
  getSupabase,
  listAccessibleCourseIds,
  requireUserId,
  respondWithError,
} = require('./_lms')

module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const userId = requireUserId(req)
    const db = getSupabase()

    const [{ data: teachingCourses, error: teachingError }, courseIds] = await Promise.all([
      db.from('courses').select('id').eq('author', userId),
      listAccessibleCourseIds(userId),
    ])

    if (teachingError) throw teachingError
    if (courseIds.length === 0) {
      return res.status(200).json({
        metrics: { activeUsers: 0, totalCourses: 0, avgScore: null, dueSoon: 0, pendingReviews: 0 },
        series: Array(7).fill(0),
      })
    }

    const teacherCourseIds = (teachingCourses || []).map((course) => course.id)

    const [{ data: assignments, error: assignmentsError }, { data: submissions, error: submissionsError }, { data: enrollments, error: enrollmentsError }] =
      await Promise.all([
        db.from('assignments').select('id, course_id, due_at').in('course_id', courseIds),
        db.from('submissions').select('assignment_id, student_id, score, graded_at, submitted_at'),
        teacherCourseIds.length
          ? db.from('enrollments').select('course_id, user_id').in('course_id', teacherCourseIds)
          : Promise.resolve({ data: [], error: null }),
      ])

    if (assignmentsError) throw assignmentsError
    if (submissionsError) throw submissionsError
    if (enrollmentsError) throw enrollmentsError

    const now = Date.now()
    const assignmentIds = new Set((assignments || []).map((item) => item.id))
    const relevantSubmissions = (submissions || []).filter((item) => assignmentIds.has(item.assignment_id))
    const studentScores = relevantSubmissions
      .filter((item) => String(item.student_id) === String(userId) && item.score != null)
      .map((item) => Number(item.score))
    const avgScore = studentScores.length
      ? Math.round(studentScores.reduce((sum, value) => sum + value, 0) / studentScores.length)
      : null

    const dueSoon = (assignments || []).filter((item) => {
      if (!item.due_at) return false
      const dueTime = new Date(item.due_at).getTime()
      return dueTime >= now && dueTime <= now + 7 * 24 * 60 * 60 * 1000
    }).length

    const pendingReviews = relevantSubmissions.filter((item) => item.submitted_at && !item.graded_at).length
    const activeUsers = new Set((enrollments || []).map((item) => item.user_id)).size

    const series = Array.from({ length: 7 }, (_, index) => {
      const start = new Date()
      start.setDate(start.getDate() - (6 - index))
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setHours(23, 59, 59, 999)

      return (assignments || []).filter((item) => {
        if (!item.due_at) return false
        const dueTime = new Date(item.due_at).getTime()
        return dueTime >= start.getTime() && dueTime <= end.getTime()
      }).length
    })

    return res.status(200).json({
      metrics: {
        activeUsers,
        totalCourses: courseIds.length,
        avgScore,
        dueSoon,
        pendingReviews,
      },
      series,
    })
  } catch (err) {
    return respondWithError(res, err)
  }
}
