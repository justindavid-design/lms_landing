import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import supabase from '../lib/supabaseClient'

export default function RecoverReset(){
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(()=>{
    let mounted = true
    async function init(){
      const email = sessionStorage.getItem('recoverEmail')
      if(email) return
      try{
        // Try to consume a Supabase session from the URL (recovery link)
        try{
          const { data: sessionData, error: sessionError } = await supabase.auth.getSessionFromUrl()
          if(sessionError){
            console.warn('getSessionFromUrl error', sessionError)
          }
          if(sessionData?.session?.user){
            // Clean the URL (remove hash fragment) so it doesn't leak tokens
            if(window?.location?.hash){
              history.replaceState(null, document.title, window.location.pathname + window.location.search)
            }
            return
          }
        }catch(e){
          // Not fatal — continue to getUser fallback
          console.debug('getSessionFromUrl not applicable', e)
        }

        const { data } = await supabase.auth.getUser()
        const user = data?.user ?? null
        if(!user){
          if(mounted) navigate('/recover')
        }
      }catch(err){
        console.warn('Supabase session handling failed', err)
        if(mounted) navigate('/recover')
      }
    }
    init()
    return ()=>{ mounted = false }
  },[])

  function handleSubmit(e){
    e.preventDefault()
    setError('')
    if(pwd.length < 8) return setError('Password should be at least 8 characters')
    if(pwd !== pwd2) return setError('Passwords do not match')
    const email = sessionStorage.getItem('recoverEmail')
    if(!email){
      // Attempt Supabase password update for recovery flow
      (async ()=>{
        try{
          const { data, error } = await supabase.auth.updateUser({ password: pwd })
          if(error) throw error
          alert('Password updated. You are signed in. Redirecting to dashboard...')
          navigate('/dashboard')
        }catch(err){
          console.warn('Failed to update password via Supabase', err)
          setError(err.message || String(err))
        }
      })()
      return
    }

    // Demo flow
    sessionStorage.removeItem('recoverEmail')
    alert('Password updated (demo). Please log in with your new password.')
    navigate('/login')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden"
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
              <h1 className="hero-title text-black mb-4">Reset Password</h1>
              <p className="text-lg text-black-700 max-w-xl font-['Montserrat']">
                Set a new password for your account. Make sure it's something secure that you haven't used before.
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


        <div className="relative z-20 ml-auto w-full max-w-md font-['Montserrat']">
          <div className="card">
            <Link to="/recover/verify" aria-label="Go back" className="mb-4 inline-block text-black/70 p-0">
              <img src="/src/assets/back.png" alt="back" className="w-6 h-6" />
            </Link>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-700 block mb-1">New password</label>
                <input value={pwd} onChange={e=>setPwd(e.target.value)} type="password" placeholder="New password" className="input-base" />
              </div>

              <div>
                <label className="text-sm text-gray-700 block mb-1">Confirm password</label>
                <input value={pwd2} onChange={e=>setPwd2(e.target.value)} type="password" placeholder="Confirm password" className="input-base" />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div>
                <button type="submit" className="primary-btn">Set password</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
