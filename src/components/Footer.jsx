import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone } from '@mui/icons-material'
import logo from '../assets/logo_f.png'

const sectionLinks = [
  { label: 'Easy to read', href: '#proof' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Learning tools', href: '#accessibility' },
  { label: 'FAQ', href: '#reviews' },
]

export default function Footer() {
  return (
    <footer className="border-t border-token bg-white px-4 py-12 text-main md:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_auto_auto] md:items-start">
        <div>
          <img src={logo} alt="Academee" className="h-14 w-auto object-contain" />
          <p className="mt-4 max-w-md text-sm font-medium leading-7 text-muted">
            Clear courses, helpful quiz tips, easy controls, and simple progress tracking for better learning.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <h4 className="text-sm font-bold uppercase tracking-[0.12em]">Explore</h4>
          <ul className="mt-4 space-y-3 text-sm font-semibold">
            {sectionLinks.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="underline-offset-4 hover:underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-[0.12em]">Contact</h4>
          <div className="mt-4 space-y-3 text-sm font-semibold">
            <div className="flex items-center gap-3">
              <Phone fontSize="small" />
              <span>123-567-890</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail fontSize="small" />
              <span>academee@gmail.com</span>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <Link to="/signup" className="landing-pill landing-pill-primary">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-token pt-6 text-sm font-medium text-muted">
        <p>&copy; 2026 Academee. Built for clear, supportive learning.</p>
      </div>
    </footer>
  )
}
