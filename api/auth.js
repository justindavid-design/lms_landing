import express from 'express'
import supabase from '../lib/supabase-admin.js'

const router = express.Router()

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Validate strong password requirements
    const passwordErrors = []
    if (password.length < 8) passwordErrors.push('at least 8 characters')
    if (!/[A-Z]/.test(password)) passwordErrors.push('an uppercase letter')
    if (!/[a-z]/.test(password)) passwordErrors.push('a lowercase letter')
    if (!/\d/.test(password)) passwordErrors.push('a number')
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) passwordErrors.push('a special character')

    if (passwordErrors.length > 0) {
      return res.status(400).json({ error: `Password must contain ${passwordErrors.join(', ')}` })
    }

    // Create user via Supabase
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName || email.split('@')[0],
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return res.status(409).json({ error: 'Email already registered' })
      }
      throw error
    }

    res.status(201).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        display_name: data.user.user_metadata?.display_name,
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

/**
 * POST /api/auth/login
 * Login user (returns session from Supabase)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (error) {
      if (error.status === 400) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }
      throw error
    }

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        display_name: data.user.user_metadata?.display_name,
      },
      session: data.session,
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token required' })
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    })

    if (error) throw error

    res.json({
      session: data.session,
    })
  } catch (err) {
    console.error('Refresh error:', err)
    res.status(401).json({ error: 'Refresh failed' })
  }
})

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', async (req, res) => {
  try {
    const { refresh_token } = req.body

    if (refresh_token) {
      await supabase.auth.admin.deleteUser(refresh_token)
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Logout error:', err)
    res.status(500).json({ error: 'Logout failed' })
  }
})

export default router
