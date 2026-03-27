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

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    return respondWithError(res, err)
  }
}
