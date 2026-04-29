import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowForward } from '@mui/icons-material'

const communityCards = [
  {
    title: 'Simple home page',
    body: 'Students can continue lessons, answer quizzes, and read tips without clutter.',
    tone: 'bg-[#dfeaff] dark:bg-surface',
  },
  {
    title: 'Help is easier to spot',
    body: 'Teachers can see who may need support without reading complicated reports.',
    tone: 'bg-[#e8f3de] dark:bg-surface',
  },
  {
    title: 'Ready for more learners',
    body: 'Clear pages and comfort settings help more students take part from the start.',
    tone: 'bg-[#fff0a8] dark:bg-surface',
  },
]

const faqs = [
  {
    question: 'What makes Academee easy to use?',
    answer: 'It puts clear colors, readable spacing, keyboard help, comfort settings, and simple quiz tips first.',
  },
  {
    question: 'Who benefits from the comfort tools?',
    answer: 'Students who need help with seeing, reading, focusing, movement, or screen motion can benefit. The same clarity helps the whole class too.',
  },
  {
    question: 'Do quizzes give helpful tips?',
    answer: 'Yes. Quiz tips guide students toward what to review next in clear and encouraging words.',
  },
  {
    question: 'Can students adjust the page?',
    answer: 'Yes. The app includes stronger colors, larger text, easier fonts, and less movement.',
  },
  {
    question: 'Is the page made to be easier for everyone?',
    answer: 'Yes. The page is designed with clear colors and easy keyboard movement, and it should keep being checked as new features are added.',
  },
]

export default function Testimonials() {
  return (
    <section id="reviews" className="bg-surface px-4 py-16 md:px-10 md:py-24 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="landing-eyebrow mx-auto">For every kind of learner</p>
          <h2 className="landing-title mx-auto mt-5 max-w-3xl">Designed for students who need clarity before speed.</h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {communityCards.map((card) => (
            <article key={card.title} className={`landing-card ${card.tone} p-6`}>
              <div className="h-40 rounded-lg border border-token bg-surface-alt p-4">
                <div className="h-4 w-2/3 rounded-full bg-token-muted" />
                <div className="mt-5 grid gap-3">
                  <div className="h-10 rounded-md bg-app" />
                  <div className="h-10 rounded-md bg-app" />
                  <div className="h-10 rounded-md bg-app" />
                </div>
              </div>
              <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-main">{card.title}</h3>
              <p className="mt-3 text-sm font-medium leading-7 text-muted">{card.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-8">
          <div className="text-center">
            <p className="landing-eyebrow">FAQ</p>
            <h2 className="landing-title mt-5">Questions before you begin?</h2>
          </div>

          <div className="grid gap-3 w-full max-w-2xl">
            {faqs.map((faq) => (
              <details key={faq.question} className="landing-card group bg-surface px-5 py-4">
                <summary className="cursor-pointer list-none text-base font-bold text-main">
                  <span className="flex items-center justify-between gap-4">
                    {faq.question}
                    <span className="text-2xl leading-none transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-lg font-medium leading-7 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="landing-card mt-16 bg-surface-alt p-6 text-center text-main md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#fff0a8]">Academee</p>
          <h3 className="mx-auto mt-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Create a learning space that fits you.
          </h3>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup" className="landing-pill landing-pill-primary min-w-44">
              Create account
              <ArrowForward fontSize="small" />
            </Link>
            <Link to="/login" className="landing-pill border-token bg-surface text-main min-w-36">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
