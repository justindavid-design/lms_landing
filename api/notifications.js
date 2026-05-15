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
    const userId = requireUserId(req)
    const id = req.params?.id
    const isDetailRoute = !!id

    // Handle mark-all-read
    if (req.url?.includes('/mark-all-read') && req.method === 'PATCH') {
      const { error } = await db
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    // Handle notification detail routes (GET, PATCH, DELETE)
    if (isDetailRoute) {
      // Mark as read
      if (req.url?.includes('/read') && req.method === 'PATCH') {
        const { data, error } = await db
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) throw error
        if (!data) return res.status(404).json({ error: 'not found' })
        return res.status(200).json(data)
      }

      // Delete notification
      if (req.method === 'DELETE') {
        const { error } = await db
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error
        return res.status(200).json({ ok: true })
      }
    }

    // Handle main notification routes
    if (req.method === 'GET' && !isDetailRoute) {
      const courseId = getQuery(req, 'course_id')
      const limit = Number(getQuery(req, 'limit') || 25)

      let query = db
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (courseId) {
        await ensureCourseAccess(courseId, userId)
        query = query.eq('course_id', courseId)
      }

      const { data, error } = await query
      if (error) throw error
      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      const body = req.body || {}
      const actorUserId = userId
      const recipientUserId = body.recipient_user_id || body.user_id || null
      if (!body.title) return res.status(400).json({ error: 'title required' })
      if (!recipientUserId) return res.status(400).json({ error: 'recipient_user_id required' })

      if (body.course_id) {
        await ensureCourseAccess(body.course_id, actorUserId, { teacherOnly: true })
      }

      const data = await createNotification({
        user_id: recipientUserId,
        course_id: body.course_id || null,
        type: body.type || 'general',
        title: body.title,
        body: body.body || null,
      })

      return res.status(201).json(data)
    }

    if (req.method === 'PATCH' && !isDetailRoute) {
      const body = req.body || {}
      if (!body.id) return res.status(400).json({ error: 'id required' })

      const { data, error } = await db
        .from('notifications')
        .update({ is_read: typeof body.is_read === 'boolean' ? body.is_read : true })
        .eq('id', body.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      if (!data) return res.status(404).json({ error: 'not found' })
      return res.status(200).json(data)
    }

    if (req.method === 'DELETE' && !isDetailRoute) {
      const body = req.body || {}
      if (!body.id) return res.status(400).json({ error: 'id required' })

      const { error } = await db
        .from('notifications')
        .delete()
        .eq('id', body.id)
        .eq('user_id', userId)

      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    return respondWithError(res, err)
  }
}
