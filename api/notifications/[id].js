const { getSupabase, requireUserId, respondWithError } = require('../_lms')

module.exports = async (req, res) => {
  try {
    const userId = requireUserId(req)
    const db = getSupabase()
    const id = req.url?.split('/').pop()

    if (!id) {
      return respondWithError(res, 400, 'Notification ID required')
    }

    // Mark as read
    if (req.method === 'PATCH' && req.url?.includes('/read')) {
      const { data, error } = await db
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      if (!data) return respondWithError(res, 404, 'Notification not found')

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

    // Mark all as read
    if (req.method === 'PATCH' && req.url?.includes('/mark-all-read')) {
      const { error } = await db
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error

      return res.status(200).json({ ok: true })
    }

    return respondWithError(res, 405, 'Method not allowed')
  } catch (err) {
    console.error('Notification detail API error:', err)
    return respondWithError(res, 500, err.message)
  }
}
