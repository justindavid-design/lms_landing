import React, { useEffect } from 'react'
import Container from '@mui/material/Container'
import AOS from 'aos'
import 'aos/dist/aos.css'

function TestCard({ name, feedback, className }){
  return (
    <div 
      className={`bg-lmsgreen rounded-[2.5rem] p-8 w-full max-w-[320px] h-[180px] flex flex-col items-center justify-center text-center text-white soft-shadow transition-transform hover:scale-105 duration-300 ${className}`}
    >
      {/* Profile Placeholder */}
      <div className="w-14 h-14 bg-gray-300/50 rounded-full mb-3 shadow-inner"></div>
      
      <h4 className="font-['Poppins'] font-bold text-sm mb-1 uppercase tracking-tight">{name}</h4>
      <p className="font-['Montserrat'] text-[10px] leading-relaxed text-white/90 px-2 italic">
        "{feedback}"
      </p>
    </div>
  )
}

export default function Testimonials(){
  // Initialize AOS for the section
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <section className="font-['Poppins'] py-20 bg-surface overflow-hidden">
      {/* Header Container with Fade Up */}
      <Container maxWidth="md" className="text-center" data-aos="fade-up">
        <h4 className="text-sm text-gray-400 font-medium">_</h4>
        <div className="text-sm text-gray-500 mb-24 font-medium tracking-widest">
          Testimonials
        </div>
      </Container>

      <Container maxWidth="lg" className="mt-18">
        {/* Staggered Card Layout with AOS entrance */}
        <div className="relative flex flex-col md:flex-row justify-center items-center gap-10 md:gap-20 mb-24 px-4">
          
          {/* Testimonial 1: Enters from Left */}
          <div data-aos="fade-right" data-aos-delay="200">
            <TestCard 
              name="Renz Gabriel" 
              feedback="The adaptive feedback caught exactly where I was struggling in Network Management. It's like having a tutor right there in the dashboard."
              className="md:-translate-y-12" 
            />
          </div>
          
          {/* Testimonial 2: Enters from Right */}
          <div data-aos="fade-left" data-aos-delay="400">
            <TestCard 
              name="Sofia De Leon" 
              feedback="As a student with low vision, the high-contrast themes and screen reader support made this the most inclusive LMS I've ever used."
              className="md:translate-y-12" 
            />
          </div>
          
        </div>

        {/* Contact Section with Slide Up */}
        <div 
          className="max-w-5xl mx-auto bg-lmsgreen p-10 md:p-14 rounded-[3rem] text-center shadow-lg mt-10"
          data-aos="fade-up"
          data-aos-anchor-placement="bottom-bottom"
        >
          <h4 className="font-['Poppins'] text-xl font-bold text-white mb-2">Get in touch with us</h4>
          <p className="font-['Montserrat'] text-[11px] text-white/80 mb-8 max-w-sm mx-auto leading-normal">
            Ready to experience a more accessible way to learn? Send us your email and we'll help you get started with your account.
          </p>
          
          <form className="flex flex-col items-center gap-4 max-w-xs mx-auto">
            <input 
              type="email" 
              placeholder="Email..." 
              className="w-full p-3 px-6 rounded-xl outline-none font-['Montserrat'] text-xs text-main bg-surface shadow-inner focus:ring-2 focus:ring-black/20 transition-all"
              required 
            />
            <button 
              type="submit" 
              className="bg-surface text-main font-medium px-10 py-2.5 rounded-full hover-surface active:scale-95 transition-all tracking-widest text-[10px]"
            >
              Submit
            </button>
          </form>
        </div>
      </Container>
    </section>
  )
}