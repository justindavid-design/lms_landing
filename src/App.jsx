import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import About from './components/About'
import Features from './components/Features'
import Footer from './components/Footer'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Login from './components/Login'
import PasswordReset from './components/PasswordReset'
import RecoverEmail from './components/RecoverEmail'
import RecoverReset from './components/RecoverReset'
import RecoverVerify from './components/RecoverVerify'
import SignUp from './components/SignUp'
import Testimonials from './components/Testimonials'
import Archived from './components/dashboard/Archived'
import Calendar from './components/dashboard/Calendar'
import CourseDetails from './components/dashboard/CourseDetails'
import Courses from './components/dashboard/Courses'
import Dashboard from './components/dashboard/dashboard'
import EnrollPage from './components/dashboard/EnrollPage'
import Settings from './components/dashboard/Settings'
import Tasks from './components/dashboard/Tasks'
import Notifications from './components/Notifications'
import RequireAuth from './lib/RequireAuth'
import { CourseContextProvider } from './lib/CourseNameContext'
import { NotificationProvider } from './lib/NotificationContext'

function Landing() {
  return (
    <div className="font-sans text-main">
      <Hero />
      <main className="relative z-10 bg-transparent">
        <Features />
        <HowItWorks />
        <About />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-6">
      <div className="max-w-md text-center bg-surface border border-token rounded-xl shadow-sm p-8">
        <p className="text-sm font-semibold tracking-wide text-muted">404</p>
        <h1 className="text-2xl font-bold text-main mt-2">Page not found</h1>
        <p className="text-muted mt-2">The page you requested does not exist.</p>
        <a href="/" className="inline-block mt-6 px-4 py-2 rounded-md" style={{ backgroundColor: 'var(--text-main)', color: 'var(--header-bg)' }}>
          Go to home
        </a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <NotificationProvider>
      <CourseContextProvider>
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
            <Route path="/courses/enroll" element={<RequireAuth><Dashboard><EnrollPage /></Dashboard></RequireAuth>} />
            <Route path="/courses/:id" element={<RequireAuth><Dashboard><CourseDetails /></Dashboard></RequireAuth>} />
            <Route path="/calendar" element={<RequireAuth><Dashboard><Calendar /></Dashboard></RequireAuth>} />
            <Route path="/tasks" element={<RequireAuth><Dashboard><Tasks /></Dashboard></RequireAuth>} />
            <Route path="/archived" element={<RequireAuth><Dashboard><Archived /></Dashboard></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Dashboard><Settings /></Dashboard></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><Dashboard><Notifications /></Dashboard></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </CourseContextProvider>
    </NotificationProvider>
  )
}
