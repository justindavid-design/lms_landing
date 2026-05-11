# Account Module - Quick Reference

## What Was Built

✅ **Slide-in Authentication Panel** - Right-side panel with login/signup forms  
✅ **Form Validation** - Email format, password min length, confirm password  
✅ **Error Handling** - Inline field errors, general errors, auto-clear on input  
✅ **Session Management** - Automatic login, session persistence, logout  
✅ **Protected Routes** - Redirect unauthenticated users to home  
✅ **Account Settings** - Profile updates, password change, logout  
✅ **Global State** - AccountContext for user & auth state  
✅ **Backend Integration** - Express API with auth endpoints  

## File Structure

```
src/
├── App.jsx (updated - wrapped with AccountProvider)
├── components/
│   ├── Hero.jsx (updated - triggers slide-in panel)
│   ├── SlideinAuthPanel.jsx (NEW - auth forms in slide-in)
│   └── AccountSettings.jsx (NEW - profile management)
├── lib/
│   ├── AccountContext.jsx (NEW - global auth state)
│   └── ProtectedRoute.jsx (updated - auth check)
api/
├── auth.js (updated - auth endpoints)
└── profile.js (updated - profile endpoints)
```

## Key Components

### AccountContext
```jsx
const { user, loading, error, showAuthPanel, authMode, login, signup, logout, openAuthPanel, closeAuthPanel } = useAccount()
```

### SlideinAuthPanel
- Imports: `useAccount`
- Features: Validation, errors, toggle mode, ESC close
- Styles: Slide-in animation, backdrop overlay

### Hero
- Updated with `useAccount` hook
- Shows "Dashboard" when logged in
- Shows "Log out" button when logged in

### AccountSettings
- Protected route (requires auth)
- Two tabs: Profile & Password
- Success/error messages

### ProtectedRoute
- Wraps protected components
- Redirects unauthenticated users to home

## How It Works

### 1. User Clicks Login
```
Hero "Log in" button
  ↓
useAccount().openAuthPanel('login')
  ↓
SlideinAuthPanel appears with login form
```

### 2. User Enters Credentials
```
Form validates on blur
  ↓
Real-time error display
  ↓
User submits form
  ↓
Final validation
  ↓
Call useAccount().login(email, password)
```

### 3. Login Success
```
Supabase auth.signInWithPassword()
  ↓
User stored in context
  ↓
Session persisted
  ↓
Panel closes automatically
  ↓
Hero shows "Dashboard" button
```

### 4. Access Protected Page
```
Click "Dashboard" or "/account"
  ↓
ProtectedRoute checks useAccount().user
  ↓
If authenticated → render component
  ↓
If not → redirect to home
```

### 5. Logout
```
Click logout button
  ↓
useAccount().logout()
  ↓
supabase.auth.signOut()
  ↓
User state cleared
  ↓
Redirected to home
```

## API Endpoints

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET /api/profile
PUT /api/profile
PUT /api/profile/password
```

## Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
```

### Supabase Setup
1. Create project
2. Enable Email/Password auth
3. Copy credentials to .env

## Common Tasks

### Trigger Auth Panel
```jsx
import { useAccount } from '../lib/AccountContext'

function MyComponent() {
  const { openAuthPanel } = useAccount()
  return <button onClick={() => openAuthPanel('signup')}>Sign Up</button>
}
```

### Check User Logged In
```jsx
const { user, loading } = useAccount()
if (loading) return <div>Loading...</div>
if (!user) return <div>Please log in</div>
return <div>Welcome {user.email}</div>
```

### Protect a Route
```jsx
<Route 
  path="/mypage" 
  element={<ProtectedRoute><MyPage /></ProtectedRoute>} 
/>
```

### Get User Info
```jsx
const { user } = useAccount()
console.log(user.id)
console.log(user.email)
console.log(user.user_metadata?.display_name)
```

### Handle Logout
```jsx
const { logout } = useAccount()
<button onClick={logout}>Log Out</button>
```

## Validation Rules

| Field | Rule | Message |
|-------|------|---------|
| Email | Required + format | "Email is required" / "Invalid email format" |
| Password | Required + min 6 | "Password is required" / "Minimum 6 characters" |
| Confirm | Match password | "Passwords do not match" |

## Error Messages

| Scenario | Message |
|----------|---------|
| Invalid credentials | "Invalid email or password" |
| Email not found | "User not found" |
| Server error | "Something went wrong" |
| Network error | "Network error" |
| Account exists | "Email already registered" |

## Styling Classes

```css
.landing-pill /* Primary CTA button */
.landing-pill-primary /* Green background */
.landing-pill-secondary /* Border style */
.input-base /* Form inputs */
.primary-btn /* Submit buttons */
```

## State Management

```jsx
// User state
user: null | { id, email, user_metadata }
loading: boolean
error: string | null
showAuthPanel: boolean
authMode: 'login' | 'signup'
```

## Features

✅ Email/password auth  
✅ Form validation  
✅ Error handling  
✅ Session persistence  
✅ Protected routes  
✅ Profile management  
✅ Password updates  
✅ Logout  
✅ Responsive design  
✅ Accessibility  

## Next Steps

1. **Test the flow**: Try login/signup
2. **Verify session**: Reload page, should stay logged in
3. **Test protected route**: Try accessing `/account` when logged out
4. **Add avatar**: Implement user avatar in profile
5. **Email verification**: Add email confirmation step
6. **Password reset**: Implement forgot password flow
7. **Google Sign-In**: Add OAuth integration
8. **Two-Factor Auth**: Add 2FA for security

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Panel not appearing | Check Hero component, ensure SlideinAuthPanel in Router |
| Login fails | Check .env variables, Supabase project |
| Session lost | Clear storage, refresh browser |
| Protected route shows home | Check ProtectedRoute component |
| Validation not working | Check input onBlur handlers |

## Performance Tips

- Session persists automatically
- Validation throttled to blur events
- Errors auto-clear on input
- Loading states prevent double-submit
- Animations use GPU (transform/opacity)

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported

## Mobile Considerations

- Slide-in panel responsive
- Backdrop overlay on mobile
- Touch-friendly inputs
- Keyboard support on focus
- Auto-dismiss on submit
