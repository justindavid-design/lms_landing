import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowBack } from '@mui/icons-material'
import Footer from './Footer'
import logo from '../assets/logo_f.png'

const navItems = [
  { label: 'Easy to read', href: '/#proof' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Learning tools', href: '/#accessibility' },
  { label: 'FAQ', href: '/#reviews' },
]

export default function AccountLayout({
  title,
  description,
  backTo = '/',
  backLabel = 'Back to home',
  cardTitle,
  cardDescription,
  children,
}) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-app text-main">
      <header className="relative bg-app px-4 pt-5 md:px-6">
        <div className={`z-50 mx-auto max-w-6xl transition-all duration-300 ease-out ${isScrolled ? 'fixed inset-x-0 top-0 px-4 pt-3 md:px-6' : 'relative'}`}>
          <div className={`landing-nav mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-lg bg-surface/95 px-4 backdrop-blur-md transition-all duration-300 ease-out md:px-5 ${isScrolled ? 'landing-nav-pop py-2 shadow-[0_12px_32px_rgba(29,36,51,0.14)]' : 'mt-2 py-3 shadow-none'}`}>
            <Link to="/" className="flex items-center gap-3" aria-label="Academee home">
              <img src={logo} alt="Academee" className={`w-36 object-contain transition-all duration-300 ${isScrolled ? 'h-9 md:h-10' : 'h-10 md:h-12'}`} />
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-semibold text-main lg:flex">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="landing-nav-link underline-offset-4">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-main transition hover:bg-surface-alt sm:inline-flex">
                Log in
              </Link>
              <Link to="/signup" className="landing-pill landing-pill-primary">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-14 md:px-8 md:py-20">
        <section className="mx-auto flex max-w-6xl flex-col items-center">
          <div className="max-w-2xl text-center">
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-main md:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-8 text-muted md:text-lg">
                {description}
              </p>
            ) : null}
          </div>

          <div className="mt-9 w-full max-w-md rounded-lg border border-token bg-surface p-6 shadow-sm md:p-8">
            <Link to={backTo} aria-label={backLabel} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-main underline-offset-4 hover:underline">
              <ArrowBack fontSize="small" />
              {backLabel}
            </Link>

            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-main">{cardTitle}</h2>
            {cardDescription ? (
              <p className="mt-2 text-sm font-medium leading-6 text-muted">{cardDescription}</p>
            ) : null}

            <div className="mt-7">{children}</div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
