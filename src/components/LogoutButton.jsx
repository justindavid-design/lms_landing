import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabaseClient'

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
      className="flex items-center gap-4 px-6 py-3 w-full text-left rounded-md hover-surface transition-colors text-muted"
    >
      <img src="/src/assets/lg.png" alt="logout" className="w-5 h-5 object-contain grayscale opacity-70" />
      {isOpen && (
        <span className="text-sm font-medium">{loading ? 'Signing out...' : 'Sign out'}</span>
      )}
    </button>
  )
}
