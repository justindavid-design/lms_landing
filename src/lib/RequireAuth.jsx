import React from 'react'
import Loading from './../components/Loading'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()

  if (loading) return <div className="p-8"><Loading message="Checking authentication..." /></div>
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />
  return children
}
