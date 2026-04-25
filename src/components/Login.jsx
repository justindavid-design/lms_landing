import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AccountLayout from './AccountLayout'
import supabase from '../lib/supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Please enter a valid email address.')
      setLoading(false)
      return
    }

    if (!password) {
      setError('Please enter your password.')
      setLoading(false)
      return
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })
      if (signInError) throw signInError

      const user = data?.user
      if (user) {
        const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email.split('@')[0]
        try {
          const resp = await fetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, display_name: displayName, role: 'student' }),
          })
          if (!resp.ok) console.warn('server profile upsert failed', resp.status)
        } catch (err) {
          console.warn('server profile upsert error', err)
        }

        const destination = location.state?.from?.pathname || '/dashboard'
        navigate(destination, { replace: true })
      }
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AccountLayout
      title="Welcome back to your learning space."
      description="Log in to continue lessons, review quiz tips, and keep your progress moving."
      backTo="/"
      backLabel="Back to home"
      cardTitle="Log in"
      cardDescription="Use your Academee account to continue."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-bold text-main block mb-1" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@domain.com"
            className="input-base"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1 gap-3">
            <label className="text-sm font-bold text-main" htmlFor="login-password">Password</label>
            <Link to="/recover" className="text-sm font-bold text-main underline-offset-4 hover:underline">
              Forgotten?
            </Link>
          </div>
          <input
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="input-base"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input id="remember" type="checkbox" className="h-4 w-4 rounded border-token accent-[#2f6b3f]" />
          <label htmlFor="remember" className="text-sm font-medium text-muted">Remember me</label>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
            {error}
          </div>
        )}

        <button disabled={loading} type="submit" className="primary-btn w-full">
          {loading ? 'Signing in...' : 'Log in'}
        </button>

        <div className="text-center text-sm font-medium text-muted">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-black text-main underline-offset-4 hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </AccountLayout>
  )
}
