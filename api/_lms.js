process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase = null

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const err = new Error('Supabase server environment variables are missing.')
    err.status = 500
    throw err
  }

  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  }

  return supabase
}

function getUserId(req) {
  return (
    req.headers['x-user-id'] ||
    (req.query && req.query.user_id) ||
    (req.body && req.body.user_id) ||
    null
  )
}

function getQuery(req, key) {
  if (req.query && req.query[key] != null) return req.query[key]
  if (req.url) {
    try {
      return new URL(req.url, 'http://localhost').searchParams.get(key)
    } catch (_error) {
      return null
    }
  }
  return null
}

function isMigrationMissingError(err) {
  return err?.code === '42P01' || err?.code === '42703'
}

function getMigrationHint(err) {
  if (err?.code === '42P01') {
    return 'Apply the latest Supabase migrations, including supabase/004_classroom_workflow.sql.'
  }
  if (err?.code === '42703') {
    return 'A required classroom column is missing. Apply the latest Supabase migrations.'
  }
  return 'Database schema is out of date. Apply the latest Supabase migrations.'
}

function respondWithError(res, err) {
  console.error(err)
  if (isMigrationMissingError(err)) {
    return res.status(500).json({
      error: 'Database migration missing',
      code: 'MIGRATION_MISSING',
      hint: getMigrationHint(err),
      db_code: err?.code || null,
    })
  }

  return res.status(err?.status || 500).json({ error: err?.message || String(err) })
}

function requireUserId(req) {
  const userId = getUserId(req)
  if (!userId) {
    const err = new Error('user_id required')
    err.status = 400
    throw err
  }
  return userId
}

async function getCourse(courseId) {
  const { data, error } = await getSupabase()
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .maybeSingle()

  if (error) throw error
  return data
}

async function getEnrollmentsForCourse(courseId) {
  const { data, error } = await getSupabase()
    .from('enrollments')
    .select('id, user_id, role, created_at')
    .eq('course_id', courseId)

  if (error) throw error
  return data || []
}

async function isEnrolled(courseId, userId) {
  const { data, error } = await getSupabase()
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return !!data
}

async function ensureCourseAccess(courseId, userId, options = {}) {
  const course = await getCourse(courseId)
  if (!course) {
    const err = new Error('course not found')
    err.status = 404
    throw err
  }

  const isTeacher = String(course.author) === String(userId)
  const enrolled = isTeacher ? true : await isEnrolled(courseId, userId)

  if (options.teacherOnly && !isTeacher) {
    const err = new Error('only teacher can access this resource')
    err.status = 403
    throw err
  }

  if (!isTeacher && !enrolled) {
    const err = new Error('You do not have access to this course.')
    err.status = 403
    throw err
  }

  return { course, isTeacher, isEnrolled: enrolled }
}

async function listAccessibleCourseIds(userId) {
  const db = getSupabase()
  const [{ data: teachingCourses, error: teachingError }, { data: enrollments, error: enrollmentsError }] =
    await Promise.all([
      db.from('courses').select('id').eq('author', userId),
      db.from('enrollments').select('course_id').eq('user_id', userId),
    ])

  if (teachingError) throw teachingError
  if (enrollmentsError) throw enrollmentsError

  const ids = new Set()
  ;(teachingCourses || []).forEach((item) => ids.add(item.id))
  ;(enrollments || []).forEach((item) => ids.add(item.course_id))
  return [...ids]
}

function toMapById(rows = []) {
  return rows.reduce((acc, row) => {
    acc[row.id] = row
    return acc
  }, {})
}

async function fetchProfilesByIds(ids = []) {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  if (uniqueIds.length === 0) return {}

  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, display_name, avatar_url, role')
    .in('id', uniqueIds)

  if (error) throw error
  return toMapById(data || [])
}

function computeSubmissionStatus(item, submission) {
  const now = Date.now()
  const dueTime = item?.due_at ? new Date(item.due_at).getTime() : null

  if (submission?.status === 'graded' || submission?.graded_at || submission?.score != null) {
    return 'graded'
  }
  if (submission?.status === 'submitted' || submission?.submitted_at) {
    return 'submitted'
  }
  if (dueTime && dueTime < now) {
    return 'late'
  }
  return 'assigned'
}

async function buildCourseSummary(courseId) {
  const db = getSupabase()
  const nowIso = new Date().toISOString()
  const [
    { count: assignmentCount, error: assignmentError },
    { count: quizCount, error: quizCountError },
    { count: studentCount, error: studentCountError },
    { data: nextItem, error: nextItemError },
    { data: latestAnnouncement, error: announcementError },
  ] = await Promise.all([
    db.from('assignments').select('id', { count: 'exact', head: true }).eq('course_id', courseId).eq('kind', 'assignment'),
    db.from('assignments').select('id', { count: 'exact', head: true }).eq('course_id', courseId).eq('kind', 'quiz'),
    db.from('enrollments').select('id', { count: 'exact', head: true }).eq('course_id', courseId),
    db.from('assignments')
      .select('title, due_at')
      .eq('course_id', courseId)
      .eq('status', 'published')
      .not('due_at', 'is', null)
      .gte('due_at', nowIso)
      .order('due_at', { ascending: true })
      .limit(1),
    db.from('notifications')
      .select('title, body, created_at')
      .eq('course_id', courseId)
      .eq('type', 'announcement')
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  if (assignmentError) throw assignmentError
  if (quizCountError) throw quizCountError
  if (studentCountError) throw studentCountError
  if (nextItemError) throw nextItemError
  if (announcementError) throw announcementError

  return {
    assignment_count: assignmentCount || 0,
    quiz_count: quizCount || 0,
    student_count: studentCount || 0,
    next_due_at: nextItem?.[0]?.due_at || null,
    next_activity_title: nextItem?.[0]?.title || null,
    latest_announcement: latestAnnouncement?.[0] || null,
  }
}

async function createNotification(payload = {}) {
  if (!payload.title) return null

  try {
    const { data, error } = await getSupabase()
      .from('notifications')
      .insert([
        {
          user_id: payload.user_id || null,
          course_id: payload.course_id || null,
          type: payload.type || 'general',
          title: payload.title,
          body: payload.body || null,
          read: false,
        },
      ])
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  } catch (err) {
    console.warn('createNotification failed', err)
    return null
  }
}

async function createCourseNotifications(courseId, title, body, type = 'general') {
  const enrollments = await getEnrollmentsForCourse(courseId)
  await Promise.all(
    enrollments.map((enrollment) =>
      createNotification({
        user_id: enrollment.user_id,
        course_id: courseId,
        title,
        body,
        type,
      })
    )
  )
}

module.exports = {
  buildCourseSummary,
  computeSubmissionStatus,
  createCourseNotifications,
  createNotification,
  ensureCourseAccess,
  fetchProfilesByIds,
  getCourse,
  getEnrollmentsForCourse,
  getQuery,
  getSupabase,
  getUserId,
  listAccessibleCourseIds,
  requireUserId,
  respondWithError,
}
