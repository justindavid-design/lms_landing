/**
 * EXAMPLE INTEGRATION - Course Assignments with Notifications
 * 
 * This file demonstrates how to integrate the notification system
 * into an existing API endpoint. Copy this pattern to:
 * - api/course-quizzes.js
 * - api/submissions.js
 * - api/course-modules.js
 * 
 * The integration is minimal and non-intrusive - if notifications fail,
 * the main operation continues successfully.
 */

const {
  createNotification,
  ensureCourseAccess,
  getQuery,
  getSupabase,
  requireUserId,
  respondWithError,
} = require('./_lms')

// 👇 ADD THIS IMPORT at the top of your API file
const { notifyAssignmentCreated } = require('./notification-events')

module.exports = async (req, res) => {
  try {
    const db = getSupabase()
    const userId = requireUserId(req)
    const courseId = getQuery(req, 'course_id')

    // GET: Fetch assignments
    if (req.method === 'GET') {
      await ensureCourseAccess(courseId, userId)

      const { data, error } = await db
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return res.status(200).json(data || [])
    }

    // POST: Create new assignment
    // 👇 THIS IS WHERE YOU ADD NOTIFICATION SUPPORT
    if (req.method === 'POST') {
      // Only teachers can create assignments
      await ensureCourseAccess(courseId, userId, { teacherOnly: true })

      const body = req.body || {}
      if (!body.title) return res.status(400).json({ error: 'title required' })

      const assignmentData = {
        course_id: courseId,
        title: body.title,
        instructions: body.instructions || null,
        due_at: body.due_at || null,
        attachment_url: body.attachment_url || null,
        link_url: body.link_url || null,
        status: body.status || 'draft',
        created_by: userId,
      }

      // Create the assignment
      const { data: createdAssignment, error } = await db
        .from('assignments')
        .insert([assignmentData])
        .select()
        .single()

      if (error) throw error

      // 👇 ADD THIS BLOCK - Send notifications to all enrolled students
      try {
        await notifyAssignmentCreated(
          createdAssignment.id,
          createdAssignment,
          courseId
        )
      } catch (notifyErr) {
        // Log the error but don't fail the request
        // The assignment was created successfully, notifications are secondary
        console.error('Failed to send assignment notifications:', notifyErr)
      }

      return res.status(201).json(createdAssignment)
    }

    // PATCH: Update assignment
    if (req.method === 'PATCH') {
      const body = req.body || {}
      if (!body.id) return res.status(400).json({ error: 'id required' })

      await ensureCourseAccess(courseId, userId, { teacherOnly: true })

      const { data: updated, error } = await db
        .from('assignments')
        .update({
          title: body.title,
          instructions: body.instructions,
          due_at: body.due_at,
          status: body.status,
          attachment_url: body.attachment_url,
          link_url: body.link_url,
        })
        .eq('id', body.id)
        .eq('course_id', courseId)
        .select()
        .single()

      if (error) throw error
      if (!updated) return res.status(404).json({ error: 'not found' })

      return res.status(200).json(updated)
    }

    // DELETE: Remove assignment
    if (req.method === 'DELETE') {
      const body = req.body || {}
      if (!body.id) return res.status(400).json({ error: 'id required' })

      await ensureCourseAccess(courseId, userId, { teacherOnly: true })

      const { data, error } = await db
        .from('assignments')
        .delete()
        .eq('id', body.id)
        .eq('course_id', courseId)
        .select()
        .single()

      if (error) throw error
      if (!data) return res.status(404).json({ error: 'not found' })

      return res.status(200).json({ ok: true, removed: data })
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    return respondWithError(res, err)
  }
}

/**
 * INTEGRATION CHECKLIST:
 * 
 * ✅ 1. Add import at top:
 *      const { notifyAssignmentCreated } = require('./notification-events')
 * 
 * ✅ 2. In POST handler (after creating assignment):
 *      try {
 *        await notifyAssignmentCreated(data.id, data, courseId)
 *      } catch (notifyErr) {
 *        console.error('Failed to send notifications:', notifyErr)
 *      }
 * 
 * ✅ 3. Wrap in try/catch - notifications should never block main operation
 * 
 * ✅ 4. Test by creating assignment as teacher, check notifications as student
 * 
 * 
 * SIMILAR PATTERNS FOR OTHER ENDPOINTS:
 * 
 * For course-quizzes.js POST:
 * const { notifyQuizCreated } = require('./notification-events')
 * await notifyQuizCreated(data.id, data, courseId)
 * 
 * For submissions.js PATCH (when grading):
 * const { notifySubmissionGraded } = require('./notification-events')
 * const assignment = await getAssignment(submissionData.assignment_id)
 * await notifySubmissionGraded(submissionData, assignment)
 * 
 * For course-modules.js POST:
 * const { notifyCourseUpdate } = require('./notification-events')
 * const course = await getCourse(courseId)
 * await notifyCourseUpdate(courseId, course.title, 'module')
 */
