import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowForward, CheckCircle } from '@mui/icons-material'
import logo from '../assets/logo.png'

const steps = [
  {
    title: 'Choose what feels comfortable',
    description: 'Students can turn on stronger colors, larger text, easier fonts, or less movement before starting.',
  },
  {
    title: 'Learn with helpful tips',
    description: 'Quiz tips explain what to review next while the lesson is still fresh.',
  },
  {
    title: 'Track progress clearly',
    description: 'Simple progress pages help students and teachers see what needs attention.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface px-4 py-16 md:px-10 md:py-24 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="landing-eyebrow">How it works</p>
          <h2 className="landing-title mt-5">A learning path built around comfort and confidence.</h2>
          <p className="mt-5 max-w-xl text-base font-medium leading-8 text-muted">
            Students can set up the page in a way that feels good before they start their lessons.
          </p>
          <Link to="/signup" className="landing-pill landing-pill-primary mt-8 inline-flex">
            Join Academee
            <ArrowForward fontSize="small" />
          </Link>
        </div>

        <div className="landing-card bg-surface p-4 md:p-6">
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <article key={step.title} className="grid gap-4 rounded-lg border border-token bg-surface-alt p-5 sm:grid-cols-[auto_1fr]">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg border border-token text-sm font-bold text-main ${index === 0 ? 'bg-[#fff0a8] dark:bg-surface' : index === 1 ? 'bg-[#dfeaff] dark:bg-surface' : 'bg-[#e8f3de] dark:bg-surface'}`}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight text-main">{step.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-7 text-muted">{step.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-token bg-surface-alt p-5 text-main">
            <div className="flex items-start gap-3">
              <img src = {logo}  className='w-8 mt-4'/>
              <p className="ml-2 text-sm font-medium leading-7 text-muted">
                Everything is easy to find in one place: courses, quizzes, tasks, comfort settings, and past quiz tips.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
