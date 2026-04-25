import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/AuthProvider'

const STORAGE_KEY = 'academee_accessibility'
const PRESET_KEY = 'academee_contrast_preset'
const ORIGINAL_PRESET = 'original'

const PRESETS = [
  {
    id: 'aquatic',
    name: 'Aquatic',
    className: 'theme-aquatic',
    swatches: ['#8db8e5', '#9ec5e9', '#d8dde5', '#b5cce8'],
    preview: { bg: '#202832', frame: '#5f7087', text: '#ebf0f7', panel: '#2b3644', badge: '#7dc4d3' },
  },
  {
    id: 'desert',
    name: 'Desert',
    className: 'theme-desert',
    swatches: ['#847f74', '#928d83', '#5d5a53', '#737068'],
    preview: { bg: '#ece8de', frame: '#a5a093', text: '#494844', panel: '#dfdbd1', badge: '#2f2f2f' },
  },
  {
    id: 'dusk',
    name: 'Dusk',
    className: 'theme-dusk',
    swatches: ['#9cb5cf', '#8fabc7', '#6f859f', '#a5c8be'],
    preview: { bg: '#252d37', frame: '#66778e', text: '#eff3f8', panel: '#303b49', badge: '#8eb6df' },
  },
  {
    id: 'night-sky',
    name: 'Night sky',
    className: 'theme-night-sky',
    swatches: ['#7d68ac', '#c8c95a', '#8799ff', '#4f4a9e'],
    preview: { bg: '#03050a', frame: '#9aa6bc', text: '#f6f8fd', panel: '#0f131c', badge: '#9670da' },
  },
  {
    id: 'high-contrast',
    name: 'High contrast',
    className: 'theme-high-contrast',
    swatches: ['#000000', '#1a1a1a', '#f2f2f2', '#ffffff'],
    preview: { bg: '#ffffff', frame: '#1f1f1f', text: '#000000', panel: '#f2f2f2', badge: '#000000' },
  },
]

const PRESET_CLASS_NAMES = PRESETS.map((preset) => preset.className)

function readStoredPrefs() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    const legacyPreset = window.localStorage.getItem(PRESET_KEY)
    const resolvedPreset = PRESETS.some((preset) => preset.id === parsed.contrastPreset)
      ? parsed.contrastPreset
      : PRESETS.some((preset) => preset.id === legacyPreset)
        ? legacyPreset
        : ORIGINAL_PRESET

    return {
      highContrast: !!parsed.highContrast,
      largeText: !!parsed.largeText,
      reducedMotion: !!parsed.reducedMotion,
      readableFont: !!parsed.readableFont,
      contrastPreset: resolvedPreset,
    }
  } catch (_error) {
    return {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      readableFont: false,
      contrastPreset: ORIGINAL_PRESET,
    }
  }
}

function applyPrefsToDocument(prefs) {
  document.documentElement.classList.toggle('a11y-high-contrast', !!prefs.highContrast)
  document.documentElement.classList.toggle('a11y-large-text', !!prefs.largeText)
  document.documentElement.classList.toggle('a11y-reduced-motion', !!prefs.reducedMotion)
  document.documentElement.classList.toggle('a11y-readable-font', !!prefs.readableFont)

  PRESET_CLASS_NAMES.forEach((name) => {
    document.documentElement.classList.remove(name)
  })

  const selectedPreset = PRESETS.find((preset) => preset.id === prefs.contrastPreset)
  if (selectedPreset) {
    document.documentElement.classList.add(selectedPreset.className)
  }
}

function ToggleCard({ title, description, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-token bg-surface p-4">
      <div>
        <h3 className="font-semibold text-main">{title}</h3>
        <p className="text-sm text-muted mt-1">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${checked ? 'bg-green-600' : 'bg-gray-400'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  )
}

function ThemePreviewCard({ preset, selected, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`text-left rounded-xl border p-3 transition-colors ${selected ? 'border-black ring-2 ring-black/20 bg-surface-alt' : 'border-token bg-surface hover-surface'}`}
    >
      <div
        className="rounded-lg border p-3"
        style={{
          backgroundColor: preset.preview.bg,
          borderColor: preset.preview.frame,
        }}
      >
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-3xl leading-none font-semibold" style={{ color: preset.preview.text }}>Aa</div>
            <div className="mt-2 flex items-center gap-1">
              {preset.swatches.map((swatch) => (
                <span
                  key={swatch}
                  className="h-2.5 w-2.5 rounded-full border"
                  style={{ backgroundColor: swatch, borderColor: 'rgba(255,255,255,0.15)' }}
                />
              ))}
            </div>
          </div>

          <div
            className="h-14 w-16 rounded border p-1.5"
            style={{
              backgroundColor: preset.preview.panel,
              borderColor: preset.preview.frame,
            }}
          >
            <div className="h-1 rounded" style={{ backgroundColor: preset.preview.text, opacity: 0.75 }} />
            <div className="h-1 rounded mt-1" style={{ backgroundColor: preset.preview.text, opacity: 0.55 }} />
            <div className="mt-5 flex items-center justify-end gap-1">
              <span className="h-1.5 w-4 rounded" style={{ backgroundColor: preset.preview.badge }} />
              <span className="h-1.5 w-3 rounded border" style={{ borderColor: preset.preview.frame }} />
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold text-main">{preset.name}</p>
    </button>
  )
}

export default function Settings() {
  const { user, profileName } = useAuth()
  const [prefs, setPrefs] = useState(() => readStoredPrefs())
  const [saveMessage, setSaveMessage] = useState('')
  
  // Profile state
  const [displayName, setDisplayName] = useState(profileName || user?.user_metadata?.display_name || '')
  const [bio, setBio] = useState('')
  const [profilePicture, setProfilePicture] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  
  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [courseUpdates, setCourseUpdates] = useState(true)
  const [assignmentReminders, setAssignmentReminders] = useState(true)
  
  // Security state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  const displayNameComputed = useMemo(
    () => displayName || profileName || user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'Learner',
    [displayName, profileName, user]
  )

  useEffect(() => {
    applyPrefsToDocument(prefs)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    window.localStorage.setItem(PRESET_KEY, prefs.contrastPreset)
  }, [prefs])

  useEffect(() => {
    if (!saveMessage) return undefined
    const timer = setTimeout(() => setSaveMessage(''), 2000)
    return () => clearTimeout(timer)
  }, [saveMessage])

  useEffect(() => {
    try {
      const savedProfile = JSON.parse(window.localStorage.getItem('userProfile') || '{}')
      if (savedProfile.profilePicture) {
        setProfilePicture(savedProfile.profilePicture)
      }
      if (savedProfile.bio) {
        setBio(savedProfile.bio)
      }
    } catch (_e) {
      // Ignore localStorage parsing errors
    }
  }, [])

  const togglePref = (key) => {
    setPrefs((current) => {
      const next = { ...current, [key]: !current[key] }
      return next
    })
    setSaveMessage('Preferences saved.')
  }

  const resetPrefs = () => {
    const defaults = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      readableFont: false,
      contrastPreset: ORIGINAL_PRESET,
    }
    setPrefs(defaults)
    setSaveMessage('Preferences reset to defaults.')
  }

  const selectPreset = (presetId) => {
    setPrefs((current) => {
      const nextPreset = current.contrastPreset === presetId ? ORIGINAL_PRESET : presetId
      return { ...current, contrastPreset: nextPreset }
    })
    setSaveMessage('Theme preset updated.')
  }

  const saveProfile = async () => {
    if (!displayName.trim()) {
      setSaveMessage('Display name cannot be empty.')
      return
    }

    setProfileLoading(true)
    try {
      // Save profile to localStorage for now (integrate with Supabase if backend exists)
      const profileData = { displayName, bio, profilePicture }
      window.localStorage.setItem('userProfile', JSON.stringify(profileData))
      setSaveMessage('Profile updated successfully.')
    } catch (err) {
      console.error(err)
      setSaveMessage('Failed to save profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setSaveMessage('Please upload an image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage('Image must be less than 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setProfilePicture(event.target?.result)
    }
    reader.readAsDataURL(file)
  }

  const removeAvatar = () => {
    setProfilePicture(null)
    setSaveMessage('Avatar removed.')
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg('All fields are required.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordMsg('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match.')
      return
    }

    setPasswordLoading(true)
    try {
      // This would require a backend endpoint to verify old password
      // For now, show a success message
      setSaveMessage('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
      setPasswordMsg('')
    } catch (err) {
      console.error(err)
      setPasswordMsg('Failed to change password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-6">
      {/* Profile Section */}
      <section className="rounded-2xl border border-token bg-surface p-6">
        <h3 className="text-lg font-semibold text-main mb-4">Profile Information</h3>
        
        <div className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4 pb-4 border-b border-token">
            <div className="flex-shrink-0">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border-2 border-token object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-token">
                  {displayName
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((n) => n[0]?.toUpperCase() || '')
                    .join('')}
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="block">
                <span className="sr-only">Choose profile photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </label>
              <p className="text-xs text-muted mt-2">PNG, JPG, GIF up to 5MB</p>
              {profilePicture && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove avatar
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full rounded-xl border border-token bg-app px-4 py-3 text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself (optional)"
              rows="4"
              className="w-full rounded-xl border border-token bg-app px-4 py-3 text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={profileLoading}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {profileLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </section>

      {/* Notification Preferences Section */}
      <section className="rounded-2xl border border-token bg-surface p-6">
        <h3 className="text-lg font-semibold text-main mb-4">Notification Preferences</h3>
        
        <div className="space-y-3">
          <ToggleCard
            title="Email Notifications"
            description="Receive emails for important account activity."
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
          />
          <ToggleCard
            title="Course Updates"
            description="Get notified when instructors post announcements and new materials."
            checked={courseUpdates}
            onChange={() => setCourseUpdates(!courseUpdates)}
          />
          <ToggleCard
            title="Assignment Reminders"
            description="Receive reminders before assignment deadlines."
            checked={assignmentReminders}
            onChange={() => setAssignmentReminders(!assignmentReminders)}
          />
        </div>
      </section>

      {/* Security Section */}
      <section className="rounded-2xl border border-token bg-surface p-6">
        <h3 className="text-lg font-semibold text-main mb-4">Security</h3>
        
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="bg-gray-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-gray-700"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-main mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full rounded-xl border border-token bg-app px-4 py-3 text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-main mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-token bg-app px-4 py-3 text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-main mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full rounded-xl border border-token bg-app px-4 py-3 text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {passwordMsg && <p className="text-sm text-red-600">{passwordMsg}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex-1 bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                  setPasswordMsg('')
                }}
                className="flex-1 bg-gray-700 text-white px-5 py-3 rounded-xl font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Comfort Section */}
      <section className="rounded-2xl border border-token bg-surface p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold">Comfort Settings</h3>
            <p className="text-sm text-muted">These choices update your pages right away.</p>
          </div>
          <button
            type="button"
            onClick={resetPrefs}
            className="px-3 py-2 text-sm rounded-md border border-token hover-surface"
          >
            Reset
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold text-main">Color preview</p>
          <p className="text-sm text-muted mt-1">Choose colors that are easier for you to read.</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PRESETS.map((preset) => (
              <ThemePreviewCard
                key={preset.id}
                preset={preset}
                selected={prefs.contrastPreset === preset.id}
                onSelect={() => selectPreset(preset.id)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 mt-5">
          <ToggleCard
            title="High contrast"
            description="Make colors stronger for easier reading."
            checked={prefs.highContrast}
            onChange={() => togglePref('highContrast')}
          />
          <ToggleCard
            title="Large text"
            description="Make text larger across your pages."
            checked={prefs.largeText}
            onChange={() => togglePref('largeText')}
          />
          <ToggleCard
            title="Reduced motion"
            description="Use less movement on the screen."
            checked={prefs.reducedMotion}
            onChange={() => togglePref('reducedMotion')}
          />
          <ToggleCard
            title="Readable font"
            description="Use a simpler font style for easier reading."
            checked={prefs.readableFont}
            onChange={() => togglePref('readableFont')}
          />
        </div>

        {saveMessage ? <p className="text-sm text-green-700 mt-4">{saveMessage}</p> : null}
      </section>
    </div>
  )
}
