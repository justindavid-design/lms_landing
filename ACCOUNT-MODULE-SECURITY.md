# Account Module - Security & Configuration Guide

## Security Best Practices Implemented

### 1. Password Security
- **Minimum 6 characters** validation
- **Client-side validation** before submission
- **Server-side validation** on backend
- **Hashed storage** via Supabase (bcrypt)
- **Password visibility toggle** UI for better UX
- **Confirm password** field on signup

### 2. Session Management
- **Supabase session handling** - Automatic token management
- **Session persistence** - User remains logged in on page reload
- **Token refresh** - Automatic token refresh before expiry
- **Logout cleanup** - Clear session on logout
- **Session expiry** - Default 1 hour access token

### 3. Error Handling
- **Safe error messages** - No sensitive info exposed
- **Backend error mapping** - User-friendly messages
  - 401 → "Invalid email or password" (no user enumeration)
  - 404 → "User not found" (caught before client)
  - 500 → "Something went wrong"
- **Client-side validation** - Prevents unnecessary API calls
- **Field-level errors** - Show specific validation issues

### 4. Frontend Security
- **Input sanitization** - Trim and lowercase emails
- **HTTPS enforced** (in production)
- **Secure cookie flags** - HttpOnly, Secure, SameSite
- **XSS prevention** - React escapes content
- **CSRF protection** - Built into Supabase

### 5. Backend Security (Express API)
- **CORS middleware** - Restrict cross-origin requests
- **Rate limiting** - Prevent brute force attacks
- **Security headers** - X-Frame-Options, X-Content-Type-Options, etc.
- **Input validation** - Check all inputs server-side
- **Error logging** - Log security events
- **Request timeout** - Prevent hanging requests

## Environment Configuration

### Development (`.env.local`)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxx
```

### Production (`.env.production`)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxx
VITE_API_URL=https://api.yourdomain.com
```

### Backend (`.env`)
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxxxxxxxxxxxxx
NODE_ENV=production
PORT=8787
JWT_SECRET=your_jwt_secret_key
```

## Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project name and password
4. Copy Project URL and Anon Key

### 2. Configure Authentication
1. Go to Authentication → Providers
2. Enable "Email" provider
3. Configure email templates (optional)
4. Set redirect URLs:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

### 3. Security Settings
1. Go to Authentication → Policies
2. Enable "Require email confirmation" (optional)
3. Set token expiry: 1 hour
4. Set refresh token expiry: 7 days

### 4. Create User Table (Optional)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- User can read own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- User can update own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- User can insert own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## API Security

### CORS Configuration
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://yourdomain.com'
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}

app.use(cors(corsOptions))
```

### Rate Limiting
```javascript
import rateLimit from 'express-rate-limit'

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later'
})

app.post('/api/auth/login', loginLimiter, ...)
```

### Security Headers
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  next()
})
```

## Testing Security

### 1. Test SQL Injection
```
Email: admin@domain.com' OR '1'='1
Password: anything
```
**Expected**: "Invalid email or password" (no data leak)

### 2. Test XSS
```
Display Name: <script>alert('XSS')</script>
```
**Expected**: Script not executed, rendered as text

### 3. Test Brute Force
```
Multiple failed login attempts
```
**Expected**: Rate limit error after 5 attempts

### 4. Test Session Hijacking
```
1. Log in
2. Open DevTools → Application → Cookies
3. Try to modify auth token
4. Refresh page
```
**Expected**: Session validation fails, logged out

## Compliance

### GDPR
- ✅ User data stored in EU region
- ✅ User can request data export
- ✅ User can delete account
- ✅ Privacy policy available
- ✅ Consent on signup

### CCPA
- ✅ User data transparent
- ✅ Right to delete
- ✅ Right to opt-out
- ✅ Data minimization

### HIPAA (if applicable)
- ⚠️ Consider data encryption
- ⚠️ Implement audit logging
- ⚠️ Regular security audits

## Monitoring & Logging

### Frontend Error Tracking
```javascript
// Sentry integration (optional)
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### Backend Logging
```javascript
const logger = require('pino')({
  level: process.env.LOG_LEVEL || 'info'
})

logger.error('Login failed for email:', email)
logger.warn('Rate limit exceeded')
```

### Audit Trail
```sql
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## Incident Response

### If Password Compromised
1. Reset password immediately
2. Invalidate all sessions
3. Notify via email
4. Check account activity

### If Data Breach
1. Notify affected users
2. Rotate API keys
3. Review logs
4. Implement additional security

### If Unauthorized Access
1. Revoke sessions
2. Force password reset
3. Review account activity
4. Investigate logs

## Regular Security Tasks

- [ ] **Weekly**: Review error logs
- [ ] **Monthly**: Check for security updates
- [ ] **Quarterly**: Security audit
- [ ] **Annually**: Penetration test
- [ ] **Ongoing**: Monitor for suspicious activity

## Additional Resources

- [Supabase Security Docs](https://supabase.com/docs/guides/auth/overview)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)

## Support & Questions

If you encounter security issues:
1. Check the logs
2. Review error messages
3. Test in isolation
4. Contact support
