import React from 'react'
import Button from '@mui/material/Button'
import { Link } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'

export default function Hero(){
  return (
    <header
      className="pb-20 min-h-screen flex flex-col"
        style={{
          backgroundImage: "url('/src/assets/head.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover', // Ensures it fills the whole space
      }}
    >
      <AppBar position="static" color="transparent" elevation={0} className="pt-6">
        <Toolbar className="container mx-auto flex justify-center items-center gap-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-full"></div>
            <div className="font-bold">logoipsum</div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-black/700">
            <a className="hover:no-underline">About Us</a>
            <a className="hover:no-underline">Features</a>
            <a className="hover:no-underline">Testimonials</a>
            <a className="hover:no-underline">Contact Us</a>
          </nav>
          <div className="hidden md:block">
            <Button component={Link} to="/login" variant="contained" size="medium" sx={{backgroundColor:'var(--green-1)', textTransform: 'none', borderRadius: '20px'}}>Get Started</Button>
          </div>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" className="text-center pt-12">
        <h1 className="font-['Poppins'] text-4xl md:text-6xl font-bold mb-8 leading-tight">
          Master Your Progress with <br />
          <span className="text-lmsgreen italic">Inclusive Growth</span>
        </h1>
        <p className="font-['Montserrat'] max-w-3xl mx-auto font-medium text-black-700 mb-8">Breaking barriers in education with an accessible, distraction-free environment and smart feedback mechanisms tailored for learners of all abilities</p>
        <div className="flex justify-center gap-4 mb-10">
          <Button component={Link} to="/login" variant="contained" size="large" sx={{backgroundColor:'var(--green-1)', textTransform: 'none', borderRadius: '20px'}}>Start Learning Now</Button>
        </div>
      </Container>

      <div className="container mx-auto px-4 relative z-10 md:-mt-1">
        <div className="rounded-xl-card h-64 md:h-96 w-full max-w-4xl mx-auto overflow-hidden"
          style={{
            backgroundImage: "url('/src/assets/hero_pic.png')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        ></div>
      </div>
    </header>
  )
}
