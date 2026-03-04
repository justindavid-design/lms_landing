const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

const STORE_PATH = path.resolve(process.cwd(), 'tmp_otps.json')
function loadStore(){
  try{ return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8') || '{}') }catch(e){ return {} }
}
function saveStore(s){ fs.writeFileSync(STORE_PATH, JSON.stringify(s, null, 2)) }

function generateOtp(){ return String(Math.floor(100000 + Math.random() * 900000)) }
function hashOtp(email, otp){ return crypto.createHash('sha256').update(email + '|' + otp).digest('hex') }

require('dotenv').config()

async function sendMail(to, subject, text){
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || (user || 'no-reply@example.com')

  if(!host || !port || !user || !pass){
    console.log('SMTP not configured; falling back to console logging')
    console.log(`OTP for ${to}: ${text}`)
    return
  }

  const transporter = nodemailer.createTransport({ host, port: Number(port), secure: Number(port) === 465, auth: { user, pass } })
  try{
    await transporter.sendMail({ from, to, subject, text })
  }catch(err){
    console.error('nodemailer sendMail failed', err)
    // fallback to console logging but don't throw to keep flow working in dev
    console.log(`OTP for ${to}: ${text}`)
  }
}

module.exports = async (req, res) => {
  try{
    if(req.method !== 'POST') return res.status(405).end('Method Not Allowed')
    const body = req.body || {}
    const email = (body.email || '').toLowerCase().trim()
    if(!email) return res.status(400).json({ error: 'email required' })

    const otp = generateOtp()
    const hashed = hashOtp(email, otp)
    const store = loadStore()
    store[email] = { hash: hashed, expires: Date.now() + 1000 * 60 * 10 } // 10 minutes
    saveStore(store)

    await sendMail(email, 'Your password reset code', `Your verification code is: ${otp}\nThis code expires in 10 minutes.`)

    return res.status(200).json({ ok: true, message: 'OTP sent (if SMTP configured).' })
  }catch(err){
    console.error(err)
    return res.status(500).json({ error: err.message || String(err) })
  }
}
