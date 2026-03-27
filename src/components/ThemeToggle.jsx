import React from 'react'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import useTheme from '../lib/useTheme'

export default function ThemeToggle(){
  const { theme, toggleTheme } = useTheme()

  const handle = ()=>{ toggleTheme() }

  return (
    <button onClick={handle} aria-label="Toggle theme" className="p-2 rounded-md hover-surface text-main">
      {theme === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
    </button>
  )
}
