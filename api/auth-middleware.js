/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const jwt = require('jsonwebtoken')

/**
 * Middleware to verify JWT token from Authorization header
 * Expects: Authorization: Bearer <token>
 */
function verifyAuthToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    })

    // Attach user info to request
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    return res.status(401).json({ error: 'Authentication failed' })
  }
}

/**
 * Middleware to refresh expired token using refresh token
 * POST /api/auth/refresh
 * Body: { refreshToken: string }
 */
function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken is required' })
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    })

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
        type: 'access',
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
        algorithm: 'HS256',
      }
    )

    return res.status(200).json({
      success: true,
      token: newAccessToken,
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return res.status(401).json({ error: 'Token refresh failed' })
  }
}

module.exports = {
  verifyAuthToken,
  refreshToken,
}
