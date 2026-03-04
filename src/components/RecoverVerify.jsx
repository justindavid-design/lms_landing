import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function RecoverVerify(){
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  useEffect(()=>{
    const e = sessionStorage.getItem('recoverEmail') || ''
    setEmail(e)
  },[])

  function handleSubmit(e){
    e.preventDefault()
    setError('')
    if(!code) return setError('Enter the verification code')
    (async ()=>{
      try{
        const email = sessionStorage.getItem('recoverEmail')
        const resp = await fetch('/api/verify-otp', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, otp: code }) })
        const text = await resp.text()
        let data = null
        try{ data = text ? JSON.parse(text) : null }catch(e){ /* ignore parse error */ }
        if(!resp.ok) throw new Error(data?.error || text || `Invalid code (status ${resp.status})`)
        navigate('/recover/reset')
      }catch(err){
        console.error('verify-otp error', err)
        setError(err.message || String(err))
      }
    })()
  }

  function resend(){
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    sessionStorage.setItem('recoverOtp', otp)
    console.log('Resent OTP (demo):', otp)
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
              <h1 className="hero-title text-black mb-4">Verify Code</h1>
              <p className="text-lg text-black-700 max-w-xl font-['Montserrat']">
                We sent a verification code to <strong>{email}</strong>. Enter it below.
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
            <Link to="/recover" aria-label="Go back" className="mb-4 inline-block text-black/70 p-0">
              <img src="/src/assets/back.png" alt="back" className="w-6 h-6" />
            </Link>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-700 block mb-1">Verification code</label>
                <input value={code} onChange={e=>setCode(e.target.value)} type="text" placeholder="123456" className="input-base" />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex gap-3">
                <button type="submit" className="flex-1 primary-btn">Verify</button>
                <button type="button" onClick={resend} className="flex-1 border border-gray-300 py-3 rounded-md">Resend</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
