import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RecoveryLayout from './RecoveryLayout'

export default function RecoverEmail() {
  const [email, setEmail] = useState(sessionStorage.getItem('recoverEmail') || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const resp = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      const text = await resp.text()
      let data = null
      try {
        data = text ? JSON.parse(text) : null
      } catch (_err) {
        data = null
      }
      if (!resp.ok) throw new Error(data?.error || text || 'We could not send the code right now. Please try again.')

      sessionStorage.setItem('recoverEmail', normalizedEmail)
      sessionStorage.removeItem('recoverResetToken')
      navigate('/recover/verify')
    } catch (err) {
      console.error('send-otp error', err)
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <RecoveryLayout
      title="Password Help"
      description="Enter your email and we'll send a six-digit code so you can make a new password."
      backTo="/login"
      backLabel="Back to login"
      cardTitle="Recover your account"
      cardDescription="Use the email connected to your Academee account."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-bold text-main block mb-1" htmlFor="recover-email">Email</label>
          <input
            id="recover-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@domain.com"
            className="input-base"
            autoComplete="email"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
            {error}
          </div>
        )}

        <button disabled={loading} type="submit" className="primary-btn w-full">
          {loading ? 'Sending...' : 'Send code'}
        </button>
      </form>
    </RecoveryLayout>
  )
}
