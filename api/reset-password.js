process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const { createClient } = require('@supabase/supabase-js')
const { loadStore, saveStore, hashValue } = require('./otp-store')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function findUserByEmail(email) {
  const pageSize = 200
  let page = 1

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: pageSize })
    if (error) throw error
    const users = data?.users || []
    const match = users.find((user) => String(user.email || '').toLowerCase() === email)
    if (match) return match
    if (users.length < pageSize) return null
    page += 1
  }
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

    const body = req.body || {}
    const email = String(body.email || '').toLowerCase().trim()
    const resetToken = String(body.resetToken || '').trim()
    const password = String(body.password || '')

    if (!email || !resetToken || !password) {
      return res.status(400).json({ error: 'email, resetToken, and password are required' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' })
    }

    const store = loadStore()
    const entry = store[email]
    if (!entry || !entry.verified || !entry.resetTokenHash) {
      return res.status(400).json({ error: 'Password reset session is invalid or expired.' })
    }
    if (Date.now() > (entry.resetExpires || 0)) {
      delete store[email]
      saveStore(store)
      return res.status(400).json({ error: 'Password reset session has expired.' })
    }
    if (hashValue(email, resetToken) !== entry.resetTokenHash) {
      return res.status(400).json({ error: 'Invalid password reset session.' })
    }

    const user = entry.userId ? { id: entry.userId } : await findUserByEmail(email)
    if (!user?.id) return res.status(404).json({ error: 'User not found.' })

    const { error } = await supabase.auth.admin.updateUserById(user.id, { password })
    if (error) throw error

    delete store[email]
    saveStore(store)

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || String(err) })
  }
}