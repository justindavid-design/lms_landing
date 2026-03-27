import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import supabase from '../lib/supabaseClient'

export default function Login(){
  const navigate = useNavigate();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      const user = data?.user
      if (user) {
        // Prefer server-side upsert (uses service-role key) to avoid RLS issues with anon client
        try {
          const display_name = user.user_metadata?.full_name || user.email.split('@')[0]
          const resp = await fetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, display_name, role: 'student' })
          })
          if (!resp.ok) {
            console.warn('server profile upsert failed', resp.status, await resp.text())
            // fallback to client-side upsert (may fail due to RLS)
            try {
              const upsertRes = await supabase.from('profiles').upsert({ id: user.id, display_name, role: 'student' }, { onConflict: ['id'] })
              console.debug('client profile upsert result', upsertRes)
            } catch (err) {
              console.warn('client profile upsert also failed', err)
            }
          } else {
            console.debug('server profile upsert ok')
          }
        } catch (err) {
          console.warn('server profile upsert error', err)
          // try client-side upsert as a last resort
          try {
            const display_name = user.user_metadata?.full_name || user.email.split('@')[0]
            const upsertRes = await supabase.from('profiles').upsert({ id: user.id, display_name, role: 'student' }, { onConflict: ['id'] })
            console.debug('client profile upsert result', upsertRes)
          } catch (err2) {
            console.warn('client profile upsert failed', err2)
          }
        }
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || String(err))
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
      <div className="font-['Poppins'] relative w-full max-w-6xl px-6 md:px-12 lg:px-20">
        {/* left green blobs */}
        <div className="absolute inset-y-0 left-0 w-1/2 flex items-center">
          <div className="relative w-full">
            <div className="relative z-10 max-w-xl pl-8 md:pl-12 lg:pl-16 py-12">
              <h1 className="hero-title text-black mb-4">Ready for the next challenge?</h1>
              <p className="text-lg text-black-700 max-w-xl font-['Montserrat']">
                Your personalized dashboard is waiting. Dive back into your modules and see how much you've improved today.
              </p>

              <div className="mt-8 flex items-center gap-3">
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

        {/* right card */}
        <div className="font-['Montserrat'] relative z-20 ml-auto w-full max-w-md">
          <div className="card">
            <Link to="/" aria-label="Go back" className="mb-4 inline-block text-black/80 p-0">
              <img src="/src/assets/back.png" alt="back" className="w-6 h-6" />
            </Link>
            <h2 className="card-title mb-2 font-['Poppins']">Get Started Now</h2>
            <p className="text-sm text-gray-500 mb-6">Please log in to your account to continue.</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm text-gray-700 block mb-1">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email....." className="input-base" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-700">Password</label>
                  <a href="/recover" className="text-sm text-gray-500 italic">Forgotten?</a>
                </div>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password....." className="input-base" />
              </div>

              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" className="w-4 h-4" />
                <label htmlFor="remember" className="text-sm text-gray-700">Remember Me!</label>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}
              <div>
                <button disabled={loading} type="submit" className="primary-btn">{loading ? 'Signing in...' : 'Log in'}</button>
              </div>

              <div className="text-center text-sm text-gray-500">Don't Have Account? <Link to="/signup" className="text-black font-medium">Sign up</Link></div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="text-xs text-gray-400">or</div>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div>
                <button type="button" className="w-full border border-gray-300 rounded-md py-3 flex items-center justify-center gap-2">
                  <span className="bg-surface rounded-full w-6 h-6 flex items-center justify-center">G</span>
                  Log in with Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
