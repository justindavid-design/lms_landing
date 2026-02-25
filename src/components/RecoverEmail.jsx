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
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    sessionStorage.setItem('recoverEmail', email)
    sessionStorage.setItem('recoverOtp', otp)
    console.log('Generated OTP (demo):', otp)
    navigate('/recover/verify')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden"
      style={{
        backgroundImage: "url('/src/assets/image.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
        backgroundSize: '60%'
      }}
    >
      <div className="relative w-full max-w-6xl px-6 md:px-12 lg:px-20">
        <div className="absolute inset-y-0 left-0 w-1/2 flex items-center">
          <div className="relative w-full">
            <div className="relative z-10 max-w-xl pl-8 md:pl-12 lg:pl-16 py-12">
              <h1 className="hero-title text-black mb-4">Password Recovery</h1>
              <p className="text-lg text-gray-700 max-w-xl">
                Enter your email and we'll send a verification code to reset your password.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-20 ml-auto w-full max-w-md">
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
