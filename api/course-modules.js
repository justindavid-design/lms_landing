const {
  ensureCourseAccess,
  getSupabase,
  requireUserId,
  respondWithError,
} = require('./_lms')

module.exports = async (req, res) => {
  try {
    const courseId = req.params?.id
    const userId = requireUserId(req)

    if (!courseId) return res.status(400).json({ error: 'course id required' })

    if (req.method === 'GET') {
      await ensureCourseAccess(courseId, userId)
      const { data, error } = await getSupabase()
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw error
      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      await ensureCourseAccess(courseId, userId, { teacherOnly: true })
      const body = req.body || {}
      if (!body.title) return res.status(400).json({ error: 'title required' })

      const { data, error } = await getSupabase()
        .from('course_modules')
        .insert([
          {
            course_id: courseId,
            title: body.title,
            description: body.description || null,
            position: Number(body.position || 0),
            published: body.published !== false,
            created_by: userId,
          },
        ])
        .select()
        .maybeSingle()

      if (error) throw error
      return res.status(201).json(data)
    }

    if (req.method === 'PATCH') {
      await ensureCourseAccess(courseId, userId, { teacherOnly: true })
      const body = req.body || {}
      if (!body.id) return res.status(400).json({ error: 'id required' })

      const updates = {
        title: body.title,
        description: body.description,
        position: body.position !== undefined ? Number(body.position) : undefined,
        published: body.published !== undefined ? body.published : undefined,
      }

      Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key])

      const { data, error } = await getSupabase()
        .from('course_modules')
        .update(updates)
        .eq('id', body.id)
        .eq('course_id', courseId)
        .select()
        .maybeSingle()

      if (error) throw error
      if (!data) return res.status(404).json({ error: 'module not found' })
      return res.status(200).json(data)
    }

    if (req.method === 'DELETE') {
      await ensureCourseAccess(courseId, userId, { teacherOnly: true })
      const body = req.body || {}
      if (!body.id) return res.status(400).json({ error: 'id required' })

      const { data, error } = await getSupabase()
        .from('course_modules')
        .delete()
        .eq('id', body.id)
        .eq('course_id', courseId)
        .select()
        .maybeSingle()

      if (error) throw error
      if (!data) return res.status(404).json({ error: 'module not found' })
      return res.status(200).json({ ok: true, deleted: data })
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    return respondWithError(res, err)
  }
}
