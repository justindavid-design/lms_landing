import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import supabase from '../lib/supabaseClient'

export default function SignUp(){
  const navigate = useNavigate();
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mapSignUpError = (err) => {
    const raw = (err?.message || String(err) || '').toLowerCase()

    if (raw.includes('sending confirmation email') || raw.includes('confirmation email')) {
      return 'We could not send the confirmation email right now. Please try again later, or ask support/admin to configure Supabase SMTP or disable email confirmation in Auth settings for development.'
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
    if (password !== confirm) return setError('Passwords do not match')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { display_name: name || email },
        },
      })
      if (signUpError) throw signUpError
      const user = data?.user
      if (user) {
        // create profile server-side
        try {
          await fetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, display_name: name || user.email })
          })
        } catch (err) {
          console.warn('profile create failed', err)
        }
        navigate('/')
      } else {
        // user may need email confirmation; navigate to login and show notice
        navigate('/login')
      }
    } catch (err) {
      setError(mapSignUpError(err))
    } finally {
      setLoading(false)
    }
  }
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-app relative overflow-hidden"
      style={{
        backgroundImage: "url('/src/assets/image.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
        backgroundSize: '90%'
      }}
    >
      <div className="relative w-full max-w-6xl px-6 md:px-12 lg:px-20 font-['Poppins']">
        <div className="absolute inset-y-0 left-0 w-1/2 flex items-center">
          <div className="relative w-full">
            <div className="relative z-10 max-w-xl pl-8 md:pl-12 lg:pl-16 py-12">
              <h1 className="hero-title text-black mb-4">Create Account</h1>
              <p className="text-lg text-black-700 max-w-xl font-['Montserrat']">
                Join us to start learning. Create an account to save your progress and get personalized recommendations.
              </p>

              <div className="mt-10 flex items-center gap-3">
                <div className="font-bold">
                  <img src="/src/assets/logo_bw.png" 
                    alt="logoipsum branding" 
                    className="w-[200px] h-[84px] object-contain" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 ml-auto w-full max-w-md font-['Montserrat']">
          <div className="card">
            <Link to="/" aria-label="Go back" className="mb-4 inline-block text-black/70 p-0">
              <img src="/src/assets/back.png" alt="back" className="w-6 h-6" />
            </Link>
            <h2 className="card-title mb-2 font-['Poppins']">Create Account</h2>
            <p className="text-sm text-gray-500 mb-6">Please enter your details to create an account.</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm text-gray-700 block mb-1">Full name</label>
                <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Your name" className="input-base" />
              </div>

              <div>
                <label className="text-sm text-gray-700 block mb-1">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email....." className="input-base" />
              </div>

              <div>
                <label className="text-sm text-gray-700 block mb-1">Password</label>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password....." className="input-base" />
              </div>

              <div>
                <label className="text-sm text-gray-700 block mb-1">Confirm password</label>
                <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" placeholder="Confirm password....." className="input-base" />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}
              <div>
                <button disabled={loading} type="submit" className="primary-btn">{loading ? 'Creating...' : 'Create account'}</button>
              </div>

              <div className="text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-black font-medium">Log in</Link></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
