import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RecoverReset(){
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const email = sessionStorage.getItem('recoverEmail') || ''
  const resetToken = sessionStorage.getItem('recoverResetToken') || ''

  const resetPassword = async (e) => {
    e.preventDefault()
    setMsg(null)

    if (!email || !resetToken) {
      setMsg({ type: 'error', text: 'Recovery session is missing. Please verify OTP again.' })
      return
    }

    if (password.length < 8) {
      setMsg({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }

    if (password !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setLoading(true)
    try{
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, password }),
      })
      const data = await res.json().catch(() => ({}))
      if(!res.ok) throw new Error(data?.error || 'Failed to reset password')

      sessionStorage.removeItem('recoverEmail')
      sessionStorage.removeItem('recoverResetToken')
      setMsg({ type: 'success', text: 'Password updated successfully. Redirecting to login...' })

      setTimeout(() => navigate('/login'), 1200)
    }catch(err){
      setMsg({ type: 'error', text: err.message || String(err) })
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-app px-6">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-token shadow-sm p-8">
        <h1 className="text-2xl font-bold text-main mb-2">Reset Password</h1>
        <p className="text-sm text-muted mb-6">Create a new password for your account.</p>

        <form onSubmit={resetPassword} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">New password</label>
            <input
              type="password"
              className="input-base"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Confirm password</label>
            <input
              type="password"
              className="input-base"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
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
            {loading ? 'Saving...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}