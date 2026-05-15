const {
  buildCourseSummary,
  ensureCourseAccess,
  fetchProfilesByIds,
  getSupabase,
  requireUserId,
  respondWithError,
} = require('./_lms')

function generateCourseCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function slugifyTitle(title = 'course') {
  const base = String(title || 'course')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return base || `course-${Date.now()}`
}

function isMissingCourseMetadataError(error) {
  const message = String(error?.message || '')
  return (
    error?.code === '42703' ||
    error?.code === 'PGRST204' ||
    message.includes('schema cache')
  )
}

function getMissingSchemaColumn(error) {
  const message = String(error?.message || '')
  return message.match(/'([^']+)' column/)?.[1] || null
}

function omitColumn(row, column) {
  const nextRow = { ...row }
  delete nextRow[column]
  return nextRow
}

async function ensureUniqueCourseCode(db, code) {
  let nextCode = code || generateCourseCode()

  for (let i = 0; i < 5; i += 1) {
    const { data, error } = await db
      .from('courses')
      .select('id')
      .eq('course_code', nextCode)
      .limit(1)

    if (error) throw error
    if (!data || data.length === 0) return nextCode
    nextCode = generateCourseCode()
  }

  return nextCode
}

async function ensureUniqueSlug(db, title, currentSlug = null) {
  const base = slugifyTitle(currentSlug || title)
  let nextSlug = base

  for (let i = 0; i < 8; i += 1) {
    const { data, error } = await db
      .from('courses')
      .select('id')
      .eq('slug', nextSlug)
      .limit(1)

    if (error) throw error
    if (!data || data.length === 0) return nextSlug
    nextSlug = `${base}-${i + 2}`
  }

  return `${base}-${Date.now()}`
}

async function getCompatibleSlug(db, body) {
  try {
    return await ensureUniqueSlug(db, body.title || 'course', body.slug || null)
  } catch (error) {
    if (isMissingCourseMetadataError(error)) return null
    throw error
  }
}

async function insertCourseWithCompatibleColumns(db, courseRow) {
  const optionalColumns = new Set(['slug', 'description', 'section', 'level', 'subject', 'cover_url'])
  let nextRow = { ...courseRow }
  let lastError = null

  for (let i = 0; i <= optionalColumns.size; i += 1) {
    const { data, error } = await db
      .from('courses')
      .insert([nextRow])
      .select()
      .maybeSingle()

    if (!error) return { data, error: null }

    const missingColumn = getMissingSchemaColumn(error)
    if (!isMissingCourseMetadataError(error) || !optionalColumns.has(missingColumn) || !(missingColumn in nextRow)) {
      return { data, error }
    }

    lastError = error
    nextRow = omitColumn(nextRow, missingColumn)
  }

  return { data: null, error: lastError }
}

async function updateCourseWithCompatibleColumns(db, courseId, updates) {
  const optionalColumns = new Set(['description', 'section', 'level', 'subject', 'cover_url'])
  let nextUpdates = { ...updates }
  let lastError = null

  for (let i = 0; i <= optionalColumns.size; i += 1) {
    const { data, error } = await db
      .from('courses')
      .update(nextUpdates)
      .eq('id', courseId)
      .select()
      .maybeSingle()

    if (!error) return { data, error: null }

    const missingColumn = getMissingSchemaColumn(error)
    if (!isMissingCourseMetadataError(error) || !optionalColumns.has(missingColumn) || !(missingColumn in nextUpdates)) {
      return { data, error }
    }

    lastError = error
    nextUpdates = omitColumn(nextUpdates, missingColumn)
  }

  return { data: null, error: lastError }
}

async function enrichCourses(rows = []) {
  const courses = rows || []
  const courseIds = courses.map((course) => course.id).filter(Boolean)
  const db = getSupabase()

  const { data: enrollments, error: enrollmentError } = courseIds.length
    ? await db
        .from('enrollments')
        .select('course_id, user_id, role, created_at')
        .in('course_id', courseIds)
        .order('created_at', { ascending: true })
    : { data: [], error: null }

  if (enrollmentError) throw enrollmentError

  const profileIds = [
    ...courses.map((course) => course.author),
    ...(enrollments || []).map((enrollment) => enrollment.user_id),
  ]
  const profilesById = await fetchProfilesByIds(profileIds)
  const summaries = await Promise.all(courses.map((course) => buildCourseSummary(course.id)))
  const enrollmentsByCourse = (enrollments || []).reduce((acc, enrollment) => {
    const profile = profilesById[enrollment.user_id] || {}
    if (!acc[enrollment.course_id]) acc[enrollment.course_id] = []
    acc[enrollment.course_id].push({
      id: enrollment.user_id,
      display_name: profile.display_name || 'Student',
      avatar_url: profile.avatar_url || null,
      role: enrollment.role || profile.role || 'student',
      enrolled_at: enrollment.created_at,
    })
    return acc
  }, {})

  return courses.map((course, index) => ({
    ...course,
    cover_image: course.cover_url || null,
    author_name: profilesById[course.author]?.display_name || null,
    author_avatar_url: profilesById[course.author]?.avatar_url || null,
    teacher_role: profilesById[course.author]?.role || null,
    enrolled_students: enrollmentsByCourse[course.id] || [],
    learner_count: summaries[index]?.student_count || 0,
    ...summaries[index],
  }))
}

module.exports = async (req, res) => {
  try {
    const db = getSupabase()
    const id = req.params?.id || req.body?.id
    const userId = requireUserId(req)

    if (req.method === 'GET') {
      if (id) {
        const access = await ensureCourseAccess(id, userId)
        const [summary] = await Promise.all([buildCourseSummary(id)])
        const [enrichedCourse] = await enrichCourses([access.course])
        return res.status(200).json({
          ...enrichedCourse,
          viewer_role: access.isTeacher ? 'teacher' : 'student',
          ...summary,
        })
      }

      const [{ data: createdCourses, error: createdError }, { data: enrollments, error: enrollmentsError }] =
        await Promise.all([
          db.from('courses').select('*').eq('author', userId).order('created_at', { ascending: false }),
          db.from('enrollments').select('course_id').eq('user_id', userId),
        ])

      if (createdError) throw createdError
      if (enrollmentsError) throw enrollmentsError

      const enrolledCourseIds = [...new Set((enrollments || []).map((item) => item.course_id).filter(Boolean))]
      const { data: enrolledCourses, error: enrolledError } = enrolledCourseIds.length
        ? await db.from('courses').select('*').in('id', enrolledCourseIds).order('created_at', { ascending: false })
        : { data: [], error: null }

      if (enrolledError) throw enrolledError

      const mergedMap = new Map()
      ;[...(createdCourses || []), ...(enrolledCourses || [])].forEach((course) => mergedMap.set(course.id, course))

      const rows = [...mergedMap.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      return res.status(200).json(await enrichCourses(rows))
    }

    if (req.method === 'POST') {
      const body = req.body || {}

      if (body.enroll_code) {
        const code = String(body.enroll_code).trim().toUpperCase()
        const { data: foundCourse, error: courseError } = await db
          .from('courses')
          .select('*')
          .eq('course_code', code)
          .maybeSingle()

        if (courseError) throw courseError
        if (!foundCourse) return res.status(404).json({ error: 'course code not found' })

        const { error: enrollmentError } = await db
          .from('enrollments')
          .upsert([{ course_id: foundCourse.id, user_id: userId, role: 'student' }], {
            onConflict: 'course_id,user_id',
          })

        if (enrollmentError) throw enrollmentError

        const [enrichedCourse] = await enrichCourses([foundCourse])
        return res.status(200).json({ ok: true, course: enrichedCourse })
      }

      const courseCode = await ensureUniqueCourseCode(db, body.course_code)
      const { error: profileError } = await db
        .from('profiles')
        .upsert(
          [
            {
              id: userId,
              display_name: body.author_name || null,
              role: 'teacher',
            },
          ],
          { onConflict: 'id' }
        )

      if (profileError) throw profileError

      const slug = await getCompatibleSlug(db, body)
      const courseRow = {
        title: body.title ? String(body.title).trim() : null,
        slug,
        description: body.description || null,
        section: body.section || null,
        level: body.level || null,
        subject: body.subject || null,
        cover_url: body.cover_url || null,
        author: userId,
        published: !!body.published,
        course_code: courseCode,
      }
      if (!slug) delete courseRow.slug

      const { data, error } = await insertCourseWithCompatibleColumns(db, courseRow)

      if (error) throw error

      const [enrichedCourse] = await enrichCourses([data])
      return res.status(201).json(enrichedCourse)
    }

    if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
      const body = req.body || {}
      await ensureCourseAccess(id, userId, { teacherOnly: true })

      const updates = {
        title: body.title ? String(body.title).trim() : undefined,
        description: body.description,
        section: body.section,
        level: body.level,
        subject: body.subject,
        cover_url: body.cover_url,
        course_code: body.course_code,
        published: typeof body.published === 'boolean' ? body.published : undefined,
        grading_scale: body.grading_scale,
        enrollment_status: body.enrollment_status,
        visibility: body.visibility,
      }

      Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key])

      const { data, error } = await updateCourseWithCompatibleColumns(db, id, updates)

      if (error) throw error

      const [enrichedCourse] = await enrichCourses([data])
      return res.status(200).json(enrichedCourse)
    }

    if (req.method === 'DELETE' && id) {
      await ensureCourseAccess(id, userId, { teacherOnly: true })
      const { data, error } = await db.from('courses').delete().eq('id', id).select().maybeSingle()
      if (error) throw error
      return res.status(200).json({ ok: true, deleted: data || null })
    }

    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    return respondWithError(res, err)
  }
}
