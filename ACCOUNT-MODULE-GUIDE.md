# Complete Account Module Implementation

## Overview

This guide covers the complete account module with slide-in authentication panel, protected routes, and user dashboard with profile management.

## Components Created

### 1. **AccountContext** (`src/lib/AccountContext.jsx`)
Global state management for authentication and user data.

**Features:**
- User state management
- Login/signup handling
- Session persistence
- Auth panel state
- Logout functionality

**Usage:**
```jsx
import { useAccount } from '../lib/AccountContext'

function MyComponent() {
  const { user, loading, error, openAuthPanel, logout } = useAccount()
  
  return (
    <>
      {user && <p>Welcome {user.email}</p>}
      <button onClick={() => openAuthPanel('login')}>Log in</button>
      <button onClick={logout}>Log out</button>
    </>
  )
}
```

### 2. **SlideinAuthPanel** (`src/components/SlideinAuthPanel.jsx`)
Slide-in authentication panel triggered by header buttons.

**Features:**
- Slide-in animation from right (300ms)
- Backdrop overlay with click-outside close
- Toggle between login and signup modes
- Real-time field validation
- Password visibility toggle
- Error message display
- Loading states
- Auto-clear errors on input

**Field Validation:**
- Email: Regex format validation
- Password: Min 6 characters
- Confirm Password: Must match (signup only)
- Validate on blur and submit

**Keyboard Shortcuts:**
- ESC key closes panel

### 3. **Updated Hero** (`src/components/Hero.jsx`)
Landing page header with login/signup buttons.

**Changes:**
- Buttons trigger slide-in panel instead of linking to routes
- Shows "Dashboard" link when authenticated
- Shows "Log out" button when authenticated

### 4. **AccountSettings** (`src/components/AccountSettings.jsx`)
User account settings and profile management dashboard.

**Tabs:**
1. **Profile Tab**
   - Display Name (editable)
   - Email (read-only)
   - Update button with loading state

2. **Password Tab**
   - New Password field
   - Confirm Password field
   - Update button with validation

**Features:**
- Success/error messages with auto-dismiss
- Loading states on buttons
- Logout button at bottom
- Responsive design

### 5. **ProtectedRoute** (`src/lib/ProtectedRoute.jsx`)
Route wrapper requiring authentication.

**Usage:**
```jsx
<Route path="/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
```

## Backend API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`
Register new user.

**Request:**
```json
{
  "email": "user@domain.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@domain.com",
    "display_name": "John Doe"
  }
}
```

#### POST `/api/auth/login`
Login user.

**Request:**
```json
{
  "email": "user@domain.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@domain.com",
    "display_name": "John Doe"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```

**Error Responses:**
- `401` - Invalid email or password
- `400` - Email and password required
- `500` - Login failed

#### POST `/api/auth/refresh`
Refresh access token.

**Request:**
```json
{
  "refresh_token": "refresh_token"
}
```

**Response (200):**
```json
{
  "session": {
    "access_token": "new_jwt_token",
    "refresh_token": "new_refresh_token",
    "expires_in": 3600
  }
}
```

### Profile Endpoints

#### GET `/api/profile`
Get current user's profile. Requires Authorization header.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@domain.com",
  "displayName": "John Doe",
  "avatar": "url",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### PUT `/api/profile`
Update user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "displayName": "New Name",
  "avatar": "url"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@domain.com",
  "displayName": "New Name",
  "avatar": "url"
}
```

#### PUT `/api/profile/password`
Update user password.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true
}
```

## Setup Instructions

### 1. Environment Variables

Add to `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Configuration

1. Go to Supabase Dashboard
2. Create a new project
3. Go to Authentication settings
4. Enable Email/Password auth
5. Copy URL and Anon Key to .env

### 3. Update App.jsx

The App.jsx is already updated to:
- Wrap app with `AccountProvider`
- Include `SlideinAuthPanel`
- Add protected route for `/account`
- Import necessary components

### 4. Database Schema

Create these tables in Supabase (optional, for additional user data):

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Usage Examples

### Trigger Login Panel
```jsx
import { useAccount } from '../lib/AccountContext'

function LoginButton() {
  const { openAuthPanel } = useAccount()
  
  return (
    <button onClick={() => openAuthPanel('login')}>
      Log in
    </button>
  )
}
```

### Check Authentication Status
```jsx
function Dashboard() {
  const { user, loading } = useAccount()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>
  
  return <div>Welcome {user.email}</div>
}
```

### Access Protected Route
```jsx
<Route 
  path="/account" 
  element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} 
/>
```

### Logout
```jsx
function LogoutButton() {
  const { logout } = useAccount()
  
  return (
    <button onClick={logout}>
      Log out
    </button>
  )
}
```

## Security Features

1. **Session Persistence**: User session restored on page reload
2. **Auth State Listener**: Automatic sync with Supabase auth changes
3. **Protected Routes**: ProtectedRoute wrapper redirects unauthenticated users
4. **Password Hashing**: Handled by Supabase
5. **JWT Tokens**: Secure token-based authentication
6. **Validation**: Client-side and server-side validation
7. **Error Handling**: Secure error messages without exposing sensitive info

## Customization

### Change Slide-In Direction
In `SlideinAuthPanel.jsx`, update the CSS:
```css
@keyframes slideIn {
  from {
    transform: translateX(-100%);  /* From left instead of right */
    opacity: 0;
  }
}
```

### Change Colors
Update button colors in `SlideinAuthPanel.jsx`:
```jsx
className="bg-[#2f6b3f] hover:bg-[#285636]"
// Change hex values
```

### Add Custom Fields
In `AccountSettings.jsx`, add new form fields:
```jsx
const [customField, setCustomField] = useState('')

// Add input
<input
  value={customField}
  onChange={(e) => setCustomField(e.target.value)}
/>
```

## Troubleshooting

### "useAccount must be used within AccountProvider"
- Ensure AccountProvider wraps your component
- Check App.jsx has AccountProvider at root level

### Session not persisting
- Clear browser storage and refresh
- Check Supabase auth settings
- Verify .env variables are set correctly

### Login panel not appearing
- Check if Hero component is imported
- Verify SlideinAuthPanel is in Router
- Check browser console for errors

### Protected routes not working
- Ensure ProtectedRoute wraps the component
- Check user state in AccountContext
- Verify loading state is handled

## Next Steps

1. Test login/signup flow
2. Test protected route access
3. Verify profile updates work
4. Add profile avatar upload
5. Implement Google Sign-In integration
6. Add email verification
7. Add password reset flow
8. Add two-factor authentication
