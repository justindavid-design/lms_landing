import React, { useState } from 'react'
import supabase from '../lib/supabaseClient'

export default function PasswordReset(){
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {redirectTo: window.location.origin + '/recover/reset'})
      if (error) throw error
      setMessage('Password reset email sent. Check your inbox.')
    } catch (err) {
      setMessage(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-md w-full">
        <h2 className="card-title">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 block mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="input-base" />
          </div>
          {message && <div className="text-sm text-gray-600">{message}</div>}
          <div>
            <button disabled={loading} type="submit" className="primary-btn">{loading ? 'Sending...' : 'Send reset email'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
