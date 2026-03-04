export function getStoredTheme(){
  try{
    return localStorage.getItem('theme')
  }catch(e){ return null }
}

export function setStoredTheme(value){
  try{ localStorage.setItem('theme', value) }catch(e){}
}

export function applyTheme(theme){
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function initTheme(){
  const stored = getStoredTheme()
  if (stored) { applyTheme(stored); return stored }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const t = prefersDark ? 'dark' : 'light'
  applyTheme(t)
  return t
}

export function toggleTheme(){
  const root = document.documentElement
  const isDark = root.classList.contains('dark')
  const next = isDark ? 'light' : 'dark'
  applyTheme(next)
  setStoredTheme(next)
  return next
}
