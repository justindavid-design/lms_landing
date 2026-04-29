/**
 * Event handlers for automatic notification creation
 * Integrates with course.js, assignments.js, quizzes.js, and submissions.js
 * to automatically create notifications when events occur
 */

const { getSupabase, createNotification, ensureCourseAccess } = require('./_lms')

/**
 * Send notification to all students enrolled in a course
 * Used for course-wide announcements and updates
 */
async function notifyAllCourseStudents(courseId, notificationData) {
  try {
    const db = getSupabase()

    // Get all students enrolled in the course
    const { data: enrollments, error: enrollError } = await db
      .from('enrollments')
      .select('student_id')
      .eq('course_id', courseId)

    if (enrollError) throw enrollError
    if (!enrollments || enrollments.length === 0) return []

    // Create notification for each student
    const notifications = await Promise.all(
      enrollments.map(enrollment =>
        createNotification({
          user_id: enrollment.student_id,
          course_id: courseId,
          type: notificationData.type || 'general',
          title: notificationData.title,
          body: notificationData.body || null,
        })
      )
    )

    return notifications
  } catch (err) {
    console.error('Error notifying course students:', err)
    return []
  }
}

/**
 * Notify student about new assignment
 */
async function notifyAssignmentCreated(assignmentId, assignmentData, courseId) {
  try {
    const db = getSupabase()

    // Get all students enrolled in the course
    const { data: enrollments, error } = await db
      .from('enrollments')
      .select('student_id')
      .eq('course_id', courseId)

    if (error) throw error
    if (!enrollments || enrollments.length === 0) return

    const dueDate = assignmentData.due_at
      ? new Date(assignmentData.due_at).toLocaleDateString()
      : 'No specific due date'

    // Create notification for each student
    await Promise.all(
      enrollments.map(enrollment =>
        createNotification({
          user_id: enrollment.student_id,
          course_id: courseId,
          type: 'assignment',
          title: `New Assignment: ${assignmentData.title}`,
          body: `Due: ${dueDate}. ${assignmentData.instructions?.substring(0, 100) || 'Check the assignment details.'}`,
        })
      )
    )
  } catch (err) {
    console.error('Error notifying about new assignment:', err)
  }
}

/**
 * Notify student about quiz due soon
 */
async function notifyQuizCreated(quizId, quizData, courseId) {
  try {
    const db = getSupabase()

    // Get all students enrolled in the course
    const { data: enrollments, error } = await db
      .from('enrollments')
      .select('student_id')
      .eq('course_id', courseId)

    if (error) throw error
    if (!enrollments || enrollments.length === 0) return

    // Create notification for each student
    await Promise.all(
      enrollments.map(enrollment =>
        createNotification({
          user_id: enrollment.student_id,
          course_id: courseId,
          type: 'quiz',
          title: `Quiz Available: ${quizData.title}`,
          body: quizData.description?.substring(0, 100) || 'A new quiz is available for this course.',
        })
      )
    )
  } catch (err) {
    console.error('Error notifying about new quiz:', err)
  }
}

/**
 * Notify student when their submission is graded
 */
async function notifySubmissionGraded(submission, assignmentData) {
  try {
    await createNotification({
      user_id: submission.student_id,
      course_id: assignmentData.course_id,
      type: 'submission',
      title: `Submission Graded: ${assignmentData.title}`,
      body: submission.feedback
        ? submission.feedback.substring(0, 100)
        : `Your submission received a score of ${submission.score}. ${submission.feedback ? 'See feedback for details.' : ''}`,
    })
  } catch (err) {
    console.error('Error notifying about graded submission:', err)
  }
}

/**
 * Notify all students about course update/announcement
 */
async function notifyCourseUpdate(courseId, courseTitle, updateType = 'module') {
  try {
    const db = getSupabase()

    // Get all students enrolled in the course
    const { data: enrollments, error } = await db
      .from('enrollments')
      .select('student_id')
      .eq('course_id', courseId)

    if (error) throw error
    if (!enrollments || enrollments.length === 0) return

    // Create notification for each student
    await Promise.all(
      enrollments.map(enrollment =>
        createNotification({
          user_id: enrollment.student_id,
          course_id: courseId,
          type: 'course_update',
          title: `Course Update: ${courseTitle}`,
          body: `A new ${updateType} has been added to this course. Check it out!`,
        })
      )
    )
  } catch (err) {
    console.error('Error notifying about course update:', err)
  }
}

/**
 * Notify all course members about announcement
 */
async function notifyAnnouncement(courseId, announcementData) {
  try {
    const db = getSupabase()

    // Get all members (students and teachers) enrolled in the course
    const { data: enrollments, error } = await db
      .from('enrollments')
      .select('student_id')
      .eq('course_id', courseId)

    if (error) throw error
    if (!enrollments || enrollments.length === 0) return

    // Create notification for each member
    await Promise.all(
      enrollments.map(enrollment =>
        createNotification({
          user_id: enrollment.student_id,
          course_id: courseId,
          type: 'announcement',
          title: `Course Announcement: ${announcementData.title}`,
          body: announcementData.content?.substring(0, 150) || 'A new announcement has been posted.',
        })
      )
    )
  } catch (err) {
    console.error('Error notifying about announcement:', err)
  }
}

/**
 * Notify student about upcoming deadline (called by background job or cron)
 */
async function notifyUpcomingDeadline(assignmentId, studentId, timeUntilDue) {
  try {
    const db = getSupabase()

    // Get assignment details
    const { data: assignment, error } = await db
      .from('assignments')
      .select('*, courses(title)')
      .eq('id', assignmentId)
      .single()

    if (error) throw error
    if (!assignment) return

    const hoursUntilDue = Math.round(timeUntilDue / 3600000)

    await createNotification({
      user_id: studentId,
      course_id: assignment.course_id,
      type: 'assignment',
      title: `Assignment Due Soon: ${assignment.title}`,
      body: `This assignment is due in ${hoursUntilDue} hours. Submit your work now!`,
    })
  } catch (err) {
    console.error('Error notifying about upcoming deadline:', err)
  }
}

module.exports = {
  notifyAllCourseStudents,
  notifyAssignmentCreated,
  notifyQuizCreated,
  notifySubmissionGraded,
  notifyCourseUpdate,
  notifyAnnouncement,
  notifyUpcomingDeadline,
}
