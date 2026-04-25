import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import Hero from '../src/components/Hero'
import Features from '../src/components/Features'
import HowItWorks from '../src/components/HowItWorks'
import About from '../src/components/About'
import Testimonials from '../src/components/Testimonials'
import Footer from '../src/components/Footer'

function renderLanding() {
  return render(
    <MemoryRouter>
      <div>
        <Hero />
        <main>
          <Features />
          <HowItWorks />
          <About />
          <Testimonials />
        </main>
        <Footer />
      </div>
    </MemoryRouter>
  )
}

describe('Landing keyboard and anchor navigation', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('allows keyboard focus on top navigation links and CTA links', () => {
    renderLanding()

    const whyLink = screen.getAllByRole('link', { name: 'WCAG support' })[0]
    const createAccountLinks = screen.getAllByRole('link', { name: 'Create account' })
    const loginLinks = screen.getAllByRole('link', { name: 'Log in' })

    whyLink.focus()
    expect(document.activeElement).toBe(whyLink)

    createAccountLinks[0].focus()
    expect(document.activeElement).toBe(createAccountLinks[0])

    loginLinks[0].focus()
    expect(document.activeElement).toBe(loginLinks[0])
  }, 15000)

  it('keeps in-page anchor targets available for keyboard users', () => {
    renderLanding()

    expect(document.querySelector('#proof')).toBeTruthy()
    expect(document.querySelector('#how-it-works')).toBeTruthy()
    expect(document.querySelector('#accessibility')).toBeTruthy()
    expect(document.querySelector('#reviews')).toBeTruthy()
  })

  it('uses valid in-page anchor destinations for nav jumps', () => {
    renderLanding()

    const whyLink = screen.getAllByRole('link', { name: 'WCAG support' })[0]
    const howItWorksLink = screen.getAllByRole('link', { name: 'Learning flow' })[0]

    expect(whyLink.getAttribute('href')).toBe('#proof')
    expect(howItWorksLink.getAttribute('href')).toBe('#how-it-works')
    expect(document.querySelector(whyLink.getAttribute('href'))).toBeTruthy()
    expect(document.querySelector(howItWorksLink.getAttribute('href'))).toBeTruthy()
  })
})
