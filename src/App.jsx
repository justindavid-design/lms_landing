import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Hero from './components/Hero'
import About from './components/About'
import Features from './components/Features'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import Login from './components/Login'
import SignUp from './components/SignUp'
import RecoverEmail from './components/RecoverEmail'
import RecoverVerify from './components/RecoverVerify'
import RecoverReset from './components/RecoverReset'

function Landing(){
  return (
    <div className="font-sans text-gray-800">
      <Hero />
      <main className="bg-white -mt-16">
        <About />
        <Features />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

export default function App(){
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/recover" element={<RecoverEmail />} />
        <Route path="/recover/verify" element={<RecoverVerify />} />
        <Route path="/recover/reset" element={<RecoverReset />} />
      </Routes>
    </Router>
  )
}
