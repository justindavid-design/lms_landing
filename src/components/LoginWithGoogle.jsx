import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AccountLayout from './AccountLayout'
import GoogleSignInButton from './GoogleSignInButton'
import supabase from '../lib/supabaseClient'
import { apiFetch } from '../lib/apiClient'

export default function LoginWithGoogle() {
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
          const resp = await apiFetch('/api/profiles', {
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

  /**
   * Handle successful Google Sign-In
   */
  const handleGoogleSuccess = (user) => {
    // Store user data
    sessionStorage.setItem('user_data', JSON.stringify(user))
    
    // Redirect to dashboard
    const destination = location.state?.from?.pathname || '/dashboard'
    navigate(destination, { replace: true })
  }

  /**
   * Handle Google Sign-In error
   */
  const handleGoogleError = (errorMessage) => {
    setError(`Google Sign-In failed: ${errorMessage}`)
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
      {/* Google Sign-In Section */}
      <div className="mb-6">
        <GoogleSignInButton 
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="outline"
          size="large"
          text="signin_with"
        />
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      {/* Email/Password Login Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-bold text-main block mb-1" htmlFor="login-email">
            Email
          </label>
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
            <label className="text-sm font-bold text-main" htmlFor="login-password">
              Password
            </label>
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-main mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="font-bold underline underline-offset-4 hover:text-blue-600">
          Create one
        </Link>
      </p>
    </AccountLayout>
  )
}
