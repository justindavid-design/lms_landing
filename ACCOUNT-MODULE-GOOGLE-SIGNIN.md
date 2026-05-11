# Account Module - Google Sign-In Integration

## Overview

This guide covers integrating Google Sign-In into the account module for OAuth authentication.

## Setup Steps

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Go to "APIs & Services" → "Library"
4. Search for "Google Identity Services API"
5. Click enable
6. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
7. Select "Web application"
8. Add Authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
9. Add Authorized redirect URIs:
   - `http://localhost:5173/` (development)
   - `https://yourdomain.com/` (production)
10. Copy Client ID

### 2. Add Environment Variables

```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### 3. Add Google SDK to HTML

In `index.html`, add before closing `</head>`:
```html
<script async defer src="https://accounts.google.com/gsi/client"></script>
```

## Components

### GoogleSignInButton Component
```jsx
import { useAccount } from '../lib/AccountContext'

export function GoogleSignInButton() {
  const { user, openAuthPanel } = useAccount()

  useEffect(() => {
    if (!window.google) return

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse
    })
  }, [])

  const handleCredentialResponse = async (response) => {
    // Send token to backend
    // Backend verifies with Google
    // Create/update user in Supabase
  }

  return (
    <div id="google_signin_button"></div>
  )
}
```

## Backend Integration

### Verify Google Token

```javascript
// api/google-auth.js
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  return ticket.getPayload()
}
```

### Create/Update User

```javascript
// POST /api/auth/google
async function handleGoogleAuth(req, res) {
  const { idToken } = req.body
  
  // Verify token
  const payload = await verifyGoogleToken(idToken)
  
  // Create or update user
  const { email, name, picture } = payload
  
  const { data: user, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      display_name: name,
      avatar_url: picture,
      oauth_provider: 'google'
    }
  })
  
  return res.json({ user })
}
```

## Integration with SlideinAuthPanel

### Add Google Button to Forms

```jsx
// In SlideinAuthPanel.jsx
import { GoogleSignInButton } from './GoogleSignInButton'

export function SlideinAuthPanel() {
  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Email/password fields */}
      </form>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-token" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-surface text-muted">Or continue with</span>
        </div>
      </div>
      
      <GoogleSignInButton />
    </>
  )
}
```

## Testing

### Test OAuth Flow
```
1. Click "Continue with Google"
2. Select Google account
3. Verify redirects to dashboard
4. Check profile shows Google data
5. Test logout and relogin
```

### Test Account Linking
```
1. Sign up with email
2. Log out
3. Try Google Sign-In with same email
4. Should log in existing account
```

## API Endpoint

### POST `/api/auth/google`

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2M2Q..."
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "display_name": "John Doe",
    "avatar_url": "https://..."
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

## Security Considerations

1. **Verify token server-side** - Never trust client-side verification
2. **Check token expiry** - Don't accept expired tokens
3. **Validate audience** - Ensure token is for your app
4. **Use HTTPS** - Always in production
5. **Store securely** - Don't log tokens
6. **Rate limit** - Prevent abuse

## Troubleshooting

### "Failed to initialize Google Sign-In"
- Check Client ID in .env
- Verify SDK script loaded
- Check console for errors

### "Invalid Client ID"
- Copy correct Client ID from Google Cloud
- Check origins match settings
- Verify script src URL

### Token Verification Fails
- Check Client Secret (if needed)
- Verify token not expired
- Check audience matches app

## Advanced: Multiple Auth Methods

You can support multiple auth methods:

```jsx
// Show options in panel
<div className="space-y-2">
  <button className="email-login">Email & Password</button>
  <button className="google-login">Google</button>
  <button className="github-login">GitHub</button>
</div>
```

## Account Linking

If user signs up with email but later uses Google:

```javascript
// Check if email exists
const { data: user } = await supabase.auth.admin.getUserByEmail(email)

if (user) {
  // Link Google to existing account
  await linkOAuthProvider(user.id, 'google')
} else {
  // Create new account
  await createNewUser(email, provider)
}
```

## Logout with Google

```javascript
async function handleLogout() {
  await logout()
  
  // Also revoke Google session (optional)
  if (window.google) {
    window.google.accounts.id.revoke()
  }
}
```

## Resources

- [Google Identity Services Docs](https://developers.google.com/identity/gsi/web)
- [Google Auth Library Docs](https://github.com/googleapis/google-auth-library-nodejs)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [OpenID Connect](https://openid.net/connect/)

## Next Steps

1. Get Google Client ID
2. Add to environment variables
3. Test OAuth flow
4. Handle account linking
5. Add GitHub/Microsoft Sign-In
6. Implement account connection management

## Support

For issues:
1. Check Google Cloud Console settings
2. Verify Client ID and URLs
3. Check browser console logs
4. Review backend error logs
5. Test with Google OAuth Playground
