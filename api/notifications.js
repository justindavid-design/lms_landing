const {
  createNotification,
  ensureCourseAccess,
  getQuery,
  getSupabase,
  requireUserId,
  respondWithError,
} = require('./_lms')

module.exports = async (req, res) => {
  try {
    const db = getSupabase()

    if (req.method === 'GET') {
      const userId = requireUserId(req)
      const courseId = getQuery(req, 'course_id')
      const limit = Number(getQuery(req, 'limit') || 25)

      let query = db
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
        .or(`user_id.eq.${userId},user_id.is.null`)

      if (courseId) {
        await ensureCourseAccess(courseId, userId)
        query = query.eq('course_id', courseId)
      }

      const { data, error } = await query
      if (error) throw error
      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      const actorUserId = req.body?.actor_user_id || requireUserId(req)
      const body = req.body || {}
      if (!body.title) return res.status(400).json({ error: 'title required' })

      if (body.course_id) {
        await ensureCourseAccess(body.course_id, actorUserId, { teacherOnly: true })
      }

      const data = await createNotification({
        user_id: body.recipient_user_id || null,
        course_id: body.course_id || null,
        type: body.type || 'general',
        title: body.title,
        body: body.body || null,
      })

      return res.status(201).json(data)
    }

    if (req.method === 'PATCH') {
      const userId = requireUserId(req)
      const body = req.body || {}
      if (!body.id) return res.status(400).json({ error: 'id required' })

      const { data, error } = await db
        .from('notifications')
        .update({ read: typeof body.read === 'boolean' ? body.read : true })
        .eq('id', body.id)
        .or(`user_id.eq.${userId},user_id.is.null`)
        .select()
        .maybeSingle()

      if (error) throw error
      if (!data) return res.status(404).json({ error: 'not found' })
      return res.status(200).json(data)
    }

    if (req.method === 'DELETE') {
      const userId = requireUserId(req)
      const body = req.body || {}
      if (!body.id) return res.status(400).json({ error: 'id required' })

      const { data, error } = await db
        .from('notifications')
        .delete()
        .eq('id', body.id)
        .or(`user_id.eq.${userId},user_id.is.null`)
        .select()
        .maybeSingle()

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
