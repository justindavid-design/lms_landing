const nodemailer = require('nodemailer')
const { createClient } = require('@supabase/supabase-js')
const { loadStore, saveStore, generateOtp, hashValue } = require('./otp-store')

require('dotenv').config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null

async function sendMail(to, subject, text) {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || user || 'no-reply@example.com'

  if (!host || !port || !user || !pass) {
    console.log('SMTP not configured; falling back to console logging')
    console.log(`OTP for ${to}: ${text}`)
    return
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  })

  await transporter.sendMail({ from, to, subject, text })
}

async function findUserByEmail(email) {
  if (!supabase) return null
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
    if (!email) return res.status(400).json({ error: 'email required' })

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(404).json({ error: 'No account found for that email.' })
    }

    const otp = generateOtp()
    const store = loadStore()
    store[email] = {
      hash: hashValue(email, otp),
      expires: Date.now() + 1000 * 60 * 10,
      verified: false,
      resetTokenHash: null,
      userId: user.id,
    }
    saveStore(store)

    await sendMail(
      email,
      'Your Academee password reset code',
      `Your verification code is: ${otp}\nThis code expires in 10 minutes.`
    )

    return res.status(200).json({ ok: true, message: 'OTP sent.' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || String(err) })
  }
}