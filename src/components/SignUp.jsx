import React from 'react'
import { Link } from 'react-router-dom'

export default function SignUp(){
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
              <h1 className="hero-title text-black mb-4">Heading goes here</h1>
              <p className="text-lg text-gray-700 max-w-xl">
                Join us to start learning. Create an account to save your progress and get personalized recommendations.
              </p>

              <div className="mt-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-full"></div>
                <div className="font-bold">logoipsum</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 ml-auto w-full max-w-md">
          <div className="card">
            <Link to="/" aria-label="Go back" className="mb-4 inline-block text-black/70 p-0">
              <img src="/src/assets/back.png" alt="back" className="w-6 h-6" />
            </Link>
            <h2 className="card-title mb-2">Create Account</h2>
            <p className="text-sm text-gray-500 mb-6">Please enter your details to create an account.</p>

            <form className="space-y-4">
              <div>
                <label className="text-sm text-gray-700 block mb-1">Full name</label>
                <input type="text" placeholder="Your name" className="input-base" />
              </div>

              <div>
                <label className="text-sm text-gray-700 block mb-1">Email</label>
                <input type="email" placeholder="Email....." className="input-base" />
              </div>

              <div>
                <label className="text-sm text-gray-700 block mb-1">Password</label>
                <input type="password" placeholder="Password....." className="input-base" />
              </div>

              <div>
                <label className="text-sm text-gray-700 block mb-1">Confirm password</label>
                <input type="password" placeholder="Confirm password....." className="input-base" />
              </div>

              <div>
                <button type="submit" className="primary-btn">Create account</button>
              </div>

              <div className="text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-black font-medium">Log in</Link></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
