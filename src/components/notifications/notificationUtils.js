/**
 * Notification utilities and helpers
 * Handles notification creation, formatting, and management
 */

/**
 * Notification types supported by the LMS
 */
export const NOTIFICATION_TYPES = {
  ASSIGNMENT: 'assignment',
  QUIZ: 'quiz',
  SUBMISSION: 'submission', // When a submission is graded
  ANNOUNCEMENT: 'announcement', // Course announcement
  COURSE_UPDATE: 'course_update', // Course content/module update
  GENERAL: 'general',
}

/**
 * Create notification payload for new assignment
 */
export const createAssignmentNotification = (assignment, courseId) => ({
  course_id: courseId,
  type: NOTIFICATION_TYPES.ASSIGNMENT,
  title: `New Assignment: ${assignment.title}`,
  body: assignment.instructions
    ? assignment.instructions.substring(0, 150)
    : 'Check the assignment details and due date.',
})

/**
 * Create notification payload for quiz due soon
 */
export const createQuizNotification = (quiz, courseId) => ({
  course_id: courseId,
  type: NOTIFICATION_TYPES.QUIZ,
  title: `Quiz Due Soon: ${quiz.title}`,
  body: quiz.description
    ? quiz.description.substring(0, 150)
    : 'Complete this quiz before the deadline.',
})

/**
 * Create notification payload for submission graded
 */
export const createSubmissionNotification = (submission, assignment) => ({
  course_id: assignment.course_id,
  type: NOTIFICATION_TYPES.SUBMISSION,
  title: `Submission Graded: ${assignment.title}`,
  body: submission.feedback
    ? submission.feedback.substring(0, 150)
    : `Your submission received a score of ${submission.score}.`,
})

/**
 * Create notification payload for course announcement
 */
export const createAnnouncementNotification = (announcement, courseId) => ({
  course_id: courseId,
  type: NOTIFICATION_TYPES.ANNOUNCEMENT,
  title: `Course Announcement: ${announcement.title}`,
  body: announcement.content
    ? announcement.content.substring(0, 150)
    : 'Check the course for important updates.',
})

/**
 * Create notification payload for course update
 */
export const createCourseUpdateNotification = (courseTitle, updateType) => ({
  type: NOTIFICATION_TYPES.COURSE_UPDATE,
  title: `Course Update: ${courseTitle}`,
  body: `A ${updateType} has been added to this course.`,
})

/**
 * Get user-friendly display name for notification type
 */
export const getNotificationTypeLabel = (type) => {
  const labels = {
    [NOTIFICATION_TYPES.ASSIGNMENT]: 'New Assignment',
    [NOTIFICATION_TYPES.QUIZ]: 'Quiz Due Soon',
    [NOTIFICATION_TYPES.SUBMISSION]: 'Submission Graded',
    [NOTIFICATION_TYPES.ANNOUNCEMENT]: 'Course Announcement',
    [NOTIFICATION_TYPES.COURSE_UPDATE]: 'Course Update',
    [NOTIFICATION_TYPES.GENERAL]: 'Notification',
  }
  return labels[type] || 'Notification'
}

/**
 * Get icon name for notification type
 */
export const getNotificationIconName = (type) => {
  const icons = {
    [NOTIFICATION_TYPES.ASSIGNMENT]: 'alert_circle',
    [NOTIFICATION_TYPES.QUIZ]: 'info',
    [NOTIFICATION_TYPES.SUBMISSION]: 'check_circle',
    [NOTIFICATION_TYPES.ANNOUNCEMENT]: 'campaign',
    [NOTIFICATION_TYPES.COURSE_UPDATE]: 'update',
    [NOTIFICATION_TYPES.GENERAL]: 'notifications',
  }
  return icons[type] || 'notifications'
}

/**
 * Get color class for notification type badge
 */
export const getNotificationTypeColor = (type) => {
  const colors = {
    [NOTIFICATION_TYPES.ASSIGNMENT]: 'bg-amber-100 text-amber-800',
    [NOTIFICATION_TYPES.QUIZ]: 'bg-blue-100 text-blue-800',
    [NOTIFICATION_TYPES.SUBMISSION]: 'bg-green-100 text-green-800',
    [NOTIFICATION_TYPES.ANNOUNCEMENT]: 'bg-purple-100 text-purple-800',
    [NOTIFICATION_TYPES.COURSE_UPDATE]: 'bg-indigo-100 text-indigo-800',
    [NOTIFICATION_TYPES.GENERAL]: 'bg-gray-100 text-gray-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

/**
 * Format relative time for display
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted relative time (e.g., "5m ago", "2h ago")
 */
export const getRelativeTime = (dateString) => {
  try {
    const now = new Date()
    const notifTime = new Date(dateString)
    const diffMs = now - notifTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffWeeks = Math.floor(diffMs / 604800000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffWeeks < 4) return `${diffWeeks}w ago`

    return notifTime.toLocaleDateString()
  } catch {
    return 'Recently'
  }
}

/**
 * Format full timestamp for display
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted full timestamp
 */
export const getFormattedTime = (dateString) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Unknown time'
  }
}

/**
 * Filter and sort notifications
 */
export const filterNotifications = (notifications, options = {}) => {
  let filtered = [...notifications]

  if (options.unreadOnly) {
    filtered = filtered.filter(n => !n.read)
  }

  if (options.type) {
    filtered = filtered.filter(n => n.type === options.type)
  }

  if (options.courseId) {
    filtered = filtered.filter(n => n.course_id === options.courseId)
  }

  if (options.limit) {
    filtered = filtered.slice(0, options.limit)
  }

  return filtered
}

/**
 * Fetch notifications from API
 */
export const fetchNotifications = async (userId, options = {}) => {
  try {
    const params = new URLSearchParams()
    params.append('user_id', userId)
    if (options.limit) params.append('limit', options.limit)
    if (options.courseId) params.append('course_id', options.courseId)

    const res = await fetch(`/api/notifications?${params.toString()}`)
    if (!res.ok) throw new Error('Failed to fetch notifications')

    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error fetching notifications:', err)
    return []
  }
}

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const res = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: notificationId, read: true }),
    })

    if (!res.ok) throw new Error('Failed to mark as read')
    return await res.json()
  } catch (err) {
    console.error('Error marking notification as read:', err)
    throw err
  }
}

/**
 * Mark notification as unread
 */
export const markNotificationAsUnread = async (notificationId) => {
  try {
    const res = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: notificationId, read: false }),
    })

    if (!res.ok) throw new Error('Failed to mark as unread')
    return await res.json()
  } catch (err) {
    console.error('Error marking notification as unread:', err)
    throw err
  }
}

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    const res = await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: notificationId }),
    })

    if (!res.ok) throw new Error('Failed to delete notification')
    return await res.json()
  } catch (err) {
    console.error('Error deleting notification:', err)
    throw err
  }
}

/**
 * Create a new notification (admin/teacher only)
 */
export const createNotification = async (payload) => {
  try {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error('Failed to create notification')
    return await res.json()
  } catch (err) {
    console.error('Error creating notification:', err)
    throw err
  }
}
