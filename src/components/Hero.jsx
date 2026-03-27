import React, { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import { Link } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Entrance animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Scroll listener for sticky effect
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className="pb-20 min-h-screen flex flex-col vertical-offset 0 -100px 100px -50px rgba(0, 255, 0, 0.5)"
      style={{
        backgroundImage: "url('/src/assets/heroo.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundAttachment: 'absolute'
      }}
    >
      <AppBar 
        // Changed position to "fixed" for stickiness
        position="fixed" 
        elevation={isScrolled ? 4 : 0} 
        sx={{
          transition: 'all 0.4s ease-in-out',
          // Changes background and padding when scrolled
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          paddingTop: isScrolled ? '0px' : '24px',
          color: isScrolled ? '#000' : 'inherit'
        }}
        className={`transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <Toolbar className="container mx-auto flex justify-center items-center gap-20 font-['Poppins']">
          <div className="flex items-center">
            <img 
              src="/src/assets/logo_f.png" 
              alt="logo" 
              className={`object-contain transition-all duration-300 ${isScrolled ? 'w-[80px] h-[60px]' : 'w-[115px] h-[84px]'}`} 
            />
          </div>

          <nav className="hidden md:flex gap-6 text-sm font-medium">
            {['About Us', 'Features', 'Testimonials', 'Contact Us'].map((item, index) => (
              <a 
                key={item}
                className="hover:text-green-700 cursor-pointer transition-colors"
                style={{ 
                  opacity: isVisible ? 1 : 0,
                  transitionDelay: isVisible ? `${index * 100 + 500}ms` : '0ms'
                }}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button 
              component={Link} 
              to="/login" 
              variant="contained" 
              size={isScrolled ? "small" : "medium"}
              sx={{ 
                backgroundColor: 'var(--green-1)', 
                textTransform: 'none', 
                borderRadius: '20px',
                transition: 'all 0.3s'
              }}
            >
              Get Started
            </Button>
          </div>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" className="text-center pt-12 overflow-hidden">
        {/* Headline: Slides up from 'full' to '0' */}
        <div className="overflow-hidden mb-4 pt-20">
          <h1 className={`font-['Poppins'] text-5xl font-bold text-main transition-all duration-1000 transform 
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
        <div
            className={`absolute left-0 right-0 bottom-0 top-64 w-full rounded-xl-card h-[250px] md:h-[550px] transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
            style={{
            backgroundImage: "url('/src/assets/hero_sample.png')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        ></div>
    </header>
  )
}
