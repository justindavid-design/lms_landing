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

  const displayName = useMemo(
    () => profileName || user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'Learner',
    [profileName, user]
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

        <div>
          <p className="text-sm font-semibold text-main">Theme preview</p>
          <p className="text-sm text-muted mt-1">Choose a higher-contrast style preset.</p>
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