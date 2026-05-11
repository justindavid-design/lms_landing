# Strong Password Requirements

## Overview
Academee now enforces strong password requirements across all authentication flows to enhance security.

## Password Rules
Every password must contain **ALL** of the following:

| Requirement | Example | Pattern |
|-------------|---------|---------|
| **8+ characters** | "ExamPass123!" | Length ≥ 8 |
| **Uppercase letter** | "ExamPass123!" | [A-Z] |
| **Lowercase letter** | "ExamPass123!" | [a-z] |
| **Number** | "ExamPass123!" | [0-9] |
| **Special character** | "ExamPass123!" | !@#$%^&*()_+-=[]{};"'\\,.<>/? |

## Valid Password Examples
✅ `SecurePass123!`  
✅ `MyPassword@2024`  
✅ `Academee#Login5`  

## Invalid Password Examples
❌ `password123` (no uppercase, no special char)  
❌ `PASSWORD123` (no lowercase)  
❌ `Pass123` (7 chars, needs 8+)  
❌ `MyPassword` (no number, no special char)  

## Where Validation Occurs
1. **User Registration** - `src/components/EnhancedForms.jsx` + `api/auth.js`
2. **Password Reset** - `src/components/RecoverReset.jsx` + `api/reset-password.js`
3. **Password Change** - `src/components/AccountSettings.jsx` + `api/profile.js`

## User Feedback
- **Real-time validation**: Users see requirements checklist as they type
- **Visual indicators**: ✓ for met requirements, ○ for unmet
- **Specific errors**: Clear messages guide users to fix each requirement

## Development Notes
- Special character regex: `/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/`
- Validation is performed on both **frontend** (UX) and **backend** (security)
- Existing users can keep weak passwords until next change
- All password change operations require strong password enforcement

## Testing
When testing authentication flows, use valid strong passwords:
- `TestPassword123!`
- `Demo@Account2024`
- `Secure#Login99`
