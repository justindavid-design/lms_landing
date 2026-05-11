const {
  getQuery,
  getSupabase,
  requireUserId,
  respondWithError,
} = require('./_lms')

module.exports = async (req, res) => {
  try {
    const db = getSupabase()
    const userId = requireUserId(req)

    if (req.method === 'GET') {
      const requestedId = getQuery(req, 'id') || req.params?.id || userId
      if (String(requestedId) !== String(userId)) {
        return res.status(403).json({ error: 'You can only read your own profile.' })
      }

      const { data, error } = await db
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error
      return res.status(200).json(data || null)
    }

    if (req.method === 'POST') {
      const body = req.body || {}
      const { data: existing, error: existingError } = await db
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

      if (existingError) throw existingError

      const payload = {
        id: userId,
        display_name: body.display_name || null,
        first_name: body.first_name || null,
        last_name: body.last_name || null,
        avatar_url: body.avatar_url || null,
        role: existing?.role || 'student',
      }

      const { data, error } = await db
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .maybeSingle()

      if (error) throw error
      return res.status(201).json(data)
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = req.body || {}
      const updates = {}
      if ('display_name' in body) updates.display_name = body.display_name
      if ('first_name' in body) updates.first_name = body.first_name
      if ('last_name' in body) updates.last_name = body.last_name
      if ('avatar_url' in body) updates.avatar_url = body.avatar_url

      const { data, error } = await db
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .maybeSingle()

      if (error) throw error
      return res.status(200).json(data)
    }

    res.setHeader('Allow', 'GET, POST, PUT, PATCH')
    return res.status(405).end('Method Not Allowed')
  } catch (err) {
    return respondWithError(res, err)
  }
}
