require('dotenv').config()
const express = require('express')
const path = require('path')

const sendOtp = require(path.resolve(__dirname, 'api', 'send-otp'))
const verifyOtp = require(path.resolve(__dirname, 'api', 'verify-otp'))
const resetPassword = require(path.resolve(__dirname, 'api', 'reset-password'))
const stats = require(path.resolve(__dirname, 'api', 'stats'))
const courses = require(path.resolve(__dirname, 'api', 'courses'))
const notifications = require(path.resolve(__dirname, 'api', 'notifications'))
const profiles = require(path.resolve(__dirname, 'api', 'profiles'))

const app = express()
const PORT = process.env.API_PORT || 8787

app.use(express.json())

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'lms-api' })
})

app.post('/api/send-otp', async (req, res) => {
  try{
    await sendOtp(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.post('/api/verify-otp', async (req, res) => {
  try{
    await verifyOtp(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.post('/api/reset-password', async (req, res) => {
  try{
    await resetPassword(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.get('/api/stats', async (req, res) => {
  try{
    await stats(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/courses', async (req, res) => {
  try{
    await courses(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/courses/:id', async (req, res) => {
  try{
    req.params = req.params || {}
    await courses(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/notifications', async (req, res) => {
  try{
    await notifications(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/profiles', async (req, res) => {
  try{
    await profiles(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/profiles/:id', async (req, res) => {
  try{
    req.params = req.params || {}
    await profiles(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

app.listen(PORT, () => {
  console.log(`API dev server listening on http://localhost:${PORT}`)
})