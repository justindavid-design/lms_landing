const {
  ensureCourseAccess,
  getSupabase,
  requireUserId,
  respondWithError,
  getEnrollmentsForCourse,
  fetchProfilesByIds,
} = require('./_lms')

/**
 * GET /api/courses/:id/people
 * Fetch all enrolled users (instructors and students) for a course
 * 
 * Returns:
 * [
 *   {
 *     id: string (user ID),
 *     name: string (display name),
 *     email: string,
 *     avatar_url: string | null,
 *     role: 'teacher' | 'student' | 'ta'
 *   }
 * ]
 */
module.exports = async (req, res) => {
  try {
    const courseId = req.params?.id
    const userId = requireUserId(req)

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({ error: 'course id required' })
    }

    // Check access (user must be enrolled or be the teacher)
    const { course, isTeacher } = await ensureCourseAccess(courseId, userId)

    // Fetch all enrollments for the course
    const enrollments = await getEnrollmentsForCourse(courseId)

    // Get unique user IDs from enrollments
    const userIds = enrollments.map(e => e.user_id)

    // Include course author (teacher) if not already in enrollments
    if (course.author && !userIds.includes(course.author)) {
      userIds.push(course.author)
    }

    // Fetch profiles for all users
    const profiles = await fetchProfilesByIds(userIds)

    // Fetch emails from auth.users table (using admin client)
    const db = getSupabase()
    const { data: authUsers, error: authError } = await db.auth.admin.listUsers()
    
    const emailMap = {}
    if (!authError && authUsers?.users) {
      authUsers.users.forEach(user => {
        if (user.id && user.email) {
          emailMap[user.id] = user.email
        }
      })
    }

    // Build enrollment map for quick lookup
    const enrollmentMap = {}
    enrollments.forEach(e => {
      enrollmentMap[e.user_id] = e
    })

    // Combine enrollment data with profile data
    const people = userIds
      .map(uid => {
        const profile = profiles[uid] || {}
        const enrollment = enrollmentMap[uid]
        
        // Determine role: teacher if course author, otherwise use enrollment role
        let role = 'student'
        if (String(course.author) === String(uid)) {
          role = 'instructor'
        } else if (enrollment) {
          role = enrollment.role || 'student'
        }

        return {
          id: uid,
          name: profile.display_name || 'Unknown User',
          email: emailMap[uid] || null,
          avatar_url: profile.avatar_url || null,
          role: role,
        }
      })
      .filter(p => p.id) // Remove any entries without ID
      .sort((a, b) => {
        // Sort: instructors first, then by name
        if (a.role !== b.role) {
          return a.role === 'instructor' ? -1 : 1
        }
        return (a.name || '').localeCompare(b.name || '')
      })

    return res.status(200).json(people)
  } catch (err) {
    return respondWithError(res, err)
  }
}
