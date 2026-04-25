import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import RecoveryLayout from './RecoveryLayout'

export default function RecoverVerify() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(sessionStorage.getItem('recoverEmail') || '')
  const [otp, setOtp] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (!cooldown) return undefined
    const timer = window.setInterval(() => {
      setCooldown((current) => (current > 0 ? current - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  const verify = async (e) => {
    e.preventDefault()
    setMsg(null)

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedOtp = otp.replace(/\D/g, '').slice(0, 6)

    if (!normalizedEmail) {
      setMsg({ type: 'error', text: 'Enter your email to continue.' })
      return
    }

    if (normalizedOtp.length !== 6) {
      setMsg({ type: 'error', text: 'Enter the full 6-digit code.' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, otp: normalizedOtp }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'We could not check that code. Please try again.')

      sessionStorage.setItem('recoverEmail', normalizedEmail)
      sessionStorage.setItem('recoverResetToken', data.resetToken)
      navigate('/recover/reset')
    } catch (err) {
      setMsg({ type: 'error', text: err.message || String(err) })
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || cooldown > 0) return

    setResending(true)
    setMsg(null)
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'We could not send a new code. Please try again.')
      sessionStorage.setItem('recoverEmail', normalizedEmail)
      sessionStorage.removeItem('recoverResetToken')
      setCooldown(30)
      setMsg({ type: 'success', text: 'A new code has been sent to your email.' })
    } catch (err) {
      setMsg({ type: 'error', text: err.message || String(err) })
    } finally {
      setResending(false)
    }
  }

  return (
    <RecoveryLayout
      title="Enter Your Code"
      description="Check your inbox for the six-digit code we sent, then confirm it here to continue resetting your password."
      backTo="/recover"
      backLabel="Back to email"
      cardTitle="Enter your code"
      cardDescription="We sent a six-digit code to your email. Codes expire after 10 minutes."
    >
      <form onSubmit={verify} className="space-y-4">
        <div>
          <label className="text-sm font-bold text-main block mb-1" htmlFor="verify-email">Email</label>
          <input
            id="verify-email"
            type="email"
            className="input-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="text-sm font-bold text-main block mb-1" htmlFor="verify-code">Code</label>
          <input
            id="verify-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            className="input-base tracking-[0.4em]"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            required
          />
        </div>

        {msg && (
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium leading-6 ${msg.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'}`}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={loading} className="primary-btn w-full">
          {loading ? 'Checking...' : 'Check code'}
        </button>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={resend}
            disabled={resending || !email.trim() || cooldown > 0}
            className="secondary-btn w-full"
          >
            {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
          <Link to="/recover" className="text-center text-sm font-bold text-main underline-offset-4 hover:underline">
            Use a different email
          </Link>
        </div>
      </form>
    </RecoveryLayout>
  )
}
