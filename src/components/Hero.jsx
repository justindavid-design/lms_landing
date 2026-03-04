import React from 'react'
import Button from '@mui/material/Button'
import { Link } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import { useState, useEffect } from 'react'

export default function Hero() {
  // Renamed to isVisible for clarity
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <header
      className="pb-20 min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/src/assets/head.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <AppBar position="static" color="transparent" elevation={0} className="pt-6">
        <Toolbar className="container mx-auto flex justify-center items-center gap-20 font-['Poppins']">
          <div className="flex items-center">
            <div>
              <img src="/src/assets/logo_f.png" 
                alt="logoipsum branding" 
                className="w-[115px] h-[84px] object-contain" 
              />
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-black/700">
            <a className="hover:no-underline cursor-pointer">About Us</a>
            <a className="hover:no-underline cursor-pointer">Features</a>
            <a className="hover:no-underline cursor-pointer">Testimonials</a>
            <a className="hover:no-underline cursor-pointer">Contact Us</a>
          </nav>
          <div className="hidden md:block ">
            <Button component={Link} to="/login" variant="contained" size="medium" sx={{ backgroundColor: 'var(--green-1)', textTransform: 'none', borderRadius: '20px' }}>Get Started</Button>
          </div>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" className="text-center pt-12 overflow-hidden">
        {/* Headline: Slides up from 'full' to '0' */}
        <div className="overflow-hidden mb-4">
          <h1 className={`font-['Poppins'] text-5xl font-bold text-slate-900 transition-all duration-1000 transform 
            ${isVisible ? 'translate-y-0 opacity-100 ease-out' : 'translate-y-full opacity-0'}`}>
            Master Your Learning with <br />
            <span className="text-blue-600 italic">Adaptive Feedback</span>
          </h1>
        </div>

        {/* Subtext: Delayed for staggered effect */}
        <div className="overflow-hidden mb-8">
          <p className={`font-['Montserrat'] max-w-3xl mx-auto font-medium text-black-700 transition-all duration-1000 delay-300 transform
            ${isVisible ? 'translate-y-0 opacity-100 ease-out' : 'translate-y-full opacity-0'}`}>
            Breaking barriers in education with an accessible, distraction-free environment and smart feedback mechanisms tailored for learners of all abilities.
          </p>
        </div>

        {/* Button: Uses Scale + Opacity for a different "pop-in" feel */}
        <div className="flex justify-center gap-4 mb-10 font-['Poppins']">
          <Button 
            component={Link} 
            to="/login" 
            variant="contained" 
            size="large" 
            sx={{
              backgroundColor: 'var(--green-1)', 
              textTransform: 'none', 
              borderRadius: '20px', 
              opacity: isVisible ? 1 : 0, 
              transform: isVisible ? 'scale(1)' : 'scale(0.9)', 
              transition: 'opacity 1s ease-out 0.6s, transform 1s ease-out 0.6s' 
            }}
          >
            Start Learning Now
          </Button>
        </div>
      </Container>

      {/* Hero Image: Slides up from below */}
      <div className="container mx-auto px-4 relative z-10 md:-mt-1 overflow-hidden">
        <div 
          className={`rounded-xl-card h-64 md:h-96 w-full max-w-4xl mx-auto transition-all duration-1000 delay-700 transform
            ${isVisible ? 'translate-y-0 opacity-100 ease-out' : 'translate-y-20 opacity-0'}`}
          style={{
            backgroundImage: "url('/src/assets/hero_pic.png')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        >
        </div>
      </div>
    </header>
  )
}