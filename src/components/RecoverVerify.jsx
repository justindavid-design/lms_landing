import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RecoverVerify(){
  const navigate = useNavigate()
  const [email, setEmail] = useState(sessionStorage.getItem('recoverEmail') || '')
  const [otp, setOtp] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const verify = async (e) => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try{
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json().catch(() => ({}))
      if(!res.ok) throw new Error(data?.error || 'Failed to verify OTP')

      sessionStorage.setItem('recoverEmail', email)
      sessionStorage.setItem('recoverResetToken', data.resetToken)
      setMsg({ type: 'success', text: 'OTP verified. You can now reset your password.' })
      navigate('/recover/reset')
    }catch(err){
      setMsg({ type: 'error', text: err.message || String(err) })
    }finally{
      setLoading(false)
    }
  }

  const resend = async () => {
    setResending(true)
    setMsg(null)
    try{
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if(!res.ok) throw new Error(data?.error || 'Failed to resend OTP')
      setMsg({ type: 'success', text: 'A new OTP has been sent to your email.' })
    }catch(err){
      setMsg({ type: 'error', text: err.message || String(err) })
    }finally{
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-app px-6">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-token shadow-sm p-8">
        <h1 className="text-2xl font-bold text-main mb-2">Verify OTP</h1>
        <p className="text-sm text-muted mb-6">Enter the 6-digit code sent to your email.</p>

        <form onSubmit={verify} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="input-base"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">OTP code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="input-base tracking-[0.4em]"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="123456"
              required
            />
          </div>

          {msg && (
            <div className={`text-sm ${msg.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black py-3 text-white font-medium"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type="button"
            onClick={resend}
            disabled={resending || !email}
            className="w-full rounded-md border border-token py-3 text-main font-medium"
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </form>
      </div>
    </div>
  )
}