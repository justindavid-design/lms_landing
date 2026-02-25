import React from 'react'
import { Link } from 'react-router-dom'

export default function Login(){
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
      <div className="relative w-full max-w-6xl px-6 md:px-12 lg:px-20">
        {/* left green blobs */}
        <div className="absolute inset-y-0 left-0 w-1/2 flex items-center">
          <div className="relative w-full">
            <div className="relative z-10 max-w-xl pl-8 md:pl-12 lg:pl-16 py-12">
              <h1 className="hero-title text-black mb-4">Ready for the next challenge?</h1>
              <p className="text-lg text-gray-700 max-w-xl">
                Your personalized dashboard is waiting. Dive back into your modules and see how much you've improved today.
              </p>

              <div className="mt-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-full"></div>
                <div className="font-bold">logoipsum</div>
              </div>
            </div>
          </div>
        </div>

        {/* right card */}
        <div className="relative z-20 ml-auto w-full max-w-md">
          <div className="card">
            <Link to="/" aria-label="Go back" className="mb-4 inline-block text-black/80 p-0">
              <img src="/src/assets/back.png" alt="back" className="w-6 h-6" />
            </Link>
            <h2 className="card-title mb-2">Get Started Now</h2>
            <p className="text-sm text-gray-500 mb-6">Please log in to your account to continue.</p>

            <form className="space-y-4">
              <div>
                <label className="text-sm text-gray-700 block mb-1">Email</label>
                <input type="email" placeholder="Email....." className="input-base" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-gray-700">Password</label>
                  <a href="/recover" className="text-sm text-gray-500 italic">Forgotten?</a>
                </div>
                <input type="password" placeholder="Password....." className="input-base" />
              </div>

              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" className="w-4 h-4" />
                <label htmlFor="remember" className="text-sm text-gray-700">Remember Me!</label>
              </div>

              <div>
                <button type="submit" className="primary-btn">Log in</button>
              </div>

              <div className="text-center text-sm text-gray-500">Don't Have Account? <Link to="/signup" className="text-black font-medium">Sign up</Link></div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="text-xs text-gray-400">or</div>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div>
                <button type="button" className="w-full border border-gray-300 rounded-md py-3 flex items-center justify-center gap-2">
                  <span className="bg-white rounded-full w-6 h-6 flex items-center justify-center">G</span>
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
