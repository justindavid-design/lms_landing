import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function RecoverReset(){
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(()=>{
    const email = sessionStorage.getItem('recoverEmail')
    if(!email){
      navigate('/recover')
    }
  },[])

  function handleSubmit(e){
    e.preventDefault()
    setError('')
    if(pwd.length < 8) return setError('Password should be at least 8 characters')
    if(pwd !== pwd2) return setError('Passwords do not match')
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
        backgroundSize: '70%'
      }}
    >
      <div className="relative w-full max-w-6xl px-6 md:px-12 lg:px-20">
        <div className="absolute inset-y-0 left-0 w-1/2 flex items-center">
          <div className="relative w-full">
            <div className="relative z-10 max-w-xl pl-8 md:pl-12 lg:pl-16 py-12">
              <h1 className="hero-title text-black mb-4">Set New Password</h1>
              <p className="text-lg text-gray-700 max-w-xl">Choose a strong password for your account.</p>
            </div>
          </div>
        </div>

        <div className="relative z-20 ml-auto w-full max-w-md">
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
