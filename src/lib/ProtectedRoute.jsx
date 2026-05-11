import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAccount } from './AccountContext'
import Loading from '../components/Loading'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAccount()

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

/**
 * Optional: Higher-order component for class components
 */
export function withProtectedRoute(Component) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
