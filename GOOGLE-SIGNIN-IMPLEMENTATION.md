# Google Sign-In Integration Implementation Guide

## Quick Start (5 Steps)

### Step 1: Install Dependencies
```bash
npm install google-auth-library jsonwebtoken
```

### Step 2: Get Google OAuth Credentials
Follow the setup in [GOOGLE-SIGNIN-SETUP.md](./GOOGLE-SIGNIN-SETUP.md)

### Step 3: Update Environment Variables
Copy `.env.example` to `.env` and fill in:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
JWT_SECRET=openssl-generated-32-char-secret
```

Generate JWT_SECRET:
```bash
openssl rand -hex 32
```

### Step 4: Database Migration
Run in Supabase SQL Editor:
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_google_id ON public.profiles(google_id);
```

### Step 5: Update Routes & Providers
- Update `src/App.jsx` to wrap app with `GoogleAuthProvider`
- Update routes to use `ProtectedRoute` for authenticated pages
- Replace `Login.jsx` or use `LoginWithGoogle.jsx`

---

## File Structure

```
src/
├── components/
│   ├── Login.jsx (original - optional)
│   ├── LoginWithGoogle.jsx (NEW - use this)
│   ├── GoogleSignInButton.jsx (NEW)
│   ├── GoogleLogoutButton.jsx (NEW)
│   └── dashboard/
│       └── Dashboard.jsx (wrap with ProtectedRoute)
├── lib/
│   ├── AuthProvider.jsx (existing - keep for Supabase)
│   ├── GoogleAuthProvider.jsx (NEW)
│   ├── ProtectedRoute.jsx (NEW)
│   └── supabaseClient.js (existing)

api/
├── google-auth.js (NEW)
├── auth-middleware.js (NEW)
└── ... (existing)

api-server.js (UPDATED - added Google routes)
index.html (UPDATED - added Google SDK)
package.json (UPDATED - added dependencies)
.env.example (UPDATED - added Google config)
```

---

## Implementation Details

### Frontend Flow

1. **Google Sign-In Button** (`GoogleSignInButton.jsx`)
   - Initializes Google SDK on mount
   - Handles user clicking "Sign in with Google"
   - Receives ID token from Google
   - Sends token to `/api/auth/google`
   - Stores access & refresh tokens in sessionStorage

2. **Auth Provider** (`GoogleAuthProvider.jsx`)
   - Manages auth state globally
   - Automatically refreshes tokens before expiry
   - Provides hooks: `useGoogleAuth()`, `useAuthHeaders()`, `useAuthenticatedFetch()`
   - Cleans up on logout

3. **Protected Routes** (`ProtectedRoute.jsx`)
   - Checks for valid JWT token
   - Redirects to login if not authenticated
   - Preserves location for post-login redirect

### Backend Flow

1. **Google Auth Handler** (`api/google-auth.js`)
   - Verifies Google ID token with Google API
   - Checks if user exists in DB
   - Creates new user or updates existing
   - Generates JWT access token (1 hour)
   - Generates refresh token (7 days)
   - Returns user data + tokens

2. **Auth Middleware** (`api/auth-middleware.js`)
   - Verifies JWT from Authorization header
   - Handles token refresh requests
   - Provides route protection via middleware

3. **API Server** (`api-server.js`)
   - Routes: `POST /api/auth/google`
   - Routes: `POST /api/auth/refresh`
   - Routes: `GET /api/auth/verify` (protected example)

---

## Usage Examples

### 1. Wrapping App with Provider

```jsx
// src/main.jsx
import { GoogleAuthProvider } from './lib/GoogleAuthProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleAuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleAuthProvider>
  </React.StrictMode>
)
```

### 2. Using Google Sign-In Button

```jsx
// src/components/LoginPage.jsx
import GoogleSignInButton from './GoogleSignInButton'

export default function LoginPage() {
  const handleSuccess = (user) => {
    console.log('User logged in:', user)
    navigate('/dashboard')
  }

  return (
    <GoogleSignInButton 
      onSuccess={handleSuccess}
      onError={(err) => console.error(err)}
    />
  )
}
```

### 3. Using Logout Button

```jsx
// src/components/dashboard/Navbar.jsx
import GoogleLogoutButton from '../GoogleLogoutButton'

export default function Navbar() {
  return (
    <nav>
      {/* ... other nav items ... */}
      <GoogleLogoutButton />
    </nav>
  )
}
```

### 4. Protecting Routes

```jsx
// src/App.jsx
import ProtectedRoute from './lib/ProtectedRoute'
import Dashboard from './components/dashboard/Dashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginWithGoogle />} />
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}
```

### 5. Using Auth Headers in API Calls

```jsx
// src/components/dashboard/Courses.jsx
import { useAuthenticatedFetch } from '../lib/GoogleAuthProvider'

export default function Courses() {
  const fetchWithAuth = useAuthenticatedFetch()

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetchWithAuth('/api/courses', {
          method: 'GET',
        })
        const courses = await response.json()
        setCourses(courses)
      } catch (error) {
        console.error('Failed to load courses:', error)
      }
    }

    loadCourses()
  }, [fetchWithAuth])

  return (/* ... */)
}
```

### 6. Using Auth Context for Conditional UI

```jsx
// src/components/UserMenu.jsx
import { useGoogleAuth } from '../lib/GoogleAuthProvider'

export default function UserMenu() {
  const { user, isAuthenticated, logout } = useGoogleAuth()

  if (!isAuthenticated) {
    return <Link to="/login">Login</Link>
  }

  return (
    <div>
      <span>{user?.name}</span>
      <img src={user?.picture} alt={user?.name} />
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

---

## Making Protected API Calls

### From Backend (Server-to-Server)

```javascript
// api/protected-endpoint.js
const authMiddleware = require('./auth-middleware')

// In api-server.js
app.get('/api/protected', authMiddleware.verifyAuthToken, async (req, res) => {
  const userId = req.user.userId
  const email = req.user.email

  // Use userId to fetch user-specific data
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  res.json(data)
})
```

### From Frontend (Client-to-Server)

```javascript
const { useAuthenticatedFetch } = require('../lib/GoogleAuthProvider')

function MyComponent() {
  const fetchWithAuth = useAuthenticatedFetch()

  const handleFetch = async () => {
    // Token is automatically added via Authorization header
    const response = await fetchWithAuth('/api/protected', {
      method: 'GET',
    })
    const data = await response.json()
  }
}
```

---

## Security Checklist

- ✅ Google ID token verified server-side
- ✅ JWT tokens signed with strong secret
- ✅ Access tokens short-lived (1 hour)
- ✅ Refresh tokens long-lived (7 days)
- ✅ Tokens stored in sessionStorage (cleared on browser close)
- ✅ Authorization header for API calls
- ✅ HTTPS recommended for production
- ✅ CORS configured for trusted domains
- ✅ Email verification required from Google
- ✅ User data validated before DB operations

---

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid client_id" | Wrong Google Client ID | Check VITE_GOOGLE_CLIENT_ID in .env |
| CORS error on sign-in | Domain not in Google Console | Add localhost & domain to OAuth consent screen |
| "Token verification failed" | Invalid JWT_SECRET | Ensure JWT_SECRET is set & consistent |
| "User not created" | DB permissions | Check Supabase role permissions |
| Token not sent to API | Not using useAuthenticatedFetch | Use the hook or manually add Authorization header |
| "Redirect URI mismatch" | Incorrect callback URL | Verify redirect URIs match exactly in Google Console |

---

## Testing

### Development

1. Start backend: `npm run api`
2. Start frontend: `npm run dev`
3. Navigate to `http://localhost:5173/login`
4. Click "Sign in with Google"
5. Use test account configured in Google Cloud Console
6. Check browser DevTools → Network tab for `/api/auth/google` request
7. Verify token in sessionStorage (DevTools → Application)

### Production

1. Update Google Cloud Console with production domain
2. Set `NODE_ENV=production`
3. Enable HTTPS
4. Test full auth flow
5. Monitor API logs for errors
6. Verify user data in Supabase

---

## Migration from OTP to Google

If migrating existing OTP users:

1. Keep existing OTP routes working
2. Make Google the default on login page
3. Allow linking Google account to existing OTP users
4. Gradually migrate users
5. Eventually deprecate OTP routes

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Create Google Cloud Project and OAuth credentials
3. ✅ Update .env with credentials
4. ✅ Run database migration
5. ✅ Wrap App with GoogleAuthProvider
6. ✅ Use LoginWithGoogle component
7. ✅ Test login/logout flow
8. ✅ Test token refresh
9. ✅ Deploy to production

