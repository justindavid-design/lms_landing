import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import supabase from '../lib/supabaseClient'
import { apiFetch } from '../lib/apiClient'
import { CheckCircle, RadioButtonUnchecked, Visibility, VisibilityOff } from '@mui/icons-material'

/**
 * Enhanced Form State with Field-Level Validation
 */
const useFormState = (initialState) => {
  const [values, setValues] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const setFieldValue = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const setFieldError = (field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const setFieldTouched = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const setFieldsTouched = (fields) => {
    setTouched(prev => fields.reduce(
      (next, field) => ({ ...next, [field]: true }),
      { ...prev }
    ))
  }

  const reset = () => {
    setValues(initialState)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    isLoading,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setFieldsTouched,
    setIsLoading,
    reset,
  }
}

/**
 * Validation utilities
 */
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return 'Email is required'
  if (!regex.test(email)) return 'Please enter a valid email address'
  return ''
}

const validateLoginPassword = (password) => {
  if (!password) return 'Password is required'
  return ''
}

const validatePassword = (password) => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter'
  if (!/\d/.test(password)) return 'Password must contain a number'
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain a special character (!@#$%^&* etc)'
  return ''
}

const getPasswordRequirements = (password, confirmPassword = '') => [
  {
    label: 'At least 8 characters',
    met: password.length >= 8,
  },
  {
    label: 'Contains uppercase letter (A-Z)',
    met: /[A-Z]/.test(password),
  },
  {
    label: 'Contains lowercase letter (a-z)',
    met: /[a-z]/.test(password),
  },
  {
    label: 'Contains a number (0-9)',
    met: /\d/.test(password),
  },
  {
    label: 'Contains special character (!@#$%^&*)',
    met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
  {
    label: 'Passwords match',
    met: Boolean(confirmPassword) && password === confirmPassword,
  },
]

const validateSignupPassword = (password) => {
  if (!password) return 'Password is required'
  const unmet = getPasswordRequirements(password).slice(0, 5).find((item) => !item.met)
  if (unmet) return unmet.label
  return ''
}

function PasswordRequirements({ password, confirmPassword }) {
  const requirements = getPasswordRequirements(password, confirmPassword)

  return (
    <div className="mt-3 rounded-lg border border-token bg-surface-alt px-3 py-3 text-xs font-semibold text-muted">
      {requirements.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-2 py-1 ${item.met ? 'text-[#2f6b3f]' : 'text-muted'}`}
        >
          {item.met ? (
            <CheckCircle fontSize="inherit" />
          ) : (
            <RadioButtonUnchecked fontSize="inherit" />
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function GoogleMark() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-black text-[#4285f4]">
      G
    </span>
  )
}

async function startGoogleSignIn(setSubmitError) {
  const { error: oauthError } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  })

  if (oauthError) {
    setSubmitError(oauthError.message || 'Google sign-in failed. Please try again.')
  }
}

/**
 * Map backend errors to user-friendly messages
 */
const mapErrorCode = (code, statusCode) => {
  const errorMap = {
    401: 'Invalid email or password',
    409: 'This email is already registered. Try logging in instead.',
    404: 'User not found',
    500: 'Something went wrong. Please try again.',
    'invalid_credentials': 'Invalid email or password',
    'user_not_found': 'No account found with this email',
    'user_already_exists': 'This email is already registered. Try logging in instead.',
  }
  return errorMap[code] || errorMap[statusCode] || 'An error occurred. Please try again.'
}

async function registerWithDuplicateCheck(email, password, displayName) {
  if (import.meta.env.VITE_USE_SERVER_REGISTER === 'true') {
    try {
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      })

      const registerPayload = await registerResponse.json().catch(() => ({}))
      if (registerResponse.ok) {
        return registerPayload
      }

      if (registerResponse.status !== 500 && registerResponse.status !== 503) {
        throw new Error(registerPayload.error || mapErrorCode(null, registerResponse.status))
      }
    } catch (err) {
      if (!String(err?.message || '').includes('Failed to fetch')) {
        throw err
      }
    }
  }

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        full_name: displayName,
      },
    },
  })

  if (signUpError) throw signUpError

  if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('This email is already registered. Try logging in instead.')
  }

  return { user: data?.user, session: data?.session }
}

/**
 * Login Form Component
 */
export function LoginForm({ onClose, isEmbedded = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const form = useFormState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Load saved email on mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      form.setFieldValue('email', savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    form.setFieldValue(name, value)
    form.setFieldError('submit', '')

    if (form.touched[name]) {
      if (name === 'email') form.setFieldError('email', validateEmail(value))
      if (name === 'password') form.setFieldError('password', validateLoginPassword(value))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    form.setFieldTouched(name)

    if (name === 'email') {
      const error = validateEmail(form.values.email)
      form.setFieldError('email', error)
    } else if (name === 'password') {
      const error = validateLoginPassword(form.values.password)
      form.setFieldError('password', error)
    }
  }

  const validateForm = () => {
    const emailError = validateEmail(form.values.email)
    const passwordError = validateLoginPassword(form.values.password)

    // Mark all fields as touched so errors display
    form.setFieldsTouched(['email', 'password'])
    
    // Set all errors
    if (emailError) form.setFieldError('email', emailError)
    if (passwordError) form.setFieldError('password', passwordError)

    return !emailError && !passwordError
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    form.setFieldError('submit', '') // Clear any previous submit errors

    if (!validateForm()) {
      // Form has validation errors, they will be displayed
      return
    }

    form.setIsLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.values.email.trim().toLowerCase(),
        password: form.values.password,
      })

      if (signInError) {
        const errorMsg = mapErrorCode(signInError.code, signInError.status)
        form.setFieldError('submit', errorMsg)
        form.setIsLoading(false)
        return
      }

      // Handle "Remember me" functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', form.values.email.trim().toLowerCase())
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      const user = data?.user
      if (user) {
        const displayName =
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.email.split('@')[0]

        try {
          await apiFetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
              display_name: displayName,
              role: 'student',
            }),
          })
        } catch (err) {
          console.warn('Profile upsert failed:', err)
        }

        const destination = location.state?.from?.pathname || '/dashboard'
        navigate(destination, { replace: true })
      }
    } catch (err) {
      form.setFieldError('submit', err.message || 'Login failed')
    } finally {
      form.setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* General Error */}
      {form.errors.submit && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {form.errors.submit}
        </div>
      )}

      {/* Email Field */}
      <div>
        <label className="text-sm font-bold text-main block mb-1.5" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          value={form.values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          type="email"
          placeholder="Email"
          className={`w-full px-3 py-2 rounded-lg border bg-surface text-main placeholder-muted focus:outline-none focus:ring-2 transition-all ${
            form.errors.email && form.touched.email
              ? 'border-red-500 focus:ring-red-200'
              : 'border-token focus:ring-blue-200'
          }`}
          autoComplete="one-time-code"
          disabled={form.isLoading}
        />
        {form.errors.email && form.touched.email && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{form.errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <div className="flex justify-between items-center mb-1.5 gap-2">
          <label className="text-sm font-bold text-main" htmlFor="login-password">
            Password
          </label>
          <Link
            to="/recover"
            className="text-xs font-bold text-main underline-offset-2 hover:underline"
          >
            Forgotten?
          </Link>
        </div>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            value={form.values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className={`w-full px-3 py-2 pr-10 rounded-lg border bg-surface text-main placeholder-muted focus:outline-none focus:ring-2 transition-all ${
              form.errors.password && form.touched.password
                ? 'border-red-500 focus:ring-red-200'
                : 'border-token focus:ring-blue-200'
            }`}
            autoComplete="new-password"
            disabled={form.isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
            disabled={form.isLoading}
          >
            {showPassword ? (
              <VisibilityOff fontSize="small" />
            ) : (
              <Visibility fontSize="small" />
            )}
          </button>
        </div>
        {form.errors.password && form.touched.password && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{form.errors.password}</p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2">
        <input
          id="remember"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-token accent-[#2f6b3f]"
          disabled={form.isLoading}
        />
        <label htmlFor="remember" className="text-sm font-medium text-muted">
          Remember me
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={form.isLoading}
        className="w-full px-4 py-2.5 bg-[#2f6b3f] text-white rounded-lg font-semibold transition-all hover:bg-[#285636] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {form.isLoading ? (
          <>
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Signing in...
          </>
        ) : (
          'Log in'
        )}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-token" />
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted">OR</span>
        <div className="h-px flex-1 bg-token" />
      </div>

      <button
        type="button"
        onClick={() => startGoogleSignIn((message) => form.setFieldError('submit', message))}
        disabled={form.isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-token bg-surface px-4 py-2.5 text-sm font-bold text-main shadow-sm transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleMark />
        Continue with Google
      </button>

      {/* Sign Up Link */}
      <div className="text-center text-sm font-medium text-muted">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-bold text-main underline-offset-2 hover:underline">
          Sign up
        </Link>
      </div>

      {/* Close Button (for embedded view) */}
      {isEmbedded && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full px-4 py-2.5 border border-token text-main rounded-lg font-semibold hover:bg-surface-alt transition-all"
        >
          Close
        </button>
      )}
    </form>
  )
}

/**
 * Sign Up Form Component (similar structure)
 */
export function SignUpForm({ onClose, isEmbedded = false }) {
  const navigate = useNavigate()
  const form = useFormState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    form.setFieldValue(name, value)
    form.setFieldError('submit', '')

    if (form.touched[name]) {
      if (name === 'firstName' || name === 'lastName') {
        if (!value.trim()) {
          form.setFieldError(name, `${name === 'firstName' ? 'First' : 'Last'} name is required`)
        } else if (value.trim().length < 2) {
          form.setFieldError(name, `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`)
        } else {
          form.setFieldError(name, '')
        }
      }

      if (name === 'email') {
        form.setFieldError('email', validateEmail(value))
      }

      if (name === 'password') {
        form.setFieldError('password', validateSignupPassword(value))
        if (form.touched.confirmPassword) {
          form.setFieldError(
            'confirmPassword',
            value !== form.values.confirmPassword ? 'Passwords do not match' : ''
          )
        }
      }

      if (name === 'confirmPassword') {
        form.setFieldError(
          'confirmPassword',
          form.values.password !== value ? 'Passwords do not match' : ''
        )
      }
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    form.setFieldTouched(name)

    if (name === 'firstName' || name === 'lastName') {
      if (!form.values[name].trim()) {
        form.setFieldError(name, `${name === 'firstName' ? 'First' : 'Last'} name is required`)
      } else if (form.values[name].trim().length < 2) {
        form.setFieldError(name, `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`)
      } else {
        form.setFieldError(name, '')
      }
    } else if (name === 'email') {
      const error = validateEmail(form.values.email)
      form.setFieldError('email', error)
    } else if (name === 'password') {
      const error = validateSignupPassword(form.values.password)
      form.setFieldError('password', error)
    } else if (name === 'confirmPassword') {
      const error =
        form.values.password !== form.values.confirmPassword
          ? 'Passwords do not match'
          : ''
      form.setFieldError('confirmPassword', error)
    }
  }

  const validateForm = () => {
    const firstNameError = !form.values.firstName.trim() ? 'First name is required' : form.values.firstName.trim().length < 2 ? 'First name must be at least 2 characters' : ''
    const lastNameError = !form.values.lastName.trim() ? 'Last name is required' : form.values.lastName.trim().length < 2 ? 'Last name must be at least 2 characters' : ''
    const emailError = validateEmail(form.values.email)
    const passwordError = validateSignupPassword(form.values.password)
    const confirmError =
      form.values.password !== form.values.confirmPassword
        ? 'Passwords do not match'
        : ''

    form.setFieldsTouched(['firstName', 'lastName', 'email', 'password', 'confirmPassword'])
    if (firstNameError) form.setFieldError('firstName', firstNameError)
    if (lastNameError) form.setFieldError('lastName', lastNameError)
    if (emailError) form.setFieldError('email', emailError)
    if (passwordError) form.setFieldError('password', passwordError)
    if (confirmError) form.setFieldError('confirmPassword', confirmError)

    return !firstNameError && !lastNameError && !emailError && !passwordError && !confirmError
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    form.setIsLoading(true)

    try {
      const normalizedEmail = form.values.email.trim().toLowerCase()
      const fullName = `${form.values.firstName.trim()} ${form.values.lastName.trim()}`.trim()
      const registerPayload = await registerWithDuplicateCheck(
        normalizedEmail,
        form.values.password,
        fullName
      )

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: form.values.password,
      })

      if (signInError) {
        form.setFieldError('submit', 'Account created, but automatic login failed. Please log in.')
        form.setIsLoading(false)
        return
      }

      const user = data?.user || registerPayload.user
      if (user) {
        try {
          await apiFetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
              display_name: fullName || normalizedEmail.split('@')[0],
              first_name: form.values.firstName.trim(),
              last_name: form.values.lastName.trim(),
              role: 'student',
            }),
          })
        } catch (err) {
          console.warn('Profile creation failed:', err)
        }

        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      form.setFieldError('submit', err.message || 'Sign up failed')
    } finally {
      form.setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {form.errors.submit && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {form.errors.submit}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-bold text-main block mb-1.5" htmlFor="signup-firstname">
            First Name
          </label>
          <input
            id="signup-firstname"
            name="firstName"
            value={form.values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            type="text"
            placeholder="First name"
            className={`w-full px-3 py-2 rounded-lg border bg-surface text-main placeholder-muted focus:outline-none focus:ring-2 transition-all ${
              form.errors.firstName && form.touched.firstName
                ? 'border-red-500 focus:ring-red-200'
                : 'border-token focus:ring-blue-200'
            }`}
            disabled={form.isLoading}
          />
          {form.errors.firstName && form.touched.firstName && (
            <p className="mt-1.5 text-xs font-medium text-red-600">{form.errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-bold text-main block mb-1.5" htmlFor="signup-lastname">
            Last Name
          </label>
          <input
            id="signup-lastname"
            name="lastName"
            value={form.values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            type="text"
            placeholder="Last name"
            className={`w-full px-3 py-2 rounded-lg border bg-surface text-main placeholder-muted focus:outline-none focus:ring-2 transition-all ${
              form.errors.lastName && form.touched.lastName
                ? 'border-red-500 focus:ring-red-200'
                : 'border-token focus:ring-blue-200'
            }`}
            disabled={form.isLoading}
          />
          {form.errors.lastName && form.touched.lastName && (
            <p className="mt-1.5 text-xs font-medium text-red-600">{form.errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-main block mb-1.5" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          name="email"
          value={form.values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          type="email"
          placeholder="you@domain.com"
          className={`w-full px-3 py-2 rounded-lg border bg-surface text-main placeholder-muted focus:outline-none focus:ring-2 transition-all ${
            form.errors.email && form.touched.email
              ? 'border-red-500 focus:ring-red-200'
              : 'border-token focus:ring-blue-200'
          }`}
          autoComplete="email"
          disabled={form.isLoading}
        />
        {form.errors.email && form.touched.email && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{form.errors.email}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-bold text-main block mb-1.5" htmlFor="signup-password">
          Password
        </label>
        <div className="relative">
          <input
            id="signup-password"
            name="password"
            value={form.values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            className={`w-full px-3 py-2 pr-10 rounded-lg border bg-surface text-main placeholder-muted focus:outline-none focus:ring-2 transition-all ${
              form.errors.password && form.touched.password
                ? 'border-red-500 focus:ring-red-200'
                : 'border-token focus:ring-blue-200'
            }`}
            disabled={form.isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
            disabled={form.isLoading}
          >
            {showPassword ? (
              <VisibilityOff fontSize="small" />
            ) : (
              <Visibility fontSize="small" />
            )}
          </button>
        </div>
        {form.errors.password && form.touched.password && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{form.errors.password}</p>
        )}
        <PasswordRequirements
          password={form.values.password}
          confirmPassword={form.values.confirmPassword}
        />
      </div>

      <div>
        <label
          className="text-sm font-bold text-main block mb-1.5"
          htmlFor="signup-confirm"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="signup-confirm"
            name="confirmPassword"
            value={form.values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            type={showConfirm ? 'text' : 'password'}
            placeholder="Confirm password"
            className={`w-full px-3 py-2 pr-10 rounded-lg border bg-surface text-main placeholder-muted focus:outline-none focus:ring-2 transition-all ${
              form.errors.confirmPassword && form.touched.confirmPassword
                ? 'border-red-500 focus:ring-red-200'
                : 'border-token focus:ring-blue-200'
            }`}
            disabled={form.isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
            disabled={form.isLoading}
          >
            {showConfirm ? (
              <VisibilityOff fontSize="small" />
            ) : (
              <Visibility fontSize="small" />
            )}
          </button>
        </div>
        {form.errors.confirmPassword && form.touched.confirmPassword && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {form.errors.confirmPassword}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={form.isLoading}
        className="w-full px-4 py-2.5 bg-[#2f6b3f] text-white rounded-lg font-semibold transition-all hover:bg-[#285636] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {form.isLoading ? (
          <>
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-token" />
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted">OR</span>
        <div className="h-px flex-1 bg-token" />
      </div>

      <button
        type="button"
        onClick={() => startGoogleSignIn((message) => form.setFieldError('submit', message))}
        disabled={form.isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-token bg-surface px-4 py-2.5 text-sm font-bold text-main shadow-sm transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleMark />
        Continue with Google
      </button>

      <div className="text-center text-sm font-medium text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-main underline-offset-2 hover:underline">
          Log in
        </Link>
      </div>

      {isEmbedded && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full px-4 py-2.5 border border-token text-main rounded-lg font-semibold hover:bg-surface-alt transition-all"
        >
          Close
        </button>
      )}
    </form>
  )
}
