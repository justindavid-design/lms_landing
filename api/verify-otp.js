process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const STORE_PATH = path.resolve(process.cwd(), 'tmp_otps.json')
function loadStore(){
  try{ return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8') || '{}') }catch(e){ return {} }
}
function saveStore(s){ fs.writeFileSync(STORE_PATH, JSON.stringify(s, null, 2)) }
function hashOtp(email, otp){ return crypto.createHash('sha256').update(email + '|' + otp).digest('hex') }

module.exports = async (req, res) => {
  try{
    if(req.method !== 'POST') return res.status(405).end('Method Not Allowed')
    const body = req.body || {}
    const email = (body.email || '').toLowerCase().trim()
    const otp = String(body.otp || '')
    if(!email || !otp) return res.status(400).json({ error: 'email and otp required' })

    const store = loadStore()
    const entry = store[email]
    if(!entry) return res.status(400).json({ error: 'no otp found for email' })
    if(Date.now() > (entry.expires || 0)){
      delete store[email]
      saveStore(store)
      return res.status(400).json({ error: 'otp expired' })
    }
    const hashed = hashOtp(email, otp)
    if(hashed !== entry.hash) return res.status(400).json({ error: 'invalid otp' })

    // success: remove entry and return ok
    delete store[email]
    saveStore(store)
    return res.status(200).json({ ok: true })
  }catch(err){
    console.error(err)
    return res.status(500).json({ error: err.message || String(err) })
  }
}
