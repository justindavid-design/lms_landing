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
    // Sets Montserrat as the base font for the entire app
    fontFamily: 'Montserrat, sans-serif',
    
    // Specifically sets Poppins for headings
    h1: { fontFamily: 'Poppins, sans-serif', fontWeight: 700 },
    h2: { fontFamily: 'Poppins, sans-serif', fontWeight: 700 },
    h3: { fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
    h4: { fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
    h5: { fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
    h6: { fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
    
    // Ensuring buttons also use the clean Montserrat look
    button: {
      fontFamily: 'Montserrat, sans-serif',
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