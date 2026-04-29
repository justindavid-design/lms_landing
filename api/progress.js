const {
  ensureCourseAccess,
  getSupabase,
  requireUserId,
} = require('./_lms')

/**
 * GET /api/progress - Get student progress for a course
 * Query params:
 *   - course_id (required): UUID of the course
 *   - student_id (optional): UUID of the student (for teachers viewing student progress)
 *
 * Returns:
 *   {
 *     course_id: string,
 *     student_id: string,
 *     completed_assignments: number,
 *     total_assignments: number,
 *     completed_quizzes: number,
 *     total_quizzes: number,
 *     pending_assignments: number,
 *     overdue_assignments: number,
 *     assignment_scores: [{ id, title, score, total_points }],
 *     quiz_scores: [{ id, title, score, total_points }],
 *     course_completion_percentage: number,
 *     last_activity: ISO timestamp,
 *   }
 */
module.exports = async (req, res) => {
  try {
    const userId = requireUserId(req)
    const courseId = req.query?.course_id
    const studentIdParam = req.query?.student_id

    if (!courseId) {
      return res.status(400).json({ error: 'course_id query parameter is required' })
    }

    // Check course access
    const access = await ensureCourseAccess(courseId, userId)

    // Determine which student we're looking at
    let targetStudentId = userId
    if (studentIdParam) {
      // Teachers can view other students' progress
      if (!access.isTeacher) {
        return res.status(403).json({ error: 'only teachers can view other students progress' })
      }
      targetStudentId = studentIdParam
    }

    const db = getSupabase()

    // Get all assignments for the course
    const { data: assignments, error: assignError } = await db
      .from('assignments')
      .select('id, title, kind, due_at, status')
      .eq('course_id', courseId)
      .eq('status', 'published')

    if (assignError) throw assignError

    // Separate assignments and quizzes
    const regularAssignments = (assignments || []).filter(a => a.kind === 'assignment')
    const quizAssignments = (assignments || []).filter(a => a.kind === 'quiz')

    const now = new Date().toISOString()

    // Get submissions for this student for regular assignments
    const { data: submissions, error: submissionsError } = await db
      .from('submissions')
      .select('assignment_id, score, status, submitted_at, graded_at')
      .eq('student_id', targetStudentId)
      .in(
        'assignment_id',
        regularAssignments.length > 0 ? regularAssignments.map(a => a.id) : ['']
      )

    if (submissionsError) throw submissionsError

    // Get quiz submissions (quizzes submitted through assignments)
    const { data: quizSubmissions, error: quizSubError } = await db
      .from('submissions')
      .select('assignment_id, score, status, submitted_at, graded_at')
      .eq('student_id', targetStudentId)
      .in('assignment_id', quizAssignments.length > 0 ? quizAssignments.map(a => a.id) : [''])

    if (quizSubError) throw quizSubError

    // Calculate metrics
    const submissionMap = new Map((submissions || []).map(s => [s.assignment_id, s]))
    const quizSubmissionMap = new Map((quizSubmissions || []).map(s => [s.assignment_id, s]))

    // Assignment metrics
    const completedAssignments = (submissions || []).filter(
      s => s.status === 'submitted' || s.status === 'graded' || s.status === 'late'
    ).length
    const totalAssignments = regularAssignments.length

    // Quiz metrics
    const completedQuizzes = (quizSubmissions || []).filter(
      s => s.status === 'submitted' || s.status === 'graded' || s.status === 'late'
    ).length
    const totalQuizzes = quizAssignments.length

    // Pending and overdue
    const pendingAssignments = regularAssignments.filter(a => {
      const submission = submissionMap.get(a.id)
      return !submission || (submission.status !== 'submitted' && submission.status !== 'graded' && submission.status !== 'late')
    }).length

    const overdueAssignments = regularAssignments.filter(a => {
      if (!a.due_at) return false
      if (new Date(a.due_at) > new Date(now)) return false

      const submission = submissionMap.get(a.id)
      return !submission || (submission.status !== 'submitted' && submission.status !== 'graded' && submission.status !== 'late')
    }).length

    // Course completion percentage
    const totalWork = totalAssignments + totalQuizzes
    const completedWork = completedAssignments + completedQuizzes
    const completionPercentage = totalWork > 0 ? Math.round((completedWork / totalWork) * 100) : 0

    // Get detailed scores
    const assignmentScores = regularAssignments.map(a => {
      const submission = submissionMap.get(a.id)
      return {
        id: a.id,
        title: a.title,
        score: submission?.score || null,
        status: submission?.status || 'not_started',
        submitted_at: submission?.submitted_at || null,
        graded_at: submission?.graded_at || null,
      }
    })

    const quizScores = quizAssignments.map(a => {
      const submission = quizSubmissionMap.get(a.id)
      return {
        id: a.id,
        title: a.title,
        score: submission?.score || null,
        status: submission?.status || 'not_started',
        submitted_at: submission?.submitted_at || null,
        graded_at: submission?.graded_at || null,
      }
    })

    // Get last activity
    const allSubmissions = [...(submissions || []), ...(quizSubmissions || [])]
    const lastActivity =
      allSubmissions.length > 0 ? new Date(Math.max(...allSubmissions.map(s => new Date(s.submitted_at || s.graded_at || 0)))) : null

    return res.status(200).json({
      course_id: courseId,
      student_id: targetStudentId,
      completed_assignments: completedAssignments,
      total_assignments: totalAssignments,
      completed_quizzes: completedQuizzes,
      total_quizzes: totalQuizzes,
      pending_assignments: pendingAssignments,
      overdue_assignments: overdueAssignments,
      course_completion_percentage: completionPercentage,
      assignment_scores: assignmentScores,
      quiz_scores: quizScores,
      last_activity: lastActivity?.toISOString() || null,
    })
  } catch (error) {
    console.error('Progress endpoint error:', error)
    return res.status(500).json({ error: error.message || 'Failed to fetch progress' })
  }
}
