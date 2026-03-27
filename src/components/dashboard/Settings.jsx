import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/AuthProvider'

const STORAGE_KEY = 'academee_accessibility'

function readStoredPrefs() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    return {
      highContrast: !!parsed.highContrast,
      largeText: !!parsed.largeText,
      reducedMotion: !!parsed.reducedMotion,
      readableFont: !!parsed.readableFont,
    }
  } catch (_error) {
    return {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      readableFont: false,
    }
  }
}

function applyPrefsToDocument(prefs) {
  document.documentElement.classList.toggle('a11y-high-contrast', !!prefs.highContrast)
  document.documentElement.classList.toggle('a11y-large-text', !!prefs.largeText)
  document.documentElement.classList.toggle('a11y-reduced-motion', !!prefs.reducedMotion)
  document.documentElement.classList.toggle('a11y-readable-font', !!prefs.readableFont)
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

export default function Settings() {
  const { user, profileName } = useAuth()
  const [prefs, setPrefs] = useState(() => readStoredPrefs())
  const [saveMessage, setSaveMessage] = useState('')

  const displayName = useMemo(
    () => profileName || user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'Learner',
    [profileName, user]
  )

  useEffect(() => {
    applyPrefsToDocument(prefs)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  }, [prefs])

  useEffect(() => {
    if (!saveMessage) return undefined
    const timer = setTimeout(() => setSaveMessage(''), 2000)
    return () => clearTimeout(timer)
  }, [saveMessage])

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
    }
    setPrefs(defaults)
    setSaveMessage('Preferences reset to defaults.')
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <section className="rounded-2xl border border-token bg-surface p-6 mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted mt-2">Control your account and accessibility preferences for the dashboard.</p>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-token bg-app px-4 py-3">
            <p className="text-muted">Display name</p>
            <p className="text-main font-semibold mt-1">{displayName}</p>
          </div>
          <div className="rounded-xl border border-token bg-app px-4 py-3">
            <p className="text-muted">Email</p>
            <p className="text-main font-semibold mt-1">{user?.email || 'No email available'}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-token bg-surface p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold">Accessibility</h3>
            <p className="text-sm text-muted">These options apply immediately across the dashboard.</p>
          </div>
          <button
            type="button"
            onClick={resetPrefs}
            className="px-3 py-2 text-sm rounded-md border border-token hover-surface"
          >
            Reset
          </button>
        </div>

        <div className="space-y-3">
          <ToggleCard
            title="High contrast"
            description="Increase color contrast for easier reading and visual clarity."
            checked={prefs.highContrast}
            onChange={() => togglePref('highContrast')}
          />
          <ToggleCard
            title="Large text"
            description="Increase font sizes across the interface."
            checked={prefs.largeText}
            onChange={() => togglePref('largeText')}
          />
          <ToggleCard
            title="Reduced motion"
            description="Minimize animations and transitions."
            checked={prefs.reducedMotion}
            onChange={() => togglePref('reducedMotion')}
          />
          <ToggleCard
            title="Readable font"
            description="Use a simpler font style for improved readability."
            checked={prefs.readableFont}
            onChange={() => togglePref('readableFont')}
          />
        </div>

        {saveMessage ? <p className="text-sm text-green-700 mt-4">{saveMessage}</p> : null}
      </section>
    </div>
  )
}