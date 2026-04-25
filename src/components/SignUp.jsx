import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AccountLayout from './AccountLayout'
import supabase from '../lib/supabaseClient'

export default function SignUp() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const mapSignUpError = (err) => {
    const raw = (err?.message || String(err) || '').toLowerCase()

    if (raw.includes('sending confirmation email') || raw.includes('confirmation email')) {
      return 'We could not send the confirmation email right now. Please try again later or ask for help.'
    }

    if (raw.includes('already registered') || raw.includes('already been registered') || raw.includes('user already registered')) {
      return 'This email is already registered. Try logging in instead.'
    }

    if (raw.includes('password') && raw.includes('6')) {
      return 'Password must be at least 6 characters.'
    }

    return err?.message || String(err)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setNotice(null)

    const normalizedEmail = email.trim().toLowerCase()
    const displayName = name.trim()

    if (!displayName) return setError('Please enter your full name.')
    if (!normalizedEmail || !normalizedEmail.includes('@')) return setError('Please enter a valid email address.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')

    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { display_name: displayName, full_name: displayName },
        },
      })
      if (signUpError) throw signUpError

      const user = data?.user
      if (user) {
        try {
          await fetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, display_name: displayName, role: 'student' }),
          })
        } catch (err) {
          console.warn('profile create failed', err)
        }
      }

      if (data?.session) {
        navigate('/dashboard', { replace: true })
      } else {
        setNotice('Account created. Check your email to confirm your account, then log in.')
      }
    } catch (err) {
      setError(mapSignUpError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AccountLayout
      title="Create a focused learning account."
      description="Sign up to save course progress, answer quizzes, and get helpful tips in a comfortable learning space."
      backTo="/"
      backLabel="Back to home"
      cardTitle="Create account"
      cardDescription="Start with your name, email, and a secure password."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-bold text-main block mb-1" htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Your name"
            className="input-base"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label className="text-sm font-bold text-main block mb-1" htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
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
          <label className="text-sm font-bold text-main block mb-1" htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="At least 6 characters"
            className="input-base"
            autoComplete="new-password"
            required
          />
        </div>

        <div>
          <label className="text-sm font-bold text-main block mb-1" htmlFor="signup-confirm">Confirm password</label>
          <input
            id="signup-confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type="password"
            placeholder="Confirm password"
            className="input-base"
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium leading-6 text-green-800">
            {notice}
          </div>
        )}

        <button disabled={loading} type="submit" className="primary-btn w-full">
          {loading ? 'Creating...' : 'Create account'}
        </button>

        <div className="text-center text-sm font-medium text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-black text-main underline-offset-4 hover:underline">
            Log in
          </Link>
        </div>
      </form>
    </AccountLayout>
  )
}
