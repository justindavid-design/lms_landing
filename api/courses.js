const {
  buildCourseSummary,
  ensureCourseAccess,
  fetchProfilesByIds,
  getSupabase,
  getUserId,
  respondWithError,
} = require('./_lms')

function generateCourseCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return out
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

async function enrichCourses(rows = []) {
  const profilesById = await fetchProfilesByIds((rows || []).map((course) => course.author))
  const summaries = await Promise.all((rows || []).map((course) => buildCourseSummary(course.id)))

  return (rows || []).map((course, index) => ({
    ...course,
    cover_image: course.cover_url || null,
    author_name: profilesById[course.author]?.display_name || null,
    teacher_role: profilesById[course.author]?.role || null,
    ...summaries[index],
  }))
}

module.exports = async (req, res) => {
  try {
    const db = getSupabase()
    const id = req.params?.id || req.body?.id
    const userId = getUserId(req)

    if (req.method === 'GET') {
      if (!userId) return res.status(400).json({ error: 'user_id required' })

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
        if (!body.user_id) return res.status(400).json({ error: 'user_id required for enrollment' })
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
          .upsert([{ course_id: foundCourse.id, user_id: body.user_id, role: 'student' }], {
            onConflict: 'course_id,user_id',
          })

        if (enrollmentError) throw enrollmentError

        const [enrichedCourse] = await enrichCourses([foundCourse])
        return res.status(200).json({ ok: true, course: enrichedCourse })
      }

      if (!body.title || !body.slug) {
        return res.status(400).json({ error: 'title and slug required' })
      }
      if (!body.author) {
        return res.status(400).json({ error: 'author (creator user id) is required' })
      }

      const courseCode = await ensureUniqueCourseCode(db, body.course_code)
      const { error: profileError } = await db
        .from('profiles')
        .upsert(
          [
            {
              id: body.author,
              display_name: body.author_name || null,
              role: 'teacher',
            },
          ],
          { onConflict: 'id' }
        )

      if (profileError) throw profileError

      const { data, error } = await db
        .from('courses')
        .insert([
          {
            title: body.title,
            slug: body.slug,
            description: body.description || null,
            cover_url: body.cover_url || null,
            author: body.author,
            published: !!body.published,
            course_code: courseCode,
          },
        ])
        .select()
        .maybeSingle()

      if (error) throw error

      const [enrichedCourse] = await enrichCourses([data])
      return res.status(201).json(enrichedCourse)
    }

    if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
      const body = req.body || {}
      await ensureCourseAccess(id, body.user_id || userId, { teacherOnly: true })

      const updates = {
        title: body.title,
        slug: body.slug,
        description: body.description,
        cover_url: body.cover_url,
        course_code: body.course_code,
        published: typeof body.published === 'boolean' ? body.published : undefined,
      }

      Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key])

      const { data, error } = await db
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle()

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
