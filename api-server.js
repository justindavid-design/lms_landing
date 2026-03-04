require('dotenv').config()
const express = require('express')
const path = require('path')

const sendOtp = require(path.resolve(__dirname, 'api', 'send-otp'))
const verifyOtp = require(path.resolve(__dirname, 'api', 'verify-otp'))

const app = express()
const PORT = process.env.API_PORT || 8787

app.use(express.json())

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

app.listen(PORT, () => {
  console.log(`API dev server listening on http://localhost:${PORT}`)
})
