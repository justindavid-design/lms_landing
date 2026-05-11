# Google Sign-In Integration - Quick Start Guide

## 🎯 Overview

Complete Google OAuth 2.0 authentication integration for your React + Node.js LMS application with Supabase database.

**Tech Stack:**
- Frontend: React 18 + Vite + React Router v7
- Backend: Express.js (Node.js)
- Database: Supabase (PostgreSQL)
- Auth: Google OAuth 2.0 + JWT

---

## 📋 What's Included

### Files Created/Updated

**New Backend Files:**
- `api/google-auth.js` - Google token verification & user management
- `api/auth-middleware.js` - JWT verification middleware
- `api/security-middleware.js` - CORS, rate limiting, security headers

**New Frontend Files:**
- `src/components/GoogleSignInButton.jsx` - Google Sign-In button
- `src/components/GoogleLogoutButton.jsx` - Logout button
- `src/components/LoginWithGoogle.jsx` - Enhanced login page
- `src/lib/GoogleAuthProvider.jsx` - Auth state management & hooks
- `src/lib/ProtectedRoute.jsx` - Route protection

**Updated Files:**
- `api-server.js` - Added Google auth routes
- `package.json` - Added dependencies
- `index.html` - Added Google SDK script
- `.env.example` - Added environment variables
- `api-server.js` - Added security middleware

**Documentation:**
- `GOOGLE-SIGNIN-SETUP.md` - Google Cloud Console setup
- `GOOGLE-SIGNIN-IMPLEMENTATION.md` - Implementation guide
- `SECURITY-CORS-GUIDE.md` - Security best practices
- `INTEGRATION-EXAMPLE.md` - Complete code examples

---

## 🚀 Quick Start (10 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Get Google Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Academee LMS"
3. Enable "Google Identity Services API"
4. Create OAuth 2.0 credentials (Web application)
5. Copy Client ID and Client Secret

**Authorized URLs:**
- Origins: `http://localhost:5173`, `http://localhost:5180`
- Redirect: `http://localhost:5173/auth/google/callback`, `http://localhost:5180/auth/google/callback`

### Step 3: Configure Environment

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
JWT_SECRET=openssl rand -hex 32  # Generate a random 32-char string
```

Generate JWT_SECRET:
```bash
openssl rand -hex 32
# Output: a1b2c3d4e5f6... (copy this)
```

### Step 4: Database Migration

In Supabase SQL Editor, run:
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_google_id ON public.profiles(google_id);
```

### Step 5: Start Servers

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run api
```

### Step 6: Test Login

1. Go to `http://localhost:5173/login`
2. Click "Sign in with Google"
3. Sign in with your test account
4. Should redirect to dashboard
5. Check DevTools → Application → sessionStorage for `auth_token`

✅ **You're done!** The basic integration is complete.

---

## 📚 Detailed Guides

### For Setup Details
→ Read [GOOGLE-SIGNIN-SETUP.md](./GOOGLE-SIGNIN-SETUP.md)

### For Implementation Details
→ Read [GOOGLE-SIGNIN-IMPLEMENTATION.md](./GOOGLE-SIGNIN-IMPLEMENTATION.md)

### For Security & CORS
→ Read [SECURITY-CORS-GUIDE.md](./SECURITY-CORS-GUIDE.md)

### For Code Examples
→ Read [INTEGRATION-EXAMPLE.md](./INTEGRATION-EXAMPLE.md)

---

## 🔑 Key Features

✅ **OAuth 2.0 Compliant**
- Verify tokens with Google API
- Secure token exchange

✅ **JWT Session Management**
- Short-lived access tokens (1 hour)
- Long-lived refresh tokens (7 days)
- Automatic token refresh

✅ **User Management**
- Auto-create users on first login
- Link Google to existing email accounts
- Store profile picture & name

✅ **Route Protection**
- `ProtectedRoute` component for authenticated pages
- Redirect to login if not authenticated
- Preserve location on redirect

✅ **Security**
- CORS configured per environment
- Rate limiting on auth endpoints
- Security headers
- Input validation
- Email verification

✅ **Developer Experience**
- Hooks: `useGoogleAuth()`, `useAuthHeaders()`, `useAuthenticatedFetch()`
- Clean separation of concerns
- Comprehensive error handling
- Detailed logging

---

## 📁 Project Structure

```
.
├── api/
│   ├── google-auth.js              (NEW)
│   ├── auth-middleware.js          (NEW)
│   ├── security-middleware.js      (NEW)
│   └── ... (existing files)
├── src/
│   ├── components/
│   │   ├── GoogleSignInButton.jsx  (NEW)
│   │   ├── GoogleLogoutButton.jsx  (NEW)
│   │   ├── LoginWithGoogle.jsx     (NEW)
│   │   └── ... (existing files)
│   ├── lib/
│   │   ├── GoogleAuthProvider.jsx  (NEW)
│   │   ├── ProtectedRoute.jsx      (NEW)
│   │   └── ... (existing files)
│   └── ... (existing files)
├── api-server.js                   (UPDATED)
├── index.html                      (UPDATED)
├── package.json                    (UPDATED)
├── .env.example                    (UPDATED)
├── GOOGLE-SIGNIN-SETUP.md          (NEW)
├── GOOGLE-SIGNIN-IMPLEMENTATION.md (NEW)
├── SECURITY-CORS-GUIDE.md          (NEW)
├── INTEGRATION-EXAMPLE.md          (NEW)
└── ... (existing files)
```

---

## 🔗 Authentication Flow

```
User clicks "Sign in with Google"
         ↓
Google SDK shows login dialog
         ↓
User enters credentials & authorizes
         ↓
Google returns ID token to frontend
         ↓
Frontend sends ID token to /api/auth/google
         ↓
Backend verifies token with Google API
         ↓
Backend checks if user exists in DB
         ↓
Create new user or update existing
         ↓
Backend generates JWT access token (1h)
         ↓
Backend generates refresh token (7d)
         ↓
Frontend stores tokens in sessionStorage
         ↓
Frontend redirects to dashboard
         ↓
All API calls include Authorization header
```

---

## 🛡️ Security Checklist

- ✅ Google token verified server-side
- ✅ JWT tokens signed with strong secret
- ✅ Access tokens short-lived (1 hour)
- ✅ CORS configured for your domain
- ✅ Rate limiting on auth endpoints
- ✅ Security headers enabled
- ✅ HTTPS required in production
- ✅ Tokens in sessionStorage (not localStorage)
- ✅ Email verification required
- ✅ Input validation on all endpoints

---

## 🧪 Testing

### Development Testing

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run api
```

Then:
1. Navigate to `http://localhost:5173/login`
2. Click "Sign in with Google"
3. Use your test Google account
4. Verify dashboard loads
5. Check token in sessionStorage (F12 → Application)

### API Testing with cURL

```bash
# Test Google auth endpoint
curl -X POST http://localhost:8787/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"your_google_id_token"}'

# Response:
# {
#   "success": true,
#   "user": { "id": "...", "email": "...", "name": "..." },
#   "token": "eyJhbGc...",
#   "refreshToken": "eyJhbGc..."
# }
```

### Production Testing

1. Update Google Cloud Console with production domain
2. Set `NODE_ENV=production`
3. Enable HTTPS
4. Test full login flow
5. Monitor API logs
6. Verify user created in database

---

## 🚨 Troubleshooting

### "Invalid client_id" Error

**Cause:** Google Client ID is wrong or missing

**Fix:**
```env
# Verify in .env
VITE_GOOGLE_CLIENT_ID=correct_id.apps.googleusercontent.com
```

### CORS Error on Sign-In

**Cause:** Domain not in Google Cloud Console

**Fix:**
1. Go to Google Cloud Console
2. OAuth Consent Screen → Add authorized domain
3. Add your localhost and production domains

### Token Verification Failed

**Cause:** JWT_SECRET mismatch or token expired

**Fix:**
```env
# Regenerate strong secret
JWT_SECRET=openssl rand -hex 32
```

### User Not Created in Database

**Cause:** Supabase permissions or migration not run

**Fix:**
1. Run database migration (see Step 4 above)
2. Check Supabase profiles table permissions
3. Verify SUPABASE_SERVICE_ROLE_KEY is correct

### Token Not Sent to API

**Cause:** Not using `useAuthenticatedFetch()` hook

**Fix:**
```jsx
// ❌ Wrong - token not sent
fetch('/api/courses')

// ✅ Correct - token automatically added
const fetchWithAuth = useAuthenticatedFetch()
fetchWithAuth('/api/courses')
```

---

## 📞 Getting Help

If you encounter issues:

1. **Check the logs:**
   - Frontend: Browser console (F12)
   - Backend: Terminal where `npm run api` is running

2. **Verify configuration:**
   - Check `.env` has all required variables
   - Check Google Cloud Console settings
   - Check database migration ran

3. **Review guides:**
   - [GOOGLE-SIGNIN-SETUP.md](./GOOGLE-SIGNIN-SETUP.md) - Setup issues
   - [SECURITY-CORS-GUIDE.md](./SECURITY-CORS-GUIDE.md) - CORS/security issues
   - [INTEGRATION-EXAMPLE.md](./INTEGRATION-EXAMPLE.md) - Code examples

4. **Test endpoints:**
   - Health check: `curl http://localhost:8787/health`
   - Token verify: `curl http://localhost:8787/api/auth/verify -H "Authorization: Bearer YOUR_TOKEN"`

---

## 🎓 Next Steps

1. ✅ Complete quick start above
2. ✅ Update existing Login page to use GoogleSignInButton
3. ✅ Wrap sensitive routes with ProtectedRoute
4. ✅ Replace email/password with Google Sign-In (optional)
5. ✅ Test all routes in development
6. ✅ Deploy to production (update URLs in Google Cloud Console)
7. ✅ Monitor authentication logs
8. ✅ Set up alerts for auth failures

---

## 📊 API Reference

### POST /api/auth/google

Authenticate user with Google ID token.

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://...",
    "authProvider": "google"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/refresh

Refresh expired access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /api/auth/verify

Verify current JWT token (requires Authorization header).

**Request:**
```
GET /api/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "userId": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "authProvider": "google"
  }
}
```

---

## 🔄 Deployment Checklist

- ✅ Update `.env` for production
- ✅ Update Google Cloud Console with production domain
- ✅ Set `NODE_ENV=production`
- ✅ Enable HTTPS
- ✅ Update CORS origins to production domain
- ✅ Generate strong JWT_SECRET
- ✅ Configure rate limiting
- ✅ Set up monitoring/logging
- ✅ Test full auth flow
- ✅ Monitor API logs for errors
- ✅ Set up automated backups
- ✅ Document rollback procedure

---

## 📄 License

This integration is part of your Academee LMS project.

---

## 📞 Questions?

Refer to the detailed guides:
- Setup: [GOOGLE-SIGNIN-SETUP.md](./GOOGLE-SIGNIN-SETUP.md)
- Implementation: [GOOGLE-SIGNIN-IMPLEMENTATION.md](./GOOGLE-SIGNIN-IMPLEMENTATION.md)
- Security: [SECURITY-CORS-GUIDE.md](./SECURITY-CORS-GUIDE.md)
- Examples: [INTEGRATION-EXAMPLE.md](./INTEGRATION-EXAMPLE.md)

