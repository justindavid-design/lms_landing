import React from 'react'
import { useGoogleAuth } from '../lib/GoogleAuthProvider'
import { useNavigate } from 'react-router-dom'

/**
 * Google Logout Button Component
 * Handles user logout and cleanup
 */
export default function GoogleLogoutButton({ 
  className = '',
  variant = 'button',
  children = 'Logout'
}) {
  const { logout, token } = useGoogleAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      // Notify Google of logout
      if (window.google) {
        window.google.accounts.id.disableAutoSelect()
      }

      // Clear local session
      logout()

      // Redirect to home or login
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Logout error:', err)
      // Still log out even if Google notification fails
      logout()
      navigate('/', { replace: true })
    }
  }

  // Only show if user is logged in via Google
  if (!token) {
    return null
  }

  if (variant === 'link') {
    return (
      <button
        onClick={handleLogout}
        className={`text-main hover:underline underline-offset-4 ${className}`}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100 transition-colors ${className}`}
    >
      {children}
    </button>
  )
}
