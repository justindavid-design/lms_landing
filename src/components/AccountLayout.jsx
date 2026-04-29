import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowBack, CheckCircle } from '@mui/icons-material'
import logo from '../assets/logo_f.png'

const highlights = [
  'Helpful quiz tips',
  'Comfortable learning settings',
  'Clear course progress',
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
  return (
    <div className="min-h-screen bg-app px-4 py-8 text-main md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="order-2 rounded-lg border border-token bg-surface p-6 md:p-8 lg:order-1">
          <Link to="/" aria-label="Academee home" className="inline-flex">
            <img src={logo} alt="Academee" className="h-14 w-auto object-contain" />
          </Link>

          <div className="mt-12 max-w-xl">
            <p className="landing-eyebrow">Your account</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-main md:text-6xl">
              {title}
            </h1>
            <p className="mt-5 text-base font-medium leading-8 text-muted md:text-lg">
              {description}
            </p>
          </div>

          <div className="mt-10 grid gap-3">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-token bg-surface-alt px-4 py-3 text-sm font-bold text-main">
                <CheckCircle className="text-[#2f6b3f]" fontSize="small" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="mx-auto w-full max-w-md rounded-lg border border-token bg-surface p-6 shadow-sm md:p-8">
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
      </div>
    </div>
  )
}
