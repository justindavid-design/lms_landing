import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import RecoveryLayout from './RecoveryLayout'

function getPasswordChecks(password, confirmPassword) {
  return [
    {
      label: 'At least 8 characters',
      ok: password.length >= 8,
    },
    {
      label: 'Contains a number',
      ok: /\d/.test(password),
    },
    {
      label: 'Passwords match',
      ok: password.length > 0 && password === confirmPassword,
    },
  ]
}

export default function RecoverReset() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const email = sessionStorage.getItem('recoverEmail') || ''
  const resetToken = sessionStorage.getItem('recoverResetToken') || ''
  const passwordChecks = useMemo(() => getPasswordChecks(password, confirmPassword), [password, confirmPassword])

  const resetPassword = async (e) => {
    e.preventDefault()
    setMsg(null)

    if (!email || !resetToken) {
      setMsg({ type: 'error', text: 'This password reset link is missing or expired. Please check your code again.' })
      return
    }

    if (password.length < 8) {
      setMsg({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }

    if (!/\d/.test(password)) {
      setMsg({ type: 'error', text: 'Password must include at least one number.' })
      return
    }

    if (password !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'We could not update your password. Please try again.')

      sessionStorage.removeItem('recoverEmail')
      sessionStorage.removeItem('recoverResetToken')
      setMsg({ type: 'success', text: 'Your password has been updated. Taking you back to log in...' })

      window.setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setMsg({ type: 'error', text: err.message || String(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <RecoveryLayout
      title="Set a New Password"
      description="Create a new password after entering the six-digit code from your email."
      backTo="/recover/verify"
      backLabel="Back to code"
      cardTitle="Reset password"
      cardDescription={email ? `Updating password for ${email}` : 'Enter your code before creating a new password.'}
    >
      <form onSubmit={resetPassword} className="space-y-4">
        {!email || !resetToken ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium leading-7 text-red-700">
            This password reset link is missing or expired. Go back and enter a new code to continue.
          </div>
        ) : null}

        <div>
          <label className="text-sm font-bold text-main block mb-1" htmlFor="reset-password">New password</label>
          <input
            id="reset-password"
            type="password"
            className="input-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            autoComplete="new-password"
            required
          />
        </div>

        <div>
          <label className="text-sm font-bold text-main block mb-1" htmlFor="reset-confirm">Confirm password</label>
          <input
            id="reset-confirm"
            type="password"
            className="input-base"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="rounded-xl border border-token bg-surface-alt px-4 py-3 text-sm font-medium text-muted">
          {passwordChecks.map((check) => (
            <div key={check.label} className={check.ok ? 'text-green-800' : 'text-muted'}>
              {check.ok ? 'OK' : '-'} {check.label}
            </div>
          ))}
        </div>

        {msg && (
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium leading-6 ${msg.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'}`}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={loading || !email || !resetToken} className="primary-btn w-full">
          {loading ? 'Saving...' : 'Reset password'}
        </button>

        {!email || !resetToken ? (
          <div className="text-center text-sm font-medium text-muted">
            <Link to="/recover/verify" className="font-black text-main underline-offset-4 hover:underline">
              Go back to code
            </Link>
          </div>
        ) : null}
      </form>
    </RecoveryLayout>
  )
}
