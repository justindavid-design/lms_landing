import React, { createContext, useContext, useEffect, useState } from 'react'
import supabase from './supabaseClient'

const AuthContext = createContext({ user: null })

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadUser(){
      try {
        const { data } = await supabase.auth.getUser()
        if (mounted) setUser(data?.user ?? null)
      } catch (err) {
        console.warn('getUser failed', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
    })

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe && listener.subscription.unsubscribe()
    }
  }, [])

  const value = { user, loading }
  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}

export default AuthContext
