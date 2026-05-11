# Google Sign-In Integration Guide

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: **"Academee LMS"** (or your preferred name)
3. Wait for project creation to complete

### 1.2 Enable Google Identity Services API
1. Search for **"Google Identity Services API"** or **"Google+ API"** in the search bar
2. Click **Enable API**
3. Also enable **"Identity and Access Management (IAM) API"** if not auto-enabled

### 1.3 Create OAuth 2.0 Credentials
1. Go to **Credentials** (left sidebar)
2. Click **+ Create Credentials** → **OAuth client ID**
3. If prompted, configure **OAuth consent screen** first:
   - Choose **External** user type
   - Fill in:
     - **App name:** Academee LMS
     - **User support email:** your-email@example.com
     - **Developer contact:** your-email@example.com
   - Click **Save and Continue**
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (your email)
   - Review and go back to credentials

4. Create OAuth 2.0 Client ID:
   - **Application type:** Web application
   - **Name:** Academee Web Client
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     http://localhost:5180
     https://yourdomain.com
     https://www.yourdomain.com
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:5173/auth/google/callback
     http://localhost:5180/auth/google/callback
     https://yourdomain.com/auth/google/callback
     https://www.yourdomain.com/auth/google/callback
     ```
   - Click **Create**

5. Copy your credentials:
   - **Client ID**: (long string ending in .apps.googleusercontent.com)
   - **Client Secret**: (sensitive - keep secure)

### 1.4 Get Google Sign-In Library
- Add to your frontend's `index.html`:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

---

## Step 2: Environment Variables Setup

Create/update `.env` file in root:
```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE

# Backend
API_PORT=8787
API_HOST=0.0.0.0
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
DATABASE_URL=your_postgres_connection_string

# JWT Secret (generate: openssl rand -hex 32)
JWT_SECRET=your_jwt_secret_here

# Environment
NODE_ENV=development
```

Update `.env.example` to add these variables (without secrets).

---

## Step 3: Database Schema

Run this migration in Supabase:
```sql
-- Update users table to support Google Sign-In
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  google_id VARCHAR(255) UNIQUE;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  auth_provider VARCHAR(50) DEFAULT 'email';

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  profile_picture_url TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_google_id ON public.profiles(google_id);
```

---

## Step 4: Install Dependencies

```bash
npm install google-auth-library jsonwebtoken
```

---

## Security Checklist

✅ **Token Validation:** Always verify Google ID token on backend  
✅ **HTTPS Only:** Enforce HTTPS in production  
✅ **CORS:** Configure CORS to allow only your domains  
✅ **Secure Cookies:** Use HttpOnly, Secure, SameSite flags  
✅ **JWT Secret:** Use strong, random secret (min 32 characters)  
✅ **Environment Variables:** Never commit secrets to git  
✅ **Rate Limiting:** Implement rate limiting on auth endpoints  
✅ **Token Expiration:** Short-lived JWT tokens (15-60 min)  
✅ **Refresh Tokens:** Store refresh tokens securely  

---

## Implementation Overview

1. **Frontend:** Google Sign-In button triggers authentication
2. **Google:** User logs in, receives ID token
3. **Frontend → Backend:** Send ID token to `/api/auth/google`
4. **Backend:** Verify token using Google API, create/update user in DB
5. **Backend → Frontend:** Return JWT token + user data
6. **Frontend:** Store JWT in secure storage, set auth headers
7. **Protected Routes:** Check JWT on each request

---

## Testing in Development

1. Update your app URLs in Google Cloud Console to `localhost:5173` or `localhost:5180`
2. Run: `npm run dev` and `npm run api` in separate terminals
3. Test login/logout flow
4. Check browser DevTools Network tab to see token exchange

---

## Production Deployment

1. Update Google Cloud Console with production URLs
2. Set `NODE_ENV=production`
3. Enable HTTPS
4. Configure CORS properly
5. Use environment secrets manager (not .env file)
6. Implement rate limiting on auth endpoints
7. Monitor authentication logs

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid client_id" | Ensure VITE_GOOGLE_CLIENT_ID matches Google Console |
| CORS error | Add your domain to Authorized JavaScript Origins in Google Console |
| Token verification fails | Check JWT_SECRET is consistent, verify backend has google-auth-library |
| User not created in DB | Ensure database migrations ran, check Supabase permissions |
| Redirect URI mismatch | Ensure redirect URIs in Google Console match exactly with app |

