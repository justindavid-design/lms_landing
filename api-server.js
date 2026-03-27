require('dotenv').config()
const express = require('express')
const path = require('path')

const sendOtp = require(path.resolve(__dirname, 'api', 'send-otp'))
const verifyOtp = require(path.resolve(__dirname, 'api', 'verify-otp'))
const resetPassword = require(path.resolve(__dirname, 'api', 'reset-password'))
const stats = require(path.resolve(__dirname, 'api', 'stats'))
const courses = require(path.resolve(__dirname, 'api', 'courses'))
const courseModules = require(path.resolve(__dirname, 'api', 'course-modules'))
const courseAssignments = require(path.resolve(__dirname, 'api', 'course-assignments'))
const courseQuizzes = require(path.resolve(__dirname, 'api', 'course-quizzes'))
const notifications = require(path.resolve(__dirname, 'api', 'notifications'))
const profiles = require(path.resolve(__dirname, 'api', 'profiles'))
const submissions = require(path.resolve(__dirname, 'api', 'submissions'))
const tasks = require(path.resolve(__dirname, 'api', 'tasks'))
const calendar = require(path.resolve(__dirname, 'api', 'calendar'))

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

app.get('/api/tasks', async (req, res) => {
  try{
    await tasks(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.get('/api/calendar', async (req, res) => {
  try{
    await calendar(req, res)
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

app.all('/api/courses/:id/modules', async (req, res) => {
  try{
    req.params = req.params || {}
    await courseModules(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/courses/:id/assignments', async (req, res) => {
  try{
    req.params = req.params || {}
    await courseAssignments(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/courses/:id/quizzes', async (req, res) => {
  try{
    req.params = req.params || {}
    await courseQuizzes(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.all('/api/quizzes', async (req, res) => {
  try{
    await courseQuizzes(req, res)
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

app.all('/api/assignments/:id/submissions', async (req, res) => {
  try{
    req.params = req.params || {}
    await submissions(req, res)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message || String(err) })
  }
})

app.patch('/api/submissions/:submissionId', async (req, res) => {
  try{
    req.params = req.params || {}
    await submissions(req, res)
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
