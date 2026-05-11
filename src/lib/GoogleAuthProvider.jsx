import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

/**
 * Google Auth Context
 * Manages user authentication state and token management
 */
const GoogleAuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  error: null,
  logout: () => {},
  setUser: () => {},
  refreshAccessToken: () => {},
})

export function GoogleAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Initialize auth state from session storage
   */
  useEffect(() => {
    const storedToken = sessionStorage.getItem('auth_token')
    const storedRefreshToken = sessionStorage.getItem('refresh_token')
    const storedUserId = sessionStorage.getItem('user_id')

    if (storedToken && storedUserId) {
      setToken(storedToken)
      setRefreshToken(storedRefreshToken)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [])

  /**
   * Refresh access token using refresh token
   */
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      logout()
      return false
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      const newToken = data.token

      setToken(newToken)
      sessionStorage.setItem('auth_token', newToken)

      return true
    } catch (err) {
      console.error('Token refresh error:', err)
      logout()
      return false
    }
  }, [refreshToken])

  /**
   * Logout user and clear session
   */
  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setRefreshToken(null)

    // Clear session storage
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('refresh_token')
    sessionStorage.removeItem('user_id')

    setError(null)
  }, [])

  /**
   * Set up token refresh interval
   * Refresh token 5 minutes before expiration
   */
  useEffect(() => {
    if (!token) return

    // Decode token to get expiration time
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return

      const decoded = JSON.parse(atob(parts[1]))
      const expiresAt = decoded.exp * 1000 // Convert to milliseconds

      // Schedule refresh 5 minutes before expiration
      const timeUntilRefresh = expiresAt - Date.now() - 5 * 60 * 1000

      if (timeUntilRefresh > 0) {
        const timer = setTimeout(() => {
          refreshAccessToken()
        }, timeUntilRefresh)

        return () => clearTimeout(timer)
      }
    } catch (err) {
      console.warn('Token decode error:', err)
    }
  }, [token, refreshAccessToken])

  const value = {
    user,
    loading,
    isAuthenticated: !!token,
    token,
    refreshToken,
    error,
    logout,
    setUser,
    refreshAccessToken,
  }

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  )
}

/**
 * Hook to use Google Auth context
 */
export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext)
  if (!context) {
    throw new Error('useGoogleAuth must be used within GoogleAuthProvider')
  }
  return context
}

/**
 * Hook to get authentication headers with token
 */
export function useAuthHeaders() {
  const { token } = useGoogleAuth()

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

/**
 * Custom fetch hook that includes auth headers and token refresh logic
 */
export function useAuthenticatedFetch() {
  const { token, refreshAccessToken } = useGoogleAuth()

  const fetchWithAuth = useCallback(
    async (url, options = {}) => {
      let headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      let response = await fetch(url, {
        ...options,
        headers,
      })

      // If token expired, try to refresh
      if (response.status === 401) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          const newToken = sessionStorage.getItem('auth_token')
          headers.Authorization = `Bearer ${newToken}`
          response = await fetch(url, {
            ...options,
            headers,
          })
        }
      }

      return response
    },
    [token, refreshAccessToken]
  )

  return fetchWithAuth
}
