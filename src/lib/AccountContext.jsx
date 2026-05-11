import React, { createContext, useContext, useState, useEffect } from 'react'
import supabase from './supabaseClient'

const AccountContext = createContext()

async function registerWithDuplicateCheck(email, password, displayName) {
  const normalizedEmail = email.trim().toLowerCase()

  if (import.meta.env.VITE_USE_SERVER_REGISTER === 'true') {
    try {
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          displayName,
        }),
      })

      const registerPayload = await registerResponse.json().catch(() => ({}))
      if (registerResponse.ok) {
        return registerPayload
      }

      if (registerResponse.status !== 500 && registerResponse.status !== 503) {
        throw new Error(registerPayload.error || 'Signup failed')
      }
    } catch (err) {
      if (!String(err?.message || '').includes('Failed to fetch')) {
        throw err
      }
    }
  }

  const { data, error: signUpError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        display_name: displayName,
        full_name: displayName,
      },
    },
  })

  if (signUpError) throw signUpError

  if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('This email is already registered. Try logging in instead.')
  }

  return { user: data?.user, session: data?.session }
}

export function AccountProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAuthPanel, setShowAuthPanel] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
        }
      } catch (err) {
        console.warn('Session restore failed:', err)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const login = async (email, password) => {
    setError(null)
    setLoading(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (signInError) {
        const message = 
          signInError.status === 401 
            ? 'Invalid email or password'
            : signInError.message
        throw new Error(message)
      }

      setUser(data.user)
      setShowAuthPanel(false)
      return { success: true }
    } catch (err) {
      const message = err.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email, password, confirmPassword) => {
    setError(null)

    if (password !== confirmPassword) {
      const err = 'Passwords do not match'
      setError(err)
      return { success: false, error: err }
    }

    setLoading(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const registerPayload = await registerWithDuplicateCheck(
        normalizedEmail,
        password,
        normalizedEmail.split('@')[0]
      )

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (signInError) {
        throw new Error('Account created, but automatic login failed. Please log in.')
      }

      setUser(data.user || registerPayload.user)
      setShowAuthPanel(false)
      return { success: true }
    } catch (err) {
      const message = err.message || 'Signup failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const openAuthPanel = (mode = 'login') => {
    setAuthMode(mode)
    setShowAuthPanel(true)
    setError(null)
  }

  const closeAuthPanel = () => {
    setShowAuthPanel(false)
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    showAuthPanel,
    authMode,
    login,
    signup,
    logout,
    openAuthPanel,
    closeAuthPanel,
    setAuthMode,
  }

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error('useAccount must be used within AccountProvider')
  }
  return context
}
