import { useEffect, useRef, useState } from 'react'

const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)'
const THEME_MODE_KEY = 'theme-mode'
const LEGACY_THEME_KEY = 'theme'

function isValidMode(value) {
  return value === 'light' || value === 'dark' || value === 'system'
}

function getStoredMode() {
  if (typeof window === 'undefined') return 'system'

  try {
    const mode = localStorage.getItem(THEME_MODE_KEY)
    if (isValidMode(mode)) return mode

    // Backward compatibility with older `theme` storage key.
    const legacy = localStorage.getItem(LEGACY_THEME_KEY)
    if (legacy === 'light' || legacy === 'dark') return legacy
  } catch (e) {
    // no-op
  }

  return 'system'
}

function storeMode(mode) {
  try {
    localStorage.setItem(THEME_MODE_KEY, mode)
  } catch (e) {
    // no-op
  }
}

function resolveTheme(mode, prefersDark) {
  if (mode === 'system') return prefersDark ? 'dark' : 'light'
  return mode
}

export default function useTheme() {
  const [mode, setModeState] = useState(() => getStoredMode())
  const [theme, setTheme] = useState('light')
  const modeRef = useRef(mode)

  const setMode = nextMode => {
    if (!isValidMode(nextMode)) return
    setModeState(nextMode)
    storeMode(nextMode)
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setMode(nextTheme)
    return nextTheme
  }

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const media = window.matchMedia(THEME_MEDIA_QUERY)

    const applyTheme = nextMode => {
      const resolvedTheme = resolveTheme(nextMode, media.matches)
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
      setTheme(resolvedTheme)
    }

    applyTheme(modeRef.current)

    const onThemeChange = event => {
      if (modeRef.current === 'system') {
        document.documentElement.classList.toggle('dark', event.matches)
        setTheme(event.matches ? 'dark' : 'light')
      }
    }

    const onStorageChange = event => {
      if (event.key !== THEME_MODE_KEY && event.key !== LEGACY_THEME_KEY) return
      const syncedMode = getStoredMode()
      setModeState(syncedMode)
    }

    if (media.addEventListener) {
      media.addEventListener('change', onThemeChange)
      window.addEventListener('storage', onStorageChange)
      return () => {
        media.removeEventListener('change', onThemeChange)
        window.removeEventListener('storage', onStorageChange)
      }
    }

    media.addListener(onThemeChange)
    window.addEventListener('storage', onStorageChange)
    return () => {
      media.removeListener(onThemeChange)
      window.removeEventListener('storage', onStorageChange)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const media = window.matchMedia(THEME_MEDIA_QUERY)
    const resolvedTheme = resolveTheme(mode, media.matches)
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    setTheme(resolvedTheme)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const media = window.matchMedia(THEME_MEDIA_QUERY)
    const resolvedTheme = resolveTheme(mode, media.matches)
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    setTheme(resolvedTheme)
  }, [mode])

  return { mode, theme, setMode, toggleTheme }
}
