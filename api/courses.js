process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE env not set for server functions');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function isMigrationMissingError(err) {
  const code = err?.code
  return code === '42P01' || code === '42703'
}

function getMigrationHint(err) {
  if (err?.code === '42P01') {
    return 'A required table is missing. Apply latest migrations (including supabase/002_enrollments.sql).'
  }
  if (err?.code === '42703') {
    return 'A required column is missing. Apply latest migrations to your database schema.'
  }
  return 'Database schema is out of date. Apply latest migrations.'
}

function getUserId(req) {
  return (
    req.headers['x-user-id'] ||
    (req.query && req.query.user_id) ||
    (req.body && req.body.user_id) ||
    null
  )
}

function toMapById(rows = []) {
  return rows.reduce((acc, row) => {
    acc[row.id] = row
    return acc
  }, {})
}

async function fetchTeacherProfiles(courseRows = []) {
  const authorIds = [...new Set((courseRows || []).map(c => c.author).filter(Boolean))]
  if (authorIds.length === 0) return {}

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .in('id', authorIds)

  if (profilesError) throw profilesError
  return toMapById(profiles || [])
}

function enrichCourses(courseRows = [], profilesById = {}) {
  return (courseRows || []).map(course => {
    const teacher = course.author ? profilesById[course.author] : null
    return {
      ...course,
      cover_image: course.cover_url || null,
      author_name: teacher?.display_name || null,
      teacher_role: teacher?.role || null,
    }
  })
}

module.exports = async (req, res) => {
  try {
    const id = (req.params && req.params.id) || (req.body && req.body.id)
    const userId = getUserId(req)

    if (req.method === 'GET') {
      if (!userId) return res.status(400).json({ error: 'user_id required' })

      if (id) {
        const { data: courseRows, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .limit(1)

        if (courseError) throw courseError
        if (!courseRows || courseRows.length === 0) return res.status(404).json({ error: 'course not found' })

        const course = courseRows[0]
        const isTeacher = String(course.author) === String(userId)

        if (!isTeacher) {
          const { data: enrollmentRows, error: enrollmentError } = await supabase
            .from('enrollments')
            .select('id')
            .eq('course_id', id)
            .eq('user_id', userId)
            .limit(1)

          if (enrollmentError) throw enrollmentError
          if (!enrollmentRows || enrollmentRows.length === 0) {
            return res.status(403).json({ error: 'You do not have access to this course.' })
          }
        }

        const profilesById = await fetchTeacherProfiles([course])
        const [enrichedCourse] = enrichCourses([course], profilesById)
        return res.status(200).json(enrichedCourse)
      }

      const { data: createdCourses, error: createdError } = await supabase
        .from('courses')
        .select('*')
        .eq('author', userId)
        .order('created_at', { ascending: false })
      if (createdError) throw createdError

      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', userId)
      if (enrollmentsError) throw enrollmentsError

      const enrolledCourseIds = [...new Set((enrollments || []).map(e => e.course_id).filter(Boolean))]
      let enrolledCourses = []

      if (enrolledCourseIds.length > 0) {
        const { data: enrolledData, error: enrolledError } = await supabase
          .from('courses')
          .select('*')
          .in('id', enrolledCourseIds)
          .order('created_at', { ascending: false })
        if (enrolledError) throw enrolledError
        enrolledCourses = enrolledData || []
      }

      const mergedMap = {}
      ;[...(createdCourses || []), ...enrolledCourses].forEach(course => {
        mergedMap[course.id] = course
      })

      const rows = Object.values(mergedMap).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      const profilesById = await fetchTeacherProfiles(rows)
      return res.status(200).json(enrichCourses(rows, profilesById))
    }

    if (req.method === 'POST') {
      const body = req.body || {}

      if (body.enroll_code) {
        if (!body.user_id) return res.status(400).json({ error: 'user_id required for enrollment' })
        const code = String(body.enroll_code).trim().toUpperCase()
        const { data: foundCourses, error: findError } = await supabase
          .from('courses')
          .select('*')
          .eq('course_code', code)
          .limit(1)

        if (findError) throw findError
        if (!foundCourses || foundCourses.length === 0) return res.status(404).json({ error: 'course code not found' })

        const course = foundCourses[0]
        const { error: enrollError } = await supabase
          .from('enrollments')
          .upsert({ course_id: course.id, user_id: body.user_id, role: 'student' }, { onConflict: 'course_id,user_id' })

        if (enrollError) throw enrollError

        const profilesById = await fetchTeacherProfiles([course])
        const [enrichedCourse] = enrichCourses([course], profilesById)
        return res.status(200).json({ ok: true, course: enrichedCourse })
      }

      if (!body.title || !body.slug) {
        return res.status(400).json({ error: 'title and slug required' })
      }

      if (!body.author) {
        return res.status(400).json({ error: 'author (creator user id) is required' })
      }

      const genCode = () => {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
        let out = ''
        for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)]
        return out
      }

      let course_code = body.course_code || genCode()
      for (let i = 0; i < 5; i++) {
        const { data: exists, error: existsError } = await supabase
          .from('courses')
          .select('id')
          .eq('course_code', course_code)
          .limit(1)
        if (existsError) throw existsError
        if (!exists || exists.length === 0) break
        course_code = genCode()
      }

      const { error: teacherUpsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: body.author,
            display_name: body.author_name || null,
            role: 'teacher',
          },
          { onConflict: 'id' }
        )

      if (teacherUpsertError) throw teacherUpsertError

      const insertPayload = {
        title: body.title,
        slug: body.slug,
        description: body.description || null,
        cover_url: body.cover_url || null,
        author: body.author,
        published: !!body.published,
        course_code,
      }

      const { data, error } = await supabase.from('courses').insert([insertPayload]).select()
      if (error) throw error

      return res.status(201).json({
        ...data[0],
        cover_image: data[0]?.cover_url || null,
        author_name: body.author_name || null,
        teacher_role: 'teacher',
      })
    }

    if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
      const body = req.body || {}

      if (body.user_id) {
        const { data: existing, error: existingError } = await supabase
          .from('courses')
          .select('id, author')
          .eq('id', id)
          .limit(1)
        if (existingError) throw existingError
        if (!existing || existing.length === 0) return res.status(404).json({ error: 'course not found' })
        if (String(existing[0].author) !== String(body.user_id)) return res.status(403).json({ error: 'only teacher can edit this course' })
      }

      const updates = {
        title: body.title,
        slug: body.slug,
        description: body.description,
        cover_url: body.cover_url,
        author: body.author,
        course_code: body.course_code,
        published: typeof body.published === 'boolean' ? body.published : undefined,
      }
      Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k])
      const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select()
      if (error) throw error

      const profilesById = await fetchTeacherProfiles(data || [])
      const [enrichedCourse] = enrichCourses(data || [], profilesById)
      return res.status(200).json(enrichedCourse)
    }

    if (req.method === 'DELETE' && id) {
      if (userId) {
        const { data: existing, error: existingError } = await supabase
          .from('courses')
          .select('id, author')
          .eq('id', id)
          .limit(1)
        if (existingError) throw existingError
        if (!existing || existing.length === 0) return res.status(404).json({ error: 'course not found' })
        if (String(existing[0].author) !== String(userId)) return res.status(403).json({ error: 'only teacher can delete this course' })
      }

      const { data, error } = await supabase.from('courses').delete().eq('id', id).select()
      if (error) throw error
      return res.status(200).json({ ok: true, deleted: data?.[0] || null })
    }

    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    console.error(err)
    if (isMigrationMissingError(err)) {
      return res.status(500).json({
        error: 'Database migration missing',
        code: 'MIGRATION_MISSING',
        hint: getMigrationHint(err),
        db_code: err?.code || null,
      })
    }
    return res.status(500).json({ error: err.message || String(err) })
  }
}