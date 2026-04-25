import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { AuthProvider } from './lib/AuthProvider'
import useTheme from './lib/useTheme'
import AOS from 'aos'
import 'aos/dist/aos.css'

function ThemeBootstrap() {
  useTheme()
  return null
}

const theme = createTheme({
  typography: {
    fontFamily: 'Nunito, sans-serif',
    
    h1: { fontFamily: 'Nunito, sans-serif', fontWeight: 800 },
    h2: { fontFamily: 'Nunito, sans-serif', fontWeight: 800 },
    h3: { fontFamily: 'Nunito, sans-serif', fontWeight: 700 },
    h4: { fontFamily: 'Nunito, sans-serif', fontWeight: 700 },
    h5: { fontFamily: 'Nunito, sans-serif', fontWeight: 700 },
    h6: { fontFamily: 'Nunito, sans-serif', fontWeight: 700 },
    
    button: {
      fontFamily: 'Nunito, sans-serif',
      textTransform: 'none', // Good for cognitive accessibility
    },
  },
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <ThemeBootstrap />
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)

// initialize AOS (Animate On Scroll)
if (typeof window !== 'undefined'){
  AOS.init({ duration: 800, once: true, easing: 'ease-in-out' })
}
