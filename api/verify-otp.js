process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const { loadStore, saveStore, generateResetToken, hashValue } = require('./otp-store')

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')
    const body = req.body || {}
    const email = String(body.email || '').toLowerCase().trim()
    const otp = String(body.otp || '').trim()

    if (!email || !otp) return res.status(400).json({ error: 'email and otp required' })

    const store = loadStore()
    const entry = store[email]
    if (!entry) return res.status(400).json({ error: 'no otp found for email' })
    if (Date.now() > (entry.expires || 0)) {
      delete store[email]
      saveStore(store)
      return res.status(400).json({ error: 'otp expired' })
    }

    const hashed = hashValue(email, otp)
    if (hashed !== entry.hash) return res.status(400).json({ error: 'invalid otp' })

    const resetToken = generateResetToken()
    store[email] = {
      ...entry,
      verified: true,
      hash: null,
      resetTokenHash: hashValue(email, resetToken),
      resetExpires: Date.now() + 1000 * 60 * 15,
    }
    saveStore(store)

    return res.status(200).json({ ok: true, resetToken })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || String(err) })
  }
}