import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AccessibilityNew,
  ArrowForward,
  CheckCircle,
  Contrast,
  MenuBook,
  MotionPhotosOff,
  Quiz,
  School,
} from '@mui/icons-material'
import logofull from '../assets/logo_f.png'

const navItems = [
  { label: 'Easy to read', href: '#proof' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Learning tools', href: '#accessibility' },
  { label: 'FAQ', href: '#reviews' },
]

const accessCards = [
  { title: 'High contrast', value: 'AA', tone: 'bg-[#e8f3de]' },
  { title: 'Large text', value: '18px+', tone: 'bg-[#fff0a8]' },
  { title: 'Motion control', value: 'Off', tone: 'bg-[#dfeaff]' },
]

const sidebarItems = [
  { icon: <School fontSize="small" />, label: 'Courses', active: true },
  { icon: <Quiz fontSize="small" />, label: 'Quizzes' },
  { icon: <Contrast fontSize="small" />, label: 'Contrast' },
  { icon: <AccessibilityNew fontSize="small" />, label: 'Help' },
]

export default function Hero() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="relative overflow-hidden bg-[#fffdfa] px-4 pb-16 pt-5 md:px-6 md:pb-24">
      <div className={`z-50 mx-auto max-w-6xl transition-all duration-300 ease-out ${isScrolled ? 'fixed inset-x-0 top-0 px-4 pt-3 md:px-6' : 'relative'}`}>
        <div className={`landing-nav mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-lg bg-#FFFDFA px-4 backdrop-blur-md transition-all duration-300 ease-out md:px-5 ${isScrolled ? 'landing-nav-pop bg-white py-2 shadow-[0_12px_32px_rgba(29,36,51,0.14)]' : 'mt-2 py-3 shadow-none'}`}>
          <Link to="/" className="flex items-center gap-3" aria-label="Academee home">
            <img src={logofull} alt="Academee" className={`w-36 object-contain transition-all duration-300 ${isScrolled ? 'h-9 md:h-10' : 'h-10 md:h-12'}`} />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-main lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="landing-nav-link underline-offset-4">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-semibold text-main underline-offset-4 hover:underline sm:inline-flex">
              Log in
            </Link>
            <Link to="/signup" className="landing-pill landing-pill-primary">
              Create account
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-6xl text-center md:mt-12">
        <p className="mx-auto inline-flex items-center gap-2 rounded-md border border-token bg-[#e8f3de] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-main">
          Easy lessons with helpful quiz tips
        </p>
        <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold leading-[0.98] tracking-tight text-main sm:text-6xl lg:text-[5.4rem]">
          Learning that feels clear, calm, and supportive.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-muted md:text-lg">
          Academee helps students read lessons comfortably, move around easily, and get simple quiz tips that show what to review next.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/signup" className="landing-pill landing-pill-primary min-w-44">
            Get started
            <ArrowForward fontSize="small" />
          </Link>
          <Link to="/login" className="landing-pill landing-pill-secondary min-w-36">
            Log in
          </Link>
        </div>
      </div>
    </header>
  )
}
