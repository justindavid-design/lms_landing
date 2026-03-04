import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Hero from './components/Hero'
import About from './components/About'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import Login from './components/Login'
import SignUp from './components/SignUp'
import RecoverEmail from './components/RecoverEmail'
import RecoverVerify from './components/RecoverVerify'
import RecoverReset from './components/RecoverReset'
import PasswordReset from './components/PasswordReset'
import Dashboard from './components/dashboard/dashboard'
import Courses from './components/dashboard/Courses'
import Calendar from './components/dashboard/Calendar'
import Tasks from './components/dashboard/Tasks'
import Archived from './components/dashboard/Archived'
import Settings from './components/dashboard/Settings'
import RequireAuth from './lib/RequireAuth'

function Landing(){
  return (
    <div className="font-sans text-gray-800">
      <Hero />
      <main className="bg-white -mt-16">
        <About />
        <Features />
        <HowItWorks />
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
        <Route path="/reset" element={<PasswordReset />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/courses" element={<RequireAuth><Dashboard><Courses /></Dashboard></RequireAuth>} />
        <Route path="/calendar" element={<RequireAuth><Dashboard><Calendar /></Dashboard></RequireAuth>} />
        <Route path="/tasks" element={<RequireAuth><Dashboard><Tasks /></Dashboard></RequireAuth>} />
        <Route path="/archived" element={<RequireAuth><Dashboard><Archived /></Dashboard></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Dashboard><Settings /></Dashboard></RequireAuth>} />
      </Routes>
    </Router>
  )
}
