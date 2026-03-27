const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const STORE_PATH = path.resolve(process.cwd(), 'tmp_otps.json')

function loadStore() {
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8') || '{}')
  } catch (_e) {
    return {}
  }
}

function saveStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2))
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function generateResetToken() {
  return crypto.randomBytes(24).toString('hex')
}

function hashValue(email, value) {
  return crypto.createHash('sha256').update(`${email}|${value}`).digest('hex')
}

module.exports = {
  STORE_PATH,
  loadStore,
  saveStore,
  generateOtp,
  generateResetToken,
  hashValue,
}
