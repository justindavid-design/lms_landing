/**
 * Google OAuth Authentication Handler
 * Verifies Google ID token and manages user session
 */

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

/**
 * Verify Google ID token and return user data
 * @param {string} idToken - Google ID token from frontend
 * @returns {Object} Verified ticket containing user info
 */
async function verifyGoogleToken(idToken) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    return payload
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`)
  }
}

/**
 * Create or update user in Supabase
 * @param {Object} googleData - Data from Google token payload
 * @returns {Object} User profile from database
 */
async function createOrUpdateUser(googleData) {
  const { sub: googleId, email, name, picture } = googleData

  try {
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, display_name, profile_picture_url')
      .eq('google_id', googleId)
      .maybeSingle()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Database fetch error: ${fetchError.message}`)
    }

    if (existingUser) {
      // Update existing user (in case profile picture or name changed)
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_picture_url: picture,
          display_name: name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) throw new Error(`Update error: ${updateError.message}`)
      return updated
    }

    // Check if email already exists (user signed up with email before)
    const { data: emailUser, error: emailError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (emailError && emailError.code !== 'PGRST116') {
      throw new Error(`Email lookup error: ${emailError.message}`)
    }

    if (emailUser) {
      // Link Google account to existing email-based account
      const { data: linked, error: linkError } = await supabase
        .from('profiles')
        .update({
          google_id: googleId,
          auth_provider: 'google',
          profile_picture_url: picture,
          updated_at: new Date().toISOString(),
        })
        .eq('id', emailUser.id)
        .select()
        .single()

      if (linkError) throw new Error(`Link error: ${linkError.message}`)
      return linked
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('profiles')
      .insert({
        email,
        display_name: name,
        google_id: googleId,
        auth_provider: 'google',
        profile_picture_url: picture,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) throw new Error(`Creation error: ${createError.message}`)
    return newUser
  } catch (error) {
    throw new Error(`User management error: ${error.message}`)
  }
}

/**
 * Generate JWT token for session management
 * @param {Object} user - User data from database
 * @returns {string} JWT token
 */
function generateJWT(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured')
  }

  const payload = {
    userId: user.id,
    email: user.email,
    name: user.display_name,
    authProvider: user.auth_provider,
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h', // Short-lived token
    algorithm: 'HS256',
  })
}

/**
 * Generate refresh token for extended sessions
 * @param {Object} user - User data from database
 * @returns {string} Refresh token
 */
function generateRefreshToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured')
  }

  return jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d', // Long-lived refresh token
      algorithm: 'HS256',
    }
  )
}

/**
 * Main handler for Google Sign-In authentication
 * POST /api/auth/google
 * Body: { idToken: string }
 * Response: { user, token, refreshToken }
 */
module.exports = async (req, res) => {
  try {
    // Validate request
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' })
    }

    const { idToken } = req.body
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ error: 'idToken is required' })
    }

    // Verify Google token
    const googleData = await verifyGoogleToken(idToken)

    // Verify token is not expired
    if (googleData.exp * 1000 < Date.now()) {
      return res.status(401).json({ error: 'Token has expired' })
    }

    // Verify email is verified by Google
    if (!googleData.email_verified) {
      return res.status(401).json({ error: 'Email not verified by Google' })
    }

    // Create or update user
    const user = await createOrUpdateUser(googleData)

    // Generate JWT for session
    const token = generateJWT(user)
    const refreshToken = generateRefreshToken(user)

    // Store refresh token (optional: save to DB or secure cookie)
    // For now, send both tokens to frontend

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name,
        picture: user.profile_picture_url,
        authProvider: user.auth_provider,
      },
      token, // Access token (1 hour)
      refreshToken, // Refresh token (7 days)
    })
  } catch (error) {
    console.error('Google auth error:', error)
    return res.status(401).json({ error: error.message || 'Authentication failed' })
  }
}
