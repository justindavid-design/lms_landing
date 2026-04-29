const {
  computeSubmissionStatus,
  createCourseNotifications,
  ensureCourseAccess,
  getQuery,
  getSupabase,
  requireUserId,
  respondWithError,
} = require('./_lms')

function normalizeQuizQuestions(value) {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => ({
        id: item.id || `question-${index + 1}`,
        text: String(item.text || '').trim(),
        options: Array.isArray(item.options) ? item.options.map((opt) => String(opt || '').trim()) : [],
        correct: Number.isInteger(item.correct) ? item.correct : 0,
      }))
      .filter((item) => item.text)
  }

  return String(value || '')
    .split('\n')
    .map((line, index) => ({
      id: `question-${index + 1}`,
      text: line.trim(),
      options: [],
      correct: 0,
    }))
    .filter((item) => item.text)
}

module.exports = async (req, res) => {
  try {
    const userId = requireUserId(req)
    const courseId = req.params?.id || getQuery(req, 'courseId')

    if (!courseId) return res.status(400).json({ error: 'course id required' })

    if (req.method === 'GET') {
      const access = await ensureCourseAccess(courseId, userId)
      const db = getSupabase()

      const { data: quizzes, error: quizError } = await db
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })

      if (quizError) throw quizError

      const quizIds = (quizzes || []).map((item) => item.id)
      const { data: assignmentRows, error: assignmentError } = quizIds.length
        ? await db.from('assignments').select('*').in('quiz_id', quizIds).eq('kind', 'quiz')
        : { data: [], error: null }

      if (assignmentError) throw assignmentError

      const assignmentMap = new Map((assignmentRows || []).map((item) => [item.quiz_id, item]))
      const visibleAssignments = (assignmentRows || []).filter((item) =>
        access.isTeacher ? true : item.status === 'published'
      )

      const assignmentIds = visibleAssignments.map((item) => item.id)
      const { data: submissions, error: submissionsError } = assignmentIds.length
        ? access.isTeacher
          ? await db.from('submissions').select('id, assignment_id, student_id, status, submitted_at, graded_at, score').in('assignment_id', assignmentIds)
          : await db.from('submissions').select('*').in('assignment_id', assignmentIds).eq('student_id', userId)
        : { data: [], error: null }

      if (submissionsError) throw submissionsError

      const submissionsByAssignment = new Map()
      ;(submissions || []).forEach((submission) => {
        if (!submissionsByAssignment.has(submission.assignment_id)) {
          submissionsByAssignment.set(submission.assignment_id, [])
        }
        submissionsByAssignment.get(submission.assignment_id).push(submission)
      })

      const payload = (quizzes || [])
        .map((quiz) => {
          const assignment = assignmentMap.get(quiz.id)
          if (!assignment) return null
          if (!access.isTeacher && assignment.status !== 'published') return null

          const rows = submissionsByAssignment.get(assignment.id) || []
          const studentSubmission = access.isTeacher ? null : rows[0] || null

          return {
            ...quiz,
            assignment_id: assignment.id,
            instructions: assignment.instructions || quiz.description || null,
            due_at: assignment.due_at || null,
            status: assignment.status,
            question_count: normalizeQuizQuestions(quiz.meta?.questions).length,
            pending_review_count: rows.filter((row) => row.submitted_at && !row.graded_at).length,
            submission_count: rows.length,
            submission: studentSubmission
              ? {
                  ...studentSubmission,
                  status: computeSubmissionStatus(assignment, studentSubmission),
                }
              : null,
            status_for_user: computeSubmissionStatus(assignment, studentSubmission),
          }
        })
        .filter(Boolean)

      return res.status(200).json(payload)
    }

    if (req.method === 'POST') {
      const access = await ensureCourseAccess(courseId, userId, { teacherOnly: true })
      const body = req.body || {}

      if (!body.title) return res.status(400).json({ error: 'title required' })

      const normalizedQuestions = normalizeQuizQuestions(body.questions)

      const quizPayload = {
        course_id: courseId,
        title: body.title,
        description: body.description || null,
        published: body.status === 'published',
        meta: {
          questions: normalizedQuestions,
        },
      }

      const { data: quiz, error: quizInsertError } = await getSupabase()
        .from('quizzes')
        .insert([quizPayload])
        .select()
        .maybeSingle()

      if (quizInsertError) throw quizInsertError

      const { data: assignment, error: assignmentError } = await getSupabase()
        .from('assignments')
        .insert([
          {
            course_id: courseId,
            quiz_id: quiz.id,
            kind: 'quiz',
            title: body.title,
            instructions: body.instructions || body.description || null,
            status: body.status || 'draft',
            due_at: body.due_at || null,
            created_by: userId,
          },
        ])
        .select()
        .maybeSingle()

      if (assignmentError) throw assignmentError

      if (assignment.status === 'published') {
        await createCourseNotifications(
          courseId,
          `Quiz posted in ${access.course.title}`,
          `${quiz.title}${assignment.due_at ? ` is due on ${new Date(assignment.due_at).toLocaleString()}` : ' is ready to take.'}`,
          'quiz'
        )
      }

      return res.status(201).json({
        ...quiz,
        assignment_id: assignment.id,
        due_at: assignment.due_at,
        status: assignment.status,
        question_count: normalizedQuestions.length,
      })
    }

    if (req.method === 'PATCH') {
      const access = await ensureCourseAccess(courseId, userId, { teacherOnly: true })
      const body = req.body || {}
      if (!body.quiz_id || !body.assignment_id) return res.status(400).json({ error: 'quiz_id and assignment_id required' })

      const normalizedQuestions = normalizeQuizQuestions(body.questions)

      const quizUpdates = {
        title: body.title,
        description: body.description,
        published: body.status === 'published',
        meta: {
          questions: normalizedQuestions,
        },
      }

      Object.keys(quizUpdates).forEach((key) => quizUpdates[key] === undefined && delete quizUpdates[key])

      const { data: updatedQuiz, error: quizError } = await getSupabase()
        .from('quizzes')
        .update(quizUpdates)
        .eq('id', body.quiz_id)
        .eq('course_id', courseId)
        .select()
        .maybeSingle()

      if (quizError) throw quizError
      if (!updatedQuiz) return res.status(404).json({ error: 'quiz not found' })

      const assignmentUpdates = {
        title: body.title,
        instructions: body.instructions || body.description || null,
        status: body.status,
        due_at: body.due_at,
      }

      Object.keys(assignmentUpdates).forEach((key) => assignmentUpdates[key] === undefined && delete assignmentUpdates[key])

      const { data: updatedAssignment, error: assignmentError } = await getSupabase()
        .from('assignments')
        .update(assignmentUpdates)
        .eq('id', body.assignment_id)
        .eq('course_id', courseId)
        .select()
        .maybeSingle()

      if (assignmentError) throw assignmentError
      if (!updatedAssignment) return res.status(404).json({ error: 'assignment not found' })

      return res.status(200).json({
        ...updatedQuiz,
        assignment_id: updatedAssignment.id,
        due_at: updatedAssignment.due_at,
        status: updatedAssignment.status,
        question_count: normalizedQuestions.length,
      })
    }

    if (req.method === 'DELETE') {
      await ensureCourseAccess(courseId, userId, { teacherOnly: true })
      const body = req.body || {}
      if (!body.quiz_id || !body.assignment_id) return res.status(400).json({ error: 'quiz_id and assignment_id required' })

      const { data: deletedAssignment, error: assignmentError } = await getSupabase()
        .from('assignments')
        .delete()
        .eq('id', body.assignment_id)
        .eq('course_id', courseId)
        .eq('kind', 'quiz')
        .select()
        .maybeSingle()

      if (assignmentError) throw assignmentError
      if (!deletedAssignment) return res.status(404).json({ error: 'assignment not found' })

      const { data: deletedQuiz, error: quizError } = await getSupabase()
        .from('quizzes')
        .delete()
        .eq('id', body.quiz_id)
        .eq('course_id', courseId)
        .select()
        .maybeSingle()

      if (quizError) throw quizError

      return res.status(200).json({ ok: true, deleted: { quiz: deletedQuiz, assignment: deletedAssignment } })
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    return respondWithError(res, err)
  }
}
