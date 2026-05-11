import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material'
import logofull from '../assets/logo_f.png'
import { LoginForm, SignUpForm } from './EnhancedForms'

const navItems = [
  { label: 'Easy to read', href: '#proof' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Learning tools', href: '#accessibility' },
  { label: 'FAQ', href: '#reviews' },
]

export default function LandingWithForms() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeForm, setActiveForm] = useState(null) // 'login' or 'signup'

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close form on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveForm(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* Header Navigation */}
      <header className="relative overflow-hidden bg-app px-4 pt-5 md:px-6">
        <div
          className={`z-50 mx-auto max-w-6xl transition-all duration-300 ease-out ${
            isScrolled
              ? 'fixed inset-x-0 top-0 px-4 pt-3 md:px-6'
              : 'relative'
          }`}
        >
          <div
            className={`landing-nav mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-lg bg-surface/95 px-4 backdrop-blur-md transition-all duration-300 ease-out md:px-5 ${
              isScrolled
                ? 'landing-nav-pop py-2 shadow-[0_12px_32px_rgba(29,36,51,0.14)]'
                : 'mt-2 py-3 shadow-none'
            }`}
          >
            <Link to="/" className="flex items-center gap-3" aria-label="Academee home">
              <img
                src={logofull}
                alt="Academee"
                className={`w-36 object-contain transition-all duration-300 ${
                  isScrolled
                    ? 'h-9 md:h-10'
                    : 'h-10 md:h-12'
                }`}
              />
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-semibold text-main lg:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="landing-nav-link underline-offset-4"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveForm('login')}
                className="hidden text-sm font-semibold text-main underline-offset-4 hover:underline sm:inline-flex"
              >
                Log in
              </button>
              <button
                onClick={() => setActiveForm('signup')}
                className="landing-pill landing-pill-primary"
              >
                Create account
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section with Form Panel on Left */}
        <div className="relative pb-16 md:pb-24">
          <div className="mx-auto max-w-6xl">
            {/* Main Hero Grid */}
            <div className={`mt-14 grid gap-8 md:mt-12 ${
              activeForm 
                ? 'lg:grid-cols-[1fr]' 
                : 'lg:grid-cols-[1fr_1fr] lg:items-center'
            }`}>
              {/* Left Panel - Forms */}
              <div className={`${activeForm ? 'w-full' : 'order-2 lg:order-1'}`}>
                {/* Login Form */}
                {activeForm === 'login' && (
                  <div className="max-w-md mx-auto rounded-lg border border-token bg-surface p-6 shadow-sm md:p-8 animation-slide-in">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-extrabold text-main">Log in</h2>
                      <button
                        onClick={() => setActiveForm(null)}
                        className="p-1 hover:bg-surface-alt rounded-lg transition-colors"
                        aria-label="Close"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <LoginForm onClose={() => setActiveForm(null)} isEmbedded />
                  </div>
                )}

                {/* Sign Up Form */}
                {activeForm === 'signup' && (
                  <div className="max-w-md mx-auto rounded-lg border border-token bg-surface p-6 shadow-sm md:p-8 animation-slide-in">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-extrabold text-main">Create account</h2>
                      <button
                        onClick={() => setActiveForm(null)}
                        className="p-1 hover:bg-surface-alt rounded-lg transition-colors"
                        aria-label="Close"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <SignUpForm onClose={() => setActiveForm(null)} isEmbedded />
                  </div>
                )}

                {/* Default CTA - No Form Shown */}
                {!activeForm && (
                  <div className="max-w-md mx-auto text-center space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-main">Ready to get started?</h3>
                      <p className="text-muted">Choose an option to continue</p>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveForm('login')}
                        className="w-full px-4 py-2.5 bg-[#2f6b3f] text-white rounded-lg font-semibold hover:bg-[#285636] transition-all"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => setActiveForm('signup')}
                        className="w-full px-4 py-2.5 border border-token text-main rounded-lg font-semibold hover:bg-surface-alt transition-all"
                      >
                        Create account
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Hero Content */}
              {!activeForm && <div className="order-1 lg:order-2 text-center lg:text-left">
                <p className="mx-auto inline-flex items-center gap-2 rounded-md border border-token bg-surface-alt px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-main lg:mx-0">
                  Easy lessons with helpful quiz tips
                </p>
                <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-extrabold leading-[0.98] tracking-tight text-main sm:text-5xl lg:mx-0 lg:text-5xl">
                  Learning that feels clear, calm, and supportive.
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-8 text-muted md:text-lg lg:mx-0">
                  Academee helps students read lessons comfortably, move around easily, and get simple quiz tips that show what to review next.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3 lg:flex-row lg:items-start">
                  <button
                    onClick={() => setActiveForm('signup')}
                    className="landing-pill landing-pill-primary min-w-44"
                  >
                    Get started
                    <ArrowForward fontSize="small" />
                  </button>
                  <button
                    onClick={() => setActiveForm('login')}
                    className="landing-pill landing-pill-secondary min-w-36"
                  >
                    Log in
                  </button>
                </div>

                {/* Benefits List */}
                <div className="mt-12 space-y-3 hidden lg:block">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Why Academee
                  </p>
                  {[
                    'Helpful quiz tips',
                    'Comfortable learning settings',
                    'Clear course progress',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm font-medium text-main"
                    >
                      <CheckCircle className="text-[#2f6b3f] flex-shrink-0" fontSize="small" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>}
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop Overlay for Mobile */}
      {activeForm && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setActiveForm(null)}
          aria-hidden="true"
        />
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animation-slide-in {
          animation: slideIn 300ms ease-out;
        }
      `}</style>
    </>
  )
}
