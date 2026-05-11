import express from 'express'
import supabase from '../lib/supabase-admin.js'
import { verifyAuthToken } from './auth-middleware.js'

const router = express.Router()

/**
 * GET /api/profile
 * Get current user's profile
 */
router.get('/', verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user.sub

    // Get user from auth
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError) throw userError

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.display_name,
      avatar: user.user_metadata?.avatar_url,
      createdAt: user.created_at,
    })
  } catch (err) {
    console.error('Get profile error:', err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

/**
 * PUT /api/profile
 * Update user's profile
 */
router.put('/', verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user.sub
    const { displayName, avatar } = req.body

    if (!displayName && !avatar) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    const userData = {}
    if (displayName) userData.display_name = displayName
    if (avatar) userData.avatar_url = avatar

    const { data: user, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: userData }
    )

    if (updateError) throw updateError

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.display_name,
      avatar: user.user_metadata?.avatar_url,
    })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

/**
 * PUT /api/profile/password
 * Update user's password
 */
router.put('/password', verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user.sub
    const { newPassword } = req.body

    if (!newPassword) {
      return res.status(400).json({ error: 'Password is required' })
    }

    // Validate strong password requirements
    const passwordErrors = []
    if (newPassword.length < 8) passwordErrors.push('at least 8 characters')
    if (!/[A-Z]/.test(newPassword)) passwordErrors.push('an uppercase letter')
    if (!/[a-z]/.test(newPassword)) passwordErrors.push('a lowercase letter')
    if (!/\d/.test(newPassword)) passwordErrors.push('a number')
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) passwordErrors.push('a special character')

    if (passwordErrors.length > 0) {
      return res.status(400).json({ error: `Password must contain ${passwordErrors.join(', ')}` })
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (updateError) throw updateError

    res.json({ success: true })
  } catch (err) {
    console.error('Update password error:', err)
    res.status(500).json({ error: 'Failed to update password' })
  }
})

export default router
