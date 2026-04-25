import React, { useState, useEffect, useRef } from 'react'
import { CloudUpload, X } from 'lucide-react'

const ROLES = ['Student', 'Teacher', 'Teaching Assistant', 'School Admin']
const BIO_MAX_LENGTH = 200

export default function ProfileSettings() {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [role, setRole] = useState('Student')
  const [profilePicture, setProfilePicture] = useState(null)
  const [altText, setAltText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = JSON.parse(window.localStorage.getItem('userProfile') || '{}')
      if (savedProfile.displayName) setDisplayName(savedProfile.displayName)
      if (savedProfile.bio) setBio(savedProfile.bio)
      if (savedProfile.role) setRole(savedProfile.role)
      if (savedProfile.profilePicture) setProfilePicture(savedProfile.profilePicture)
      if (savedProfile.altText) setAltText(savedProfile.altText)
    } catch (_e) {
      // Ignore parsing errors
    }
  }, [])

  // Auto-dismiss save message after 2 seconds
  useEffect(() => {
    if (!saveMessage) return
    const timer = setTimeout(() => setSaveMessage(''), 2000)
    return () => clearTimeout(timer)
  }, [saveMessage])

  const validateForm = () => {
    const newErrors = {}

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required'
    } else if (displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters'
    } else if (displayName.trim().length > 50) {
      newErrors.displayName = 'Display name must not exceed 50 characters'
    }

    if (bio.length > BIO_MAX_LENGTH) {
      newErrors.bio = 'Bio exceeds maximum length'
    }

    if (!role) {
      newErrors.role = 'Role is required'
    }

    return newErrors
  }

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Please upload an image file' }))
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image must be less than 5MB' }))
      return
    }

    // Clear image error
    setErrors((prev) => {
      const updated = { ...prev }
      delete updated.image
      return updated
    })

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (event) => {
      setProfilePicture(event.target?.result)
    }
    reader.readAsDataURL(file)
  }

  const removeProfilePicture = () => {
    setProfilePicture(null)
    setAltText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()

    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    setIsLoading(true)
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600))

      const profileData = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        role,
        profilePicture,
        altText: altText.trim(),
      }

      window.localStorage.setItem('userProfile', JSON.stringify(profileData))
      setSaveMessage('Profile updated successfully!')
      setErrors({})
    } catch (err) {
      console.error('Failed to save profile:', err)
      setSaveMessage('Failed to save profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const bioCharactersRemaining = BIO_MAX_LENGTH - bio.length
  const bioPercentage = (bio.length / BIO_MAX_LENGTH) * 100

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Success/Error Message */}
        {saveMessage && (
          <div
            role="status"
            aria-live="polite"
            className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800"
          >
            {saveMessage}
          </div>
        )}

        {/* Image Upload Section */}
        <fieldset className="rounded-lg border border-token bg-surface p-6">
          <legend className="text-lg font-semibold text-main mb-4">Profile Picture</legend>

          <div className="space-y-4">
            {/* Preview Section */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {profilePicture ? (
                  <div className="relative">
                    <img
                      src={profilePicture}
                      alt={altText || 'Profile picture'}
                      className="h-32 w-32 rounded-full border-4 border-indigo-600 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      aria-label="Remove profile picture"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-indigo-200">
                    {displayName
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((n) => n[0]?.toUpperCase() || '')
                      .join('')}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full cursor-pointer rounded-lg border border-dashed border-token px-4 py-3 transition-colors hover:bg-surface-alt group"
                >
                  <div className="text-center">
                    <CloudUpload className="w-8 h-8 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-main">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="sr-only"
                    aria-describedby="image-upload-hint"
                  />
                </label>
                <p id="image-upload-hint" className="sr-only">
                  Select an image file to use as your profile picture
                </p>

                {errors.image && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {errors.image}
                  </p>
                )}
              </div>
            </div>

            {/* Alt Text Input */}
            {profilePicture && (
              <div>
                <label htmlFor="alt-text" className="block text-sm font-medium text-main mb-2">
                  Picture description <span className="text-red-600" aria-label="required">*</span>
                </label>
                <input
                  id="alt-text"
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe your profile picture"
                  className="w-full rounded-lg border border-token bg-app px-4 py-3 text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  aria-describedby="alt-text-hint"
                  maxLength="100"
                />
                <p id="alt-text-hint" className="mt-1 text-xs text-muted">
                  Example: "Smiling person wearing glasses" ({altText.length}/100)
                </p>
              </div>
            )}
          </div>
        </fieldset>

        {/* Display Name Section */}
        <fieldset className="rounded-lg border border-token bg-surface p-6">
          <legend className="text-lg font-semibold text-main mb-4">Your Details</legend>

          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label htmlFor="display-name" className="block text-sm font-medium text-main mb-2">
                Display Name <span className="text-red-600" aria-label="required">*</span>
              </label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value)
                  if (errors.displayName) {
                    setErrors((prev) => {
                      const updated = { ...prev }
                      delete updated.displayName
                      return updated
                    })
                  }
                }}
                placeholder="Enter your display name"
                aria-invalid={!!errors.displayName}
                aria-describedby={errors.displayName ? 'display-name-error' : 'display-name-hint'}
                className={`w-full rounded-lg border px-4 py-3 text-main placeholder-muted focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  errors.displayName
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-token bg-app focus:ring-indigo-500'
                }`}
                maxLength="50"
              />
              {errors.displayName ? (
                <p id="display-name-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.displayName}
                </p>
              ) : (
                <p id="display-name-hint" className="mt-1 text-xs text-muted">
                  This is how other users will see you (2-50 characters)
                </p>
              )}
            </div>

            {/* Role Dropdown */}
            <div>
              <label htmlFor="role-select" className="block text-sm font-medium text-main mb-2">
                Role <span className="text-red-600" aria-label="required">*</span>
              </label>
              <select
                id="role-select"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value)
                  if (errors.role) {
                    setErrors((prev) => {
                      const updated = { ...prev }
                      delete updated.role
                      return updated
                    })
                  }
                }}
                aria-invalid={!!errors.role}
                aria-describedby={errors.role ? 'role-error' : undefined}
                className={`w-full rounded-lg border px-4 py-3 text-main focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  errors.role
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-token bg-app focus:ring-indigo-500'
                }`}
              >
                <option value="">-- Select a role --</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p id="role-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.role}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {/* Bio Section */}
        <fieldset className="rounded-lg border border-token bg-surface p-6">
          <legend className="text-lg font-semibold text-main mb-4">Bio</legend>

          <div className="space-y-3">
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-main mb-2">
                About You
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= BIO_MAX_LENGTH) {
                    setBio(e.target.value)
                  }
                }}
                placeholder="Tell us about yourself (optional)"
                rows="5"
                aria-invalid={!!errors.bio}
                aria-describedby="bio-hint bio-counter"
                className={`w-full rounded-lg border px-4 py-3 text-main placeholder-muted focus:outline-none focus:ring-2 focus:border-transparent transition-colors resize-none ${
                  errors.bio
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-token bg-app focus:ring-indigo-500'
                }`}
              />
            </div>

            {/* Character Counter with Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    bioPercentage > 90 ? 'bg-red-500' : bioPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${bioPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={bio.length}
                  aria-valuemin="0"
                  aria-valuemax={BIO_MAX_LENGTH}
                  aria-label="Bio character limit progress"
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <p id="bio-hint" className="text-xs text-muted">
                  Share a bit about yourself, your interests, or your background
                </p>
                <p
                  id="bio-counter"
                  className={`text-sm font-medium ${
                    bioPercentage > 90 ? 'text-red-600' : bioPercentage > 75 ? 'text-yellow-600' : 'text-green-600'
                  }`}
                >
                  {bioCharactersRemaining}/{BIO_MAX_LENGTH}
                </p>
              </div>
              {errors.bio && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.bio}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-lg border border-token bg-surface text-main hover:bg-gray-100 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-busy={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
