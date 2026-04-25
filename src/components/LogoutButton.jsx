import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabaseClient'

function DynamicSvgIcon({ src, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-5 w-5 ${className}`}
      style={{
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  )
}

export default function LogoutButton({ isOpen = true }){
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      navigate('/')
    } catch (err) {
      console.warn('logout failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-4 cursor-pointer transition-all text-muted hover-surface ${
        isOpen ? 'px-4' : 'px-6 justify-center'
      } py-3`}
    >
      <DynamicSvgIcon src="/src/assets/logout.svg" className="opacity-70" />
      {isOpen && (
        <span className="text-sm font-medium">{loading ? 'Signing out...' : 'Sign out'}</span>
      )}
    </button>
  )
}
