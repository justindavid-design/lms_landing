# Account Module - UI/UX Flow Guide

## User Flows

### Flow 1: New User Registration

```
┌─────────────────────────────────────────────────────┐
│ LANDING PAGE (/)                                    │
│                                                     │
│ [LOGO]  [Nav Items]  [Log in] [Create account]     │
│                                                     │
│ "Learning that feels clear..."                     │
│ [Get started] [Log in]                            │
└─────────────────────────────────────────────────────┘
                        ↓
                Click "Create account"
                        ↓
┌──────────────────────────────┐
│ SLIDE-IN PANEL (Right)       │
│ ┌──────────────────────────┐ │
│ │ Create account      [×]  │ │
│ ├──────────────────────────┤ │
│ │                          │ │
│ │ Email *                  │ │
│ │ [________________]       │ │
│ │                          │ │
│ │ Password *               │ │
│ │ [________________] [👁]  │ │
│ │                          │ │
│ │ Confirm Password *       │ │
│ │ [________________] [👁]  │ │
│ │                          │ │
│ │ [Create account] ◐       │ │
│ │                          │ │
│ │ Already have an...       │ │
│ │ [Log in]                 │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
[Backdrop overlay]
                        ↓
        User enters valid credentials
                        ↓
        Panel closes, redirected to dashboard
                        ↓
┌─────────────────────────────────────────────────────┐
│ DASHBOARD (authenticated)                           │
│                                                     │
│ [LOGO]  [Nav]  [Dashboard] [Log out]               │
│                                                     │
│ [Courses] [Quizzes] [Tasks] [Calendar]            │
└─────────────────────────────────────────────────────┘
```

### Flow 2: Existing User Login

```
┌─────────────────────────────────────────────────────┐
│ LANDING PAGE (/)                                    │
│                                                     │
│ [LOGO]  [Nav Items]  [Log in] [Create account]     │
└─────────────────────────────────────────────────────┘
                        ↓
                  Click "Log in"
                        ↓
┌──────────────────────────────┐
│ SLIDE-IN PANEL (Right)       │
│ ┌──────────────────────────┐ │
│ │ Log in              [×]  │ │
│ ├──────────────────────────┤ │
│ │                          │ │
│ │ Email *                  │ │
│ │ [________________]       │ │
│ │                          │ │
│ │ Password *  [Forgot?]    │ │
│ │ [________________] [👁]  │ │
│ │                          │ │
│ │ ☑ Remember me            │ │
│ │                          │ │
│ │ [Log in] ◐               │ │
│ │                          │ │
│ │ No account?              │ │
│ │ [Sign up]                │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
                        ↓
        User enters credentials and clicks Log in
                        ↓
        (Validation)
        On blur: Real-time field errors
        On submit: Final validation
                        ↓
        Valid credentials → Supabase login
                        ↓
        Panel closes, hero shows:
        [Dashboard] [Log out] buttons
```

### Flow 3: Session Persistence

```
User visits landing page
       ↓
AccountContext useEffect runs
       ↓
supabase.auth.getSession() called
       ↓
User session exists?
       ├─ YES → restore user state
       │         Hero shows [Dashboard] [Log out]
       │
       └─ NO → show [Log in] [Create account]
```

### Flow 4: Accessing Protected Route

```
User clicks "Dashboard" or tries /account
       ↓
ProtectedRoute component renders
       ↓
Check: Is user authenticated?
       ├─ YES → loading? 
       │         ├─ YES → Show Loading spinner
       │         └─ NO → Render AccountSettings page
       │
       └─ NO → Redirect to home (/)
```

### Flow 5: Profile Management

```
User clicks profile/account link
       ↓
ProtectedRoute checks authentication
       ↓
If authenticated, render AccountSettings
       ↓
┌──────────────────────────────────────────┐
│ ACCOUNT SETTINGS PAGE                    │
├──────────────────────────────────────────┤
│ [Profile] [Password]                     │
├──────────────────────────────────────────┤
│ Profile Tab (active)                     │
│                                          │
│ Email (read-only)                        │
│ [user@domain.com]  disabled              │
│                                          │
│ Display Name (editable)                  │
│ [John Doe       ]                        │
│                                          │
│ [Update Profile]                         │
│                                          │
├──────────────────────────────────────────┤
│ ✓ Profile updated successfully           │
│ (auto-dismiss after 3 seconds)           │
└──────────────────────────────────────────┘
```

### Flow 6: Change Password

```
On Account Settings page
       ↓
Click "Password" tab
       ↓
┌──────────────────────────────────────────┐
│ PASSWORD TAB                             │
├──────────────────────────────────────────┤
│ New Password                             │
│ [________________]                       │
│                                          │
│ Confirm Password                         │
│ [________________]                       │
│                                          │
│ [Update Password]                        │
└──────────────────────────────────────────┘
       ↓
Validate passwords match and meet requirements
       ↓
If valid → Update in Supabase
       ↓
Show success message
       ↓
Clear form fields
```

### Flow 7: Logout

```
User clicks "Log out" button
       ↓
logout() function called
       ↓
supabase.auth.signOut()
       ↓
User state cleared in context
       ↓
Redirect to home (/)
       ↓
Hero shows [Log in] [Create account] again
```

## Validation Flows

### Email Validation
```
User types email
       ↓
On blur (focus leaves field)
       ↓
Validate: Email format (regex)
       ├─ Valid → No error message
       └─ Invalid → Show error below field
                    Mark field with red border
                    Mark field as touched
       ↓
User types in field again
       ↓
Real-time validation on change
       ├─ Error fixed → Remove error message
       └─ Still invalid → Keep error showing
```

### Password Validation
```
User types password
       ↓
On blur
       ↓
Validate: Min 6 characters
       ├─ Valid → No error
       └─ Invalid → Show "Minimum 6 characters"
                    Red border on input
                    Mark as touched
       ↓
If signup form, also validate confirm password match
       ├─ Match → Clear error
       └─ No match → Show "Passwords do not match"
```

### Form Submission
```
User clicks submit button
       ↓
Mark all fields as touched
       ↓
Validate all fields
       ├─ Any invalid? → Show all errors, don't submit
       │
       └─ All valid? → Disable button
                       Show loading spinner
                       Send to backend
                       ↓
                       Backend validates again
                       ↓
                       If valid → Create session
                       If invalid → Return error code
                       ↓
                       Map error to user message
                       ↓
                       Show error in panel
                       Re-enable button
                       ↓
                       On input, clear error
```

## Error Flow

### Display Error

```
User makes request
       ↓
Backend returns error (401, 404, 500)
       ↓
Error mapped to user-friendly message
       ├─ 401 → "Invalid email or password"
       ├─ 404 → "User not found"
       ├─ 409 → "Email already registered"
       └─ 500 → "Something went wrong"
       ↓
Error displayed in red box at top of form
       ↓
Button becomes enabled again
       ↓
User can type in any field
       ↓
On change → error clears immediately
```

### Inline Field Error

```
User types invalid input
       ↓
On blur validation
       ├─ Email invalid?
       │  └─ Show error below email field
       │     Red border on input
       │
       ├─ Password too short?
       │  └─ Show error below password field
       │     Red border on input
       │
       └─ Passwords don't match?
          └─ Show error below confirm field
             Red border on input
       ↓
User types/changes input
       ↓
Real-time validation on change
       ├─ Now valid? → Error disappears
       └─ Still invalid? → Error stays
```

## Animation Flow

### Panel Slide-In

```
User clicks "Log in" / "Create account"
       ↓
setShowAuthPanel(true)
       ↓
CSS animation triggers:
       ├─ Transform: translateX(100%) → translateX(0)
       ├─ Opacity: 0 → 1
       ├─ Duration: 300ms
       └─ Easing: ease-out
       ↓
Panel visible on right side
Backdrop visible (click closes it)
```

### Modal Close Animation

```
User clicks close button [×] or ESC key
       ↓
setShowAuthPanel(false)
       ↓
Animation reverses:
       ├─ Transform: translateX(0) → translateX(100%)
       ├─ Opacity: 1 → 0
       ├─ Duration: 300ms
       └─ Easing: ease-out
       ↓
Panel removed from DOM
```

### Loading Spinner

```
User clicks submit button
       ↓
Button shows spinner: ◐
       ↓
Button disabled (greyed out)
       ↓
Spinner rotates continuously
       ↓
API request processing
       ↓
Response received
       ↓
Spinner disappears
Button text updates (error or success)
Button enabled again
```

## Mobile vs Desktop

### Mobile (< 768px)
```
┌─────────────────────┐
│ [×]     Create      │  ← Panel takes full height
│ ┌───────────────────┤
│ │ Email             │
│ │ [            ]    │
│ │                   │
│ │ Password          │
│ │ [            ] 👁 │
│ │                   │
│ │ [Create account]  │
│ │                   │
│ │ Log in instead    │
│ └───────────────────┘
└─────────────────────┘

Behind panel: Backdrop overlay
Tap outside: Panel closes
```

### Desktop (>= 768px)
```
Hero Content      │ [×] Create
                  ├─────────────────
                  │ Email
                  │ [                ]
                  │ Password
                  │ [           ] 👁
                  │ [Create account]
                  │ Log in instead
```

## Keyboard Navigation

### Tab Order
```
1. Email field
2. Password field
3. Confirm field (signup) / Remember checkbox (login)
4. Submit button
5. Toggle link (Sign up / Log in)
6. Close button [×]
```

### Keyboard Shortcuts
```
- TAB: Move to next field
- SHIFT+TAB: Move to previous field
- ENTER: Submit form (when focused on button)
- ESC: Close panel
- SPACE: Toggle visibility button
```

## Accessibility Features

- ✅ Semantic HTML (form, input, label)
- ✅ ARIA labels on buttons
- ✅ Focus indicators
- ✅ Color contrast ratios
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Error announcements
- ✅ Loading state feedback

## State Indicators

### Loading State
```
Button: "Signing in..." + spinner
Background: Slightly dimmed
Inputs: Disabled
```

### Error State
```
Field: Red border
Error text: Red, below field
General error: Red box at top
Shake animation: Optional
```

### Success State
```
Panel closes automatically
Hero updates to show Dashboard
Success toast: Optional
```

## Visual Hierarchy

### Primary Actions
```
[Create account] - Green, bold, prominent
[Log in] - Green, bold, prominent
[Update Profile] - Green
```

### Secondary Actions
```
[Log in instead] - Text link
[Forgot?] - Text link, small
[Sign up] - Text link
```

### Tertiary Actions
```
[×] Close - Icon button
Checkbox - Small
```

## Color Usage

```
Primary: #2f6b3f (green)
Success: #10b981 (green)
Error: #dc2626 (red)
Warning: #f59e0b (amber)
Info: #3b82f6 (blue)
Neutral: --text-main, --muted
Background: --app, --surface
```

---

This guide provides a comprehensive visual representation of all user flows and interactions in the account module.
