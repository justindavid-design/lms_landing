# Google Sign-In Integration - Setup Checklist

Use this checklist to track your setup progress.

---

## 🔵 Phase 1: Google Cloud Console (15 min)

### Create Project & Enable API
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Create new project named "Academee LMS"
- [ ] Wait for project to be created
- [ ] Search for "Google Identity Services API"
- [ ] Click "Enable API"
- [ ] Enable "Identity and Access Management API" if needed

### Configure OAuth Consent Screen
- [ ] Go to "Credentials" in left sidebar
- [ ] Click "Configure OAuth Consent Screen"
- [ ] Choose "External" user type
- [ ] Fill in:
  - [ ] App name: "Academee LMS"
  - [ ] User support email: your-email@example.com
  - [ ] Developer contact: your-email@example.com
- [ ] Add scopes: `email`, `profile`, `openid`
- [ ] Add test users (your email)
- [ ] Save and Continue

### Create OAuth Credentials
- [ ] In Credentials, click "Create Credentials" → "OAuth client ID"
- [ ] Application type: "Web application"
- [ ] Name: "Academee Web Client"
- [ ] Add Authorized JavaScript Origins:
  - [ ] `http://localhost:5173`
  - [ ] `http://localhost:5180`
  - [ ] `https://yourdomain.com` (for production)
  - [ ] `https://www.yourdomain.com` (for production)
- [ ] Add Authorized Redirect URIs:
  - [ ] `http://localhost:5173/auth/google/callback`
  - [ ] `http://localhost:5180/auth/google/callback`
  - [ ] `https://yourdomain.com/auth/google/callback`
  - [ ] `https://www.yourdomain.com/auth/google/callback`
- [ ] Copy Client ID: `______________________`
- [ ] Copy Client Secret: `______________________`

---

## 🔵 Phase 2: Environment Setup (5 min)

### Create .env File
- [ ] Copy `.env.example` to `.env`
- [ ] Open `.env` in editor

### Add Environment Variables
- [ ] VITE_GOOGLE_CLIENT_ID = `[paste Client ID from Phase 1]`
- [ ] GOOGLE_CLIENT_SECRET = `[paste Client Secret from Phase 1]`
- [ ] JWT_SECRET = `[generate: openssl rand -hex 32]`

**Generate JWT Secret:**
```bash
openssl rand -hex 32
```
- [ ] Copy output to JWT_SECRET in .env

### Verify Other Variables
- [ ] SUPABASE_URL = (should already be set)
- [ ] SUPABASE_ANON_KEY = (should already be set)
- [ ] SUPABASE_SERVICE_ROLE_KEY = (should already be set)

---

## 🔵 Phase 3: Install Dependencies (2 min)

### Install Packages
```bash
npm install
```

### Verify New Packages
- [ ] Check `package.json` has `google-auth-library`
- [ ] Check `package.json` has `jsonwebtoken`

---

## 🔵 Phase 4: Database Setup (5 min)

### Run SQL Migration
- [ ] Go to [Supabase Dashboard](https://app.supabase.com)
- [ ] Select your project
- [ ] Go to "SQL Editor"
- [ ] Create new query
- [ ] Copy & paste migration SQL from [GOOGLE-SIGNIN-SETUP.md](./GOOGLE-SIGNIN-SETUP.md) Step 3
- [ ] Execute query

**Expected queries to run:**
- [ ] ALTER TABLE profiles ADD COLUMN google_id
- [ ] ALTER TABLE profiles ADD COLUMN auth_provider
- [ ] ALTER TABLE profiles ADD COLUMN profile_picture_url
- [ ] CREATE INDEX idx_profiles_google_id

### Verify in Supabase
- [ ] Go to Table Editor
- [ ] Click on "profiles" table
- [ ] Verify new columns exist:
  - [ ] google_id
  - [ ] auth_provider
  - [ ] profile_picture_url

---

## 🔵 Phase 5: Backend Verification (2 min)

### Check Files Created
- [ ] `api/google-auth.js` exists
- [ ] `api/auth-middleware.js` exists
- [ ] `api/security-middleware.js` exists

### Check api-server.js Updated
- [ ] Opens without errors
- [ ] Contains: `const googleAuth = require(...)`
- [ ] Contains: `const authMiddleware = require(...)`
- [ ] Contains: `app.post('/api/auth/google', ...)`
- [ ] Contains: `app.post('/api/auth/refresh', ...)`

---

## 🔵 Phase 6: Frontend Verification (2 min)

### Check Files Created
- [ ] `src/components/GoogleSignInButton.jsx` exists
- [ ] `src/components/GoogleLogoutButton.jsx` exists
- [ ] `src/components/LoginWithGoogle.jsx` exists
- [ ] `src/lib/GoogleAuthProvider.jsx` exists
- [ ] `src/lib/ProtectedRoute.jsx` exists

### Check index.html Updated
- [ ] Open `index.html`
- [ ] Contains: `<script src="https://accounts.google.com/gsi/client"...`

### Check package.json Updated
- [ ] Verified in Phase 3 ✓

---

## 🔵 Phase 7: Start Servers (1 min)

### Terminal 1: Start Frontend
```bash
npm run dev
```

- [ ] Waits for connection
- [ ] Shows: "VITE v7... ready in ... ms"
- [ ] Shows: "Local: http://localhost:5173"

### Terminal 2: Start Backend
```bash
npm run api
```

- [ ] Shows: "API dev server listening on http://localhost:8787"

---

## 🔵 Phase 8: Test Login Flow (5 min)

### Open Application
- [ ] Navigate to http://localhost:5173/login
- [ ] See login page with Google Sign-In button

### Test Google Sign-In
- [ ] Click "Sign in with Google"
- [ ] Google login dialog appears
- [ ] Enter test account credentials
- [ ] Click "Continue"
- [ ] Authorize app access to email/profile
- [ ] Page redirects to `/dashboard`

### Verify Session Created
- [ ] Open DevTools (F12)
- [ ] Go to Application → Session Storage
- [ ] Verify `auth_token` exists (long string)
- [ ] Verify `user_id` exists
- [ ] Verify `refresh_token` exists

### Verify User in Database
- [ ] Go to Supabase Dashboard
- [ ] Table Editor → profiles
- [ ] Verify new user created with:
  - [ ] Correct email
  - [ ] google_id populated
  - [ ] auth_provider = "google"
  - [ ] profile_picture_url populated

---

## 🔵 Phase 9: Test Protected Routes (3 min)

### Test Logout
- [ ] While in dashboard, find logout button
- [ ] Click logout
- [ ] Session Storage should be cleared
- [ ] Redirect to home page

### Test Route Protection
- [ ] In new incognito window, go to http://localhost:5173/dashboard
- [ ] Should redirect to `/login`
- [ ] After login, should allow access

### Test Token Refresh (Optional)
- [ ] After login, wait 1 hour OR force refresh:
  ```javascript
  // In browser console while logged in
  sessionStorage.removeItem('auth_token')
  // Manually call refresh from context
  ```
- [ ] Token should be refreshed automatically

---

## 🔵 Phase 10: API Testing (2 min)

### Test Auth Endpoint (using curl or Postman)

**Get ID Token First:**
1. Go to http://localhost:5173/login
2. Open DevTools → Network
3. Click "Sign in with Google"
4. Find request to `/api/auth/google`
5. Copy the ID token from payload

**Test Endpoint:**
```bash
curl -X POST http://localhost:8787/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"YOUR_TOKEN_HERE"}'
```

- [ ] Returns 200 status
- [ ] Contains user data (id, email, name, picture)
- [ ] Contains token (long JWT string)
- [ ] Contains refreshToken

### Test Refresh Endpoint
```bash
curl -X POST http://localhost:8787/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"REFRESH_TOKEN_FROM_LOGIN"}'
```

- [ ] Returns 200 status
- [ ] Contains new token

### Test Verify Endpoint
```bash
curl http://localhost:8787/api/auth/verify \
  -H "Authorization: Bearer TOKENS_FROM_LOGIN"
```

- [ ] Returns 200 status
- [ ] Contains user info

---

## 🟢 Phase 11: Production Prep (10 min)

### Update Google Cloud Console for Production
- [ ] Go to Google Cloud Console
- [ ] OAuth Consent Screen
- [ ] Add production domain to Authorized JavaScript Origins
- [ ] Add production domain to Authorized Redirect URIs
- [ ] Move app from "External" to "Internal" if applicable

### Update Environment Variables
- [ ] Create `.env.production` (if using)
- [ ] Update VITE_GOOGLE_CLIENT_ID (if different)
- [ ] Update GOOGLE_CLIENT_SECRET (if different)
- [ ] Generate new strong JWT_SECRET: `openssl rand -hex 32`
- [ ] Ensure all URLs use HTTPS

### Enable HTTPS
- [ ] Obtain SSL certificate
- [ ] Update Node.js to use HTTPS
- [ ] Update CORS origins to use `https://`

### Final Security Check
- [ ] [ ] Never commit `.env` with secrets
- [ ] [ ] JWT_SECRET is 32+ characters
- [ ] [ ] CORS origins are restrictive
- [ ] [ ] HTTPS enforced in production
- [ ] [ ] Rate limiting configured
- [ ] [ ] Logging configured

---

## ✅ Complete!

All phases finished? You now have:

✅ Google OAuth 2.0 working in development
✅ Secure JWT session management
✅ Protected routes
✅ User database integration
✅ Complete documentation
✅ Production-ready code

### Next Steps

1. **Deploy to Production**
   - Update all URLs to production domain
   - Use production database
   - Monitor authentication logs

2. **Migrate Existing Users**
   - Allow linking Google to existing email accounts
   - Keep OTP routes working temporarily
   - Gradually migrate users

3. **Monitor & Maintain**
   - Watch for auth errors
   - Track user signups
   - Rotate secrets regularly

---

## 🆘 Troubleshooting

| Issue | Checklist |
|-------|-----------|
| "Invalid client_id" | [ ] Check .env has correct VITE_GOOGLE_CLIENT_ID |
| CORS error | [ ] Check Google Cloud Console has correct authorized origins |
| "Token verification failed" | [ ] Check JWT_SECRET is set correctly |
| User not created | [ ] Check database migration ran |
| Token not sent to API | [ ] Check using useAuthenticatedFetch hook |

**Detailed help:**
- Setup issues? → See `GOOGLE-SIGNIN-SETUP.md`
- Security issues? → See `SECURITY-CORS-GUIDE.md`
- Code examples? → See `INTEGRATION-EXAMPLE.md`

---

## 📞 Questions?

Check the documentation:
- `GOOGLE-SIGNIN-README.md` - Overview & quick start
- `GOOGLE-SIGNIN-SETUP.md` - Google Cloud Console setup
- `GOOGLE-SIGNIN-IMPLEMENTATION.md` - Implementation guide
- `SECURITY-CORS-GUIDE.md` - Security & deployment
- `INTEGRATION-EXAMPLE.md` - Code examples

