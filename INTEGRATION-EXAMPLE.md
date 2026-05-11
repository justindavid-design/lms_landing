# Complete Integration Example

This guide shows how to integrate all Google Sign-In components into your existing React application.

## File: src/main.jsx (Updated)

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Import the Google Auth Provider
import { GoogleAuthProvider } from './lib/GoogleAuthProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap everything with Google Auth Provider */}
    <GoogleAuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleAuthProvider>
  </React.StrictMode>
)
```

## File: src/App.jsx (Updated)

```jsx
import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { useGoogleAuth } from './lib/GoogleAuthProvider'

// Components
import About from './components/About'
import Features from './components/Features'
import Footer from './components/Footer'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import LoginWithGoogle from './components/LoginWithGoogle'
import PasswordReset from './components/PasswordReset'
import RecoverEmail from './components/RecoverEmail'
import RecoverReset from './components/RecoverReset'
import RecoverVerify from './components/RecoverVerify'
import SignUp from './components/SignUp'
import Testimonials from './components/Testimonials'

// Dashboard components
import Archived from './components/dashboard/Archived'
import Calendar from './components/dashboard/Calendar'
import CourseDetails from './components/dashboard/CourseDetails'
import Courses from './components/dashboard/Courses'
import Dashboard from './components/dashboard/dashboard'
import EnrollPage from './components/dashboard/EnrollPage'
import Settings from './components/dashboard/Settings'
import Tasks from './components/dashboard/Tasks'
import Notifications from './components/Notifications'

// Route protection
import ProtectedRoute from './lib/ProtectedRoute'
import { CourseContextProvider } from './lib/CourseNameContext'
import { NotificationProvider } from './lib/NotificationContext'

/**
 * Landing Page (public)
 */
function Landing() {
  return (
    <div className="font-sans text-main">
      <Hero />
      <main className="relative z-10 bg-transparent">
        <Features />
        <HowItWorks />
        <About />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

/**
 * Main App Component
 */
export default function App() {
  return (
    <CourseContextProvider>
      <NotificationProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<LoginWithGoogle />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/recover" element={<RecoverEmail />} />
          <Route path="/recover/verify" element={<RecoverVerify />} />
          <Route path="/recover/reset" element={<RecoverReset />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          
          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Courses />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetails />} />
            <Route path="courses/:id/enroll" element={<EnrollPage />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<Settings />} />
            <Route path="archived" element={<Archived />} />
          </Route>

          {/* Notifications (protected) */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Catch-all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </CourseContextProvider>
  )
}
```

## File: src/components/Navbar.jsx (Updated Example)

```jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleAuth } from '../lib/GoogleAuthProvider'
import GoogleLogoutButton from './GoogleLogoutButton'

export default function Navbar() {
  const { isAuthenticated, user } = useGoogleAuth()
  const navigate = useNavigate()

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="font-bold text-xl">
          Academee
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-4 items-center">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn-secondary">
                Log In
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="btn-secondary">
                Dashboard
              </Link>
              
              {/* User Profile Section */}
              <div className="flex items-center gap-3">
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm">{user?.name}</span>
              </div>

              {/* Logout Button */}
              <GoogleLogoutButton variant="link" children="Logout" />
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
```

## File: src/components/dashboard/Settings.jsx (Protected Component Example)

```jsx
import React, { useEffect, useState } from 'react'
import { useGoogleAuth } from '../../lib/GoogleAuthProvider'
import { useAuthenticatedFetch } from '../../lib/GoogleAuthProvider'

export default function Settings() {
  const { user } = useGoogleAuth()
  const fetchWithAuth = useAuthenticatedFetch()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // This request automatically includes the auth token
        const response = await fetchWithAuth(`/api/profiles/${user?.userId}`)

        if (!response.ok) {
          throw new Error('Failed to load profile')
        }

        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user?.userId) {
      loadProfile()
    }
  }, [user?.userId, fetchWithAuth])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* User Profile */}
      <div className="bg-white rounded-lg p-6 shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Profile Information</h2>

        <div className="flex items-center gap-4 mb-6">
          {user?.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <p className="font-bold">{user?.name}</p>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500">
              Authenticated via: {user?.authProvider}
            </p>
          </div>
        </div>

        {/* Profile Data from DB */}
        {profile && (
          <div className="border-t pt-4">
            <p className="text-sm">
              <strong>Member Since:</strong> {profile.created_at}
            </p>
            <p className="text-sm">
              <strong>Role:</strong> {profile.role}
            </p>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Preferences</h2>
        {/* Add preference settings here */}
      </div>
    </div>
  )
}
```

## Updated api-server.js Configuration

```javascript
// Partial example showing CORS and rate limiting setup
require('dotenv').config()
const express = require('express')
const path = require('path')

// Import security middleware
const securityMiddleware = require(path.resolve(__dirname, 'api', 'security-middleware'))

// Import auth handlers
const googleAuth = require(path.resolve(__dirname, 'api', 'google-auth'))
const authMiddleware = require(path.resolve(__dirname, 'api', 'auth-middleware'))

const app = express()
const PORT = process.env.API_PORT || 8787
const HOST = process.env.API_HOST || '0.0.0.0'
const NODE_ENV = process.env.NODE_ENV || 'development'

// ========== Middleware ==========
app.use(express.json())

// Security middleware
app.use(securityMiddleware.corsMiddleware(NODE_ENV))
app.use(securityMiddleware.securityHeaders)
app.use(securityMiddleware.requestLogger)

// Rate limiting
const generalLimiter = securityMiddleware.createRateLimiter(100, 15 * 60 * 1000)
const authLimiter = securityMiddleware.createAuthRateLimiter(5, 15 * 60 * 1000)

app.use('/api/', generalLimiter)

// ========== Health Check ==========
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'lms-api' })
})

// ========== Google OAuth Routes ==========
app.post('/api/auth/google', authLimiter, async (req, res) => {
  try {
    await googleAuth(req, res)
  } catch (err) {
    console.error('Google auth error:', err)
    res.status(500).json({ error: 'Authentication failed' })
  }
})

app.post('/api/auth/refresh', (req, res) => {
  authMiddleware.refreshToken(req, res)
})

app.get('/api/auth/verify', authMiddleware.verifyAuthToken, (req, res) => {
  res.status(200).json({ success: true, user: req.user })
})

// ========== More routes... ==========
// ... (existing routes as before)

// ========== 404 Handling ==========
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

// ========== Error Handling ==========
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

// ========== Server Startup ==========
const server = app.listen(PORT, HOST, () => {
  console.log(`API dev server listening on http://${HOST}:${PORT}`)
  console.log(`Environment: ${NODE_ENV}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`)
    process.exit(1)
  }
  console.error('Server error:', err)
  process.exit(1)
})
```

## Testing the Integration

### 1. Start Both Servers

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run api
```

### 2. Test Login Flow

1. Navigate to `http://localhost:5173/login`
2. Click "Sign in with Google"
3. Use a test account
4. Verify redirect to dashboard
5. Check browser sessionStorage for `auth_token`

### 3. Test Token Refresh

1. Wait or manually invoke token refresh
2. Open DevTools → Application → sessionStorage
3. Token should be updated

### 4. Test Protected Routes

1. Try accessing `/dashboard` without logging in
2. Should redirect to login
3. After login, dashboard should load

### 5. Test API Calls with Auth

1. Open DevTools → Network
2. Make API request
3. Check Authorization header in request
4. Should show: `Authorization: Bearer <token>`

### 6. Test Logout

1. Click logout button
2. Should redirect to home
3. sessionStorage should be cleared
4. `/dashboard` should redirect to login

## Troubleshooting Integration

| Issue | Solution |
|-------|----------|
| CORS error | Check `origin` in security-middleware matches your domain |
| Token not sent | Ensure `useAuthenticatedFetch()` hook is used, not plain `fetch` |
| Login doesn't redirect | Check `ProtectedRoute` and navigation logic |
| User data not found | Verify database migration ran and profiles table exists |
| API returns 401 | Check JWT_SECRET consistency, verify token hasn't expired |

