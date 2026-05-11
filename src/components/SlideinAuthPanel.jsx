import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAccount } from '../lib/AccountContext'
import supabase from '../lib/supabaseClient'

const inputBase =
  'w-full rounded-2xl border bg-white px-4 py-3.5 text-sm font-medium text-main placeholder:text-subtle shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15'

function GoogleMark() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-black text-[#4285f4]">
      G
    </span>
  )
}

export default function SlideinAuthPanel() {
  const navigate = useNavigate()
  const { showAuthPanel, authMode, setAuthMode, closeAuthPanel, login, signup, loading, error } = useAccount()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setFieldErrors({})
    setTouched({})
  }, [authMode, showAuthPanel])

  const validateEmail = (value) => {
    if (!value) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
    return ''
  }

  const validatePassword = (value) => {
    if (!value) return 'Password is required'
    if (value.length < 6) return 'Use at least 6 characters'
    return ''
  }

  const updateError = (field, message) => {
    setFieldErrors((current) => {
      const next = { ...current }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
  }

  const handleBlur = (field) => {
    setTouched((current) => ({ ...current, [field]: true }))
    if (field === 'email') updateError('email', validateEmail(email))
    if (field === 'password') updateError('password', validatePassword(password))
    if (field === 'confirmPassword' && authMode === 'signup') {
      updateError('confirmPassword', password !== confirmPassword ? 'Passwords do not match' : '')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: authMode === 'signup' && password !== confirmPassword ? 'Passwords do not match' : '',
    }
    const visibleErrors = Object.fromEntries(Object.entries(errors).filter(([, value]) => value))
    setTouched({ email: true, password: true, confirmPassword: true })
    setFieldErrors(visibleErrors)
    if (Object.keys(visibleErrors).length) return

    const result = authMode === 'login'
      ? await login(email, password)
      : await signup(email, password, confirmPassword)

    if (result.success) {
      navigate('/dashboard', { replace: true })
      return
    }

    setFieldErrors({ general: result.error })
  }

  const handleGoogleSignIn = async () => {
    setFieldErrors({})
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (oauthError) {
      setFieldErrors({ general: oauthError.message || 'Google sign-in failed. Please try again.' })
    }
  }

  const hasError = (field) => fieldErrors[field] && touched[field]

  return (
    <AnimatePresence>
      {showAuthPanel && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeAuthPanel}
            aria-hidden="true"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-panel-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[31rem] items-stretch p-3 sm:p-5"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex w-full flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-6 sm:px-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Academee account</p>
                  <h2 id="auth-panel-title" className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                    Welcome Back
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                    Continue to your courses, progress, and profile settings.
                  </p>
                </div>
                <button
                  onClick={closeAuthPanel}
                  className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close login panel"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                  {[
                    ['login', 'Login'],
                    ['signup', 'Register'],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAuthMode(mode)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                        authMode === mode
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {(error || fieldErrors.general) && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                    role="alert"
                  >
                    {fieldErrors.general || error}
                  </motion.div>
                )}

                <motion.form
                  key={authMode}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24 }}
                >
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (touched.email) updateError('email', validateEmail(e.target.value))
                      }}
                      onBlur={() => handleBlur('email')}
                      placeholder="you@domain.com"
                      className={`${inputBase} ${hasError('email') ? 'border-red-400 bg-red-50/60 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-200'}`}
                      autoComplete="email"
                    />
                    {hasError('email') && <p className="mt-2 text-xs font-semibold text-red-600">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-sm font-bold text-slate-700">Password</label>
                      {authMode === 'login' && (
                        <a href="/recover" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                          Forgot password?
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (touched.password) updateError('password', validatePassword(e.target.value))
                        }}
                        onBlur={() => handleBlur('password')}
                        placeholder="Enter your password"
                        className={`${inputBase} pr-12 ${hasError('password') ? 'border-red-400 bg-red-50/60 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-200'}`}
                        autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </button>
                    </div>
                    {hasError('password') && <p className="mt-2 text-xs font-semibold text-red-600">{fieldErrors.password}</p>}
                  </div>

                  {authMode === 'signup' && (
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">Confirm password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            if (touched.confirmPassword) {
                              updateError('confirmPassword', password !== e.target.value ? 'Passwords do not match' : '')
                            }
                          }}
                          onBlur={() => handleBlur('confirmPassword')}
                          placeholder="Repeat your password"
                          className={`${inputBase} pr-12 ${hasError('confirmPassword') ? 'border-red-400 bg-red-50/60 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-200'}`}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                          aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </button>
                      </div>
                      {hasError('confirmPassword') && <p className="mt-2 text-xs font-semibold text-red-600">{fieldErrors.confirmPassword}</p>}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_16px_30px_rgba(79,70,229,0.26)] transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                    {authMode === 'login' ? (loading ? 'Signing in...' : 'Login') : (loading ? 'Creating account...' : 'Create account')}
                  </button>
                </motion.form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">OR</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <GoogleMark />
                  Continue with Google
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
