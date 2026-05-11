# Security & CORS Configuration Guide

## CORS Setup for Google Sign-In

### Development (localhost)

In your `api-server.js`, add CORS middleware:

```javascript
const cors = require('cors')

const corsOptions = {
  origin: [
    'http://localhost:5173',  // Vite dev port
    'http://localhost:5180',  // Alternative dev port
    'http://localhost:3000',  // Common React dev port
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5180',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}

app.use(cors(corsOptions))
```

### Production

```javascript
const corsOptions = {
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://app.yourdomain.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  secure: true,
  httpOnly: true,
  sameSite: 'Lax',
  maxAge: 86400,
}

app.use(cors(corsOptions))
```

Install CORS:
```bash
npm install cors
```

---

## Security Best Practices

### 1. JWT Token Security

✅ **DO:**
- Use strong, random secret (min 32 characters)
- Sign with HS256 algorithm
- Short expiration (1-2 hours)
- Include userId & minimal user info in payload
- Validate token signature on every request

❌ **DON'T:**
- Store sensitive data in JWT payload (it's readable)
- Use weak secrets
- Never expire tokens
- Include passwords or API keys
- Share JWT_SECRET in code

### 2. Token Storage

| Storage | Security | Best For |
|---------|----------|----------|
| sessionStorage | ✅ High (cleared on browser close) | Access tokens |
| localStorage | ⚠️ Medium (stays after browser close) | Refresh tokens |
| HttpOnly Cookie | ✅✅ Very High (not accessible to JS) | Refresh tokens (backend sets) |
| Memory | ✅ High (lost on page refresh) | Sensitive data |

**Recommended:**
- Access Token: sessionStorage (frontend)
- Refresh Token: HttpOnly Secure Cookie (backend sets)

### 3. HTTPS & Secure Cookies

In production, always use HTTPS and set secure cookies:

```javascript
// Only set cookies over HTTPS
res.cookie('refreshToken', token, {
  httpOnly: true,      // Not accessible to JavaScript
  secure: true,        // HTTPS only
  sameSite: 'Strict',  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: 'yourdomain.com',
  path: '/',
})
```

### 4. Rate Limiting

Prevent brute force attacks:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

app.post('/api/auth/google', authLimiter, googleAuthHandler)
```

### 5. Input Validation

Always validate and sanitize inputs:

```javascript
const jwt = require('jsonwebtoken')

function validateToken(token) {
  // Check type
  if (typeof token !== 'string') {
    throw new Error('Token must be a string')
  }

  // Check format (JWT has 3 parts: header.payload.signature)
  if (token.split('.').length !== 3) {
    throw new Error('Invalid token format')
  }

  // Check length (reasonable max size)
  if (token.length > 5000) {
    throw new Error('Token too large')
  }

  return true
}
```

### 6. Error Handling

Don't leak sensitive information:

❌ **Bad:**
```javascript
catch (error) {
  res.status(500).json({ 
    error: error.message,  // Exposes internals
    stack: error.stack     // Shows file paths
  })
}
```

✅ **Good:**
```javascript
catch (error) {
  console.error('Auth error:', error)  // Log for debugging
  res.status(401).json({ 
    error: 'Authentication failed'  // Generic message
  })
}
```

### 7. CSRF Protection

Use SameSite cookies:

```javascript
// Already included in secure cookie setup above
res.cookie('token', value, {
  sameSite: 'Strict',  // Prevents CSRF
  // ... other options
})
```

For forms, use CSRF tokens:

```javascript
const csrf = require('csrf')
const tokens = new csrf()

// Generate token
app.get('/api/csrf-token', (req, res) => {
  const token = tokens.create(req.session)
  res.json({ csrfToken: token })
})

// Validate on POST
app.post('/api/form', (req, res) => {
  if (!tokens.verify(req.session, req.body._csrf)) {
    return res.status(403).json({ error: 'CSRF token invalid' })
  }
  // ... handle request
})
```

### 8. SQL Injection Prevention

Always use parameterized queries (Supabase does this):

❌ **Bad:**
```javascript
const query = `SELECT * FROM users WHERE id = '${userId}'`
supabase.query(query)
```

✅ **Good:**
```javascript
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()
```

### 9. Environment Variables

Never commit `.env` with secrets:

```bash
# .gitignore
.env
.env.local
.env.*.local
node_modules/
```

Use environment-specific configurations:

```javascript
// api-server.js
const config = {
  development: {
    allowedOrigins: ['http://localhost:5173'],
    secureCookies: false,
  },
  production: {
    allowedOrigins: ['https://yourdomain.com'],
    secureCookies: true,
  },
}

const env = process.env.NODE_ENV || 'development'
const settings = config[env]
```

### 10. Logging & Monitoring

Log authentication events:

```javascript
function logAuthEvent(event, userId, details) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] Auth: ${event}`, {
    userId,
    ...details,
  })

  // Optionally send to monitoring service
  // Sentry, LogRocket, Datadog, etc.
}

// Usage
logAuthEvent('LOGIN_SUCCESS', user.id, {
  provider: 'google',
  email: user.email,
  ip: req.ip,
})

logAuthEvent('LOGIN_FAILED', 'unknown', {
  reason: 'invalid_token',
  ip: req.ip,
})
```

---

## Google OAuth Security

### 1. Verify ID Token Server-Side

The token verification is critical:

```javascript
const { OAuth2Client } = require('google-auth-library')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

async function verifyToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,  // CRITICAL
    })
    return ticket.getPayload()
  } catch (error) {
    throw new Error('Token verification failed')
  }
}
```

**Why:**
- Ensures token wasn't tampered with
- Confirms it came from Google
- Validates audience (your app)
- Prevents accepting tokens for other apps

### 2. Validate Token Expiration

```javascript
const payload = ticket.getPayload()

if (payload.exp * 1000 < Date.now()) {
  throw new Error('Token has expired')
}
```

### 3. Verify Email

```javascript
if (!payload.email_verified) {
  throw new Error('Email not verified by Google')
}
```

### 4. Rotate Secrets Regularly

- Change JWT_SECRET every 3-6 months
- Implement secret versioning
- Update all running instances

### 5. Monitor for Suspicious Activity

```javascript
const suspiciousAttempts = {}

function trackLoginAttempt(email) {
  const key = email
  suspiciousAttempts[key] = (suspiciousAttempts[key] || 0) + 1

  if (suspiciousAttempts[key] > 10) {
    // Block or require additional verification
    logAuthEvent('SUSPICIOUS_ACTIVITY', email, {
      attempts: suspiciousAttempts[key],
    })
  }

  // Reset after 1 hour
  setTimeout(() => {
    delete suspiciousAttempts[key]
  }, 60 * 60 * 1000)
}
```

---

## Deployment Checklist

- ✅ Set NODE_ENV=production
- ✅ Enable HTTPS (SSL certificate)
- ✅ Update CORS allowedOrigins to production domain
- ✅ Set JWT_SECRET to strong random value
- ✅ Configure secure cookies (httpOnly, secure, sameSite)
- ✅ Update Google Cloud Console with production URLs
- ✅ Set up rate limiting
- ✅ Configure logging & monitoring
- ✅ Set up database backups
- ✅ Enable HTTPS redirects
- ✅ Test full auth flow in production
- ✅ Monitor API logs for errors
- ✅ Set up alerts for auth failures
- ✅ Document rollback procedures

---

## Incident Response

If you suspect a security breach:

1. **Rotate secrets immediately:**
   ```bash
   # Generate new JWT_SECRET
   openssl rand -hex 32
   # Recreate Google OAuth credentials
   ```

2. **Invalidate all tokens:**
   - Option 1: Change JWT_SECRET (all old tokens invalid)
   - Option 2: Maintain token blacklist in Redis/DB

3. **Audit access logs:**
   - Who accessed sensitive data?
   - When did unauthorized access occur?
   - What data was exposed?

4. **Notify users if needed:**
   - Require password reset
   - Revoke all sessions
   - Email affected users

5. **Post-incident review:**
   - What went wrong?
   - How to prevent in future?
   - Update security policies

---

## References

- [OAuth 2.0 Security Best Practices](https://oauth.net/security-best-practices/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Google Identity Security](https://developers.google.com/identity/protocols/oauth2/security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [HTTPS Everywhere](https://https.cio.gov/)

