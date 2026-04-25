import React from 'react'
import Container from '@mui/material/Container'
import { Contrast, Keyboard, Visibility } from '@mui/icons-material'

const features = [
  {
    title: 'Easy-to-read colors',
    description: 'Text, buttons, and backgrounds are chosen to be clear and comfortable for students.',
    icon: <Contrast />,
    tone: 'bg-[#fff0a8]',
  },
  {
    title: 'Works without a mouse',
    description: 'Students can move through pages, buttons, and forms using the keyboard.',
    icon: <Keyboard />,
    tone: 'bg-[#e8f3de]',
  },
  {
    title: 'Simple pages',
    description: 'Large labels, steady spacing, and clear sections help students find what they need.',
    icon: <Visibility />,
    tone: 'bg-[#dfeaff]',
  },
]

export default function Features() {
  return (
    <section id="proof" className="bg-[#fffdfa] px-4 py-16 md:px-10 md:py-24 lg:px-16">
      <Container maxWidth="lg" className="!px-0">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="landing-eyebrow">Made for comfortable learning</p>
            <h2 className="landing-title mt-5">Clear pages come first.</h2>
          </div>
          <p className="max-w-2xl text-base font-medium leading-8 text-muted lg:justify-self-end">
            Academee focuses on easy reading, simple movement, and helpful quiz tips before anything else.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className={`landing-card ${feature.tone} p-6`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-token bg-white text-main">
                {feature.icon}
              </div>
              <h3 className="mt-8 text-2xl font-extrabold leading-tight tracking-tight text-main">{feature.title}</h3>
              <p className="mt-4 text-sm font-medium leading-7 text-muted">{feature.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
