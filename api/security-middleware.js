/**
 * CORS & Security Middleware
 * Configure CORS for your domain and security headers
 */

const cors = require('cors')

/**
 * CORS configuration based on environment
 * @param {string} env - Environment (development/production)
 * @returns {object} CORS options
 */
function getCorsOptions(env = 'development') {
  const configs = {
    development: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5180',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5180',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-Token',
      ],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 3600,
    },
    production: {
      origin: [
        'https://yourdomain.com',
        'https://www.yourdomain.com',
        'https://app.yourdomain.com',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-Token',
      ],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 86400, // 24 hours
      secure: true,
    },
  }

  return configs[env] || configs.development
}

/**
 * Security headers middleware
 */
function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Content Security Policy (adjust as needed)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://accounts.google.com; style-src 'self' 'unsafe-inline';"
  )

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  )

  next()
}

/**
 * Rate limiting middleware
 * Basic in-memory rate limiter
 */
function createRateLimiter(maxRequests = 100, windowMs = 15 * 60 * 1000) {
  const requests = new Map()

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress
    const now = Date.now()
    const requestTimes = requests.get(key) || []

    // Remove old requests outside window
    const recentRequests = requestTimes.filter(
      (time) => now - time < windowMs
    )

    if (recentRequests.length >= maxRequests) {
      return res
        .status(429)
        .json({ error: 'Too many requests, please try again later' })
    }

    recentRequests.push(now)
    requests.set(key, recentRequests)

    // Cleanup old entries occasionally
    if (Math.random() < 0.01) {
      for (const [k, times] of requests.entries()) {
        const active = times.filter((t) => now - t < windowMs)
        if (active.length === 0) {
          requests.delete(k)
        } else {
          requests.set(k, active)
        }
      }
    }

    next()
  }
}

/**
 * Auth-specific rate limiter
 * Stricter limits for authentication endpoints
 */
function createAuthRateLimiter(maxRequests = 5, windowMs = 15 * 60 * 1000) {
  return createRateLimiter(maxRequests, windowMs)
}

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    }

    // Log errors
    if (res.statusCode >= 400) {
      console.warn('HTTP Error:', log)
    } else {
      console.log('HTTP Request:', log)
    }
  })

  next()
}

module.exports = {
  getCorsOptions,
  corsMiddleware: (env) => cors(getCorsOptions(env)),
  securityHeaders,
  createRateLimiter,
  createAuthRateLimiter,
  requestLogger,
}
