import React from 'react'
import Container from '@mui/material/Container'

const rows = [
  {
    title: 'High contrast mode',
    body: 'Stronger colors help students read buttons, labels, and quiz tips with less eye strain.',
    value: 'Clear',
  },
  {
    title: 'Comfort choices',
    body: 'Students can use easier fonts, larger text, and less movement when they need it.',
    value: '4 choices',
  },
  {
    title: 'Helpful quiz tips',
    body: 'Quiz messages tell learners what to review next in clear, encouraging words.',
    value: 'Plain',
  },
]

export default function About() {
  return (
    <section id="accessibility" className="bg-[#fffdfa] px-4 py-16 md:px-10 md:py-24 lg:px-16">
      <Container maxWidth="lg" className="!px-0">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <p className="landing-eyebrow">Learning comfort</p>
            <h2 className="landing-title mt-5">Readable, adjustable, and calm from the start.</h2>
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-muted">
              Academee is made for learners who need things to be clear first: easy reading, fewer distractions, and quiz tips that help them try again.
            </p>
          </div>

          <div className="grid gap-4">
            {rows.map((row, index) => (
              <article key={row.title} className="landing-card grid gap-4 bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight text-main">{row.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-7 text-muted">{row.body}</p>
                </div>
                <div className={`rounded-lg border border-token px-4 py-3 text-center text-lg font-extrabold text-main ${index === 0 ? 'bg-[#fff0a8]' : index === 1 ? 'bg-[#dfeaff]' : 'bg-[#e8f3de]'}`}>
                  {row.value}
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
