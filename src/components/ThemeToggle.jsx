import React, { useState, useEffect } from 'react'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { toggleTheme, getStoredTheme } from '../lib/theme'

export default function ThemeToggle(){
  const [mode, setMode] = useState('light')
  useEffect(()=>{
    const stored = getStoredTheme()
    if (stored) setMode(stored)
    else setMode(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  }, [])

  const handle = ()=>{
    const next = toggleTheme()
    setMode(next)
  }

  return (
    <button onClick={handle} aria-label="Toggle theme" className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
      {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
    </button>
  )
}
