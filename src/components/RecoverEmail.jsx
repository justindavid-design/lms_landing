import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function RecoverEmail(){
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e){
    e.preventDefault()
    setError('')
    if(!email || !email.includes('@')){
      setError('Please enter a valid email')
      return
    }
    (async ()=>{
      try{
        const resp = await fetch('/api/send-otp', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
        const text = await resp.text()
        let data = null
        try{ data = text ? JSON.parse(text) : null }catch(e){ /* ignore parse error */ }
        if(!resp.ok) throw new Error(data?.error || text || `Failed to send OTP (status ${resp.status})`)
        sessionStorage.setItem('recoverEmail', email)
        navigate('/recover/verify')
      }catch(err){
        console.error('send-otp error', err)
        setError(err.message || String(err))
      }
    })()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-app relative overflow-hidden"
      style={{
        backgroundImage: "url('/src/assets/image.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
        backgroundSize: '100%'
      }}
    >
      <div className="font-['Poppins'] relative w-full max-w-6xl px-6 md:px-12 lg:px-20">
        {/* left green blobs */}
        <div className="absolute inset-y-0 left-0 w-1/2 flex items-center">
          <div className="relative w-full">
            <div className="relative z-10 max-w-xl pl-8 md:pl-12 lg:pl-16 py-12">
              <h1 className="hero-title text-black mb-4">Password Recovery</h1>
              <p className="text-lg text-black-700 max-w-xl font-['Montserrat']">
                Enter your email and we'll send a verification code to reset your password.
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
            <Link to="/login" aria-label="Go back" className="mb-4 inline-block text-black/70 p-0">
              <img src="/src/assets/back.png" alt="back" className="w-6 h-6" />
            </Link>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-700 block mb-1">Email</label>
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@domain.com" className="input-base" />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div>
                <button type="submit" className="primary-btn">Send code</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
