import React, { createContext, useContext, useEffect, useState } from 'react'
import supabase from './supabaseClient'

const AuthContext = createContext({ user: null })

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [profileName, setProfileName] = useState('Learner')

  useEffect(() => {
    let mounted = true
    async function loadUser(){
      try {
        const { data } = await supabase.auth.getUser()
        if (mounted) setUser(data?.user ?? null)
        if (data?.user?.id) window.localStorage.setItem('academee_last_user_id', data.user.id)
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
      if (u?.id) window.localStorage.setItem('academee_last_user_id', u.id)
      else window.localStorage.removeItem('academee_last_user_id')
    })

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe && listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100)

    const getProfile = async () => {
      try{
        const res = await supabase.auth.getUser()
        const user = res?.data?.user
        console.debug('AuthProvider.getProfile: auth user', user)
        if (user) {
          const { data, error, status } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .maybeSingle()

          console.debug('AuthProvider.getProfile: profile query', { data, error, status })
          if (data && !error && data.display_name) {
            setProfileName(data.display_name)
          } else {
            setProfileName(user.user_metadata?.full_name || user.email || 'Learner')
            if (status === 406) console.warn('Profile query returned 406; falling back to user metadata')
          }
        }
      }catch(err){ console.warn('getProfile failed', err) }
    }

    getProfile()
    return () => clearTimeout(t)
  }, [])

  const value = { user, loading, isVisible, profileName }
  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}

export default AuthContext