import React from 'react'
import Container from '@mui/material/Container'

function TestCard(){
  return (
    <div className="bg-lmsgreen rounded-xl-card p-6 w-64 h-36 flex flex-col items-center justify-center text-white">
      <div className="w-10 h-10 bg-gray-200 rounded-full mb-3"></div>
      <div className="text-sm font-semibold">Heading goes here</div>
      <div className="text-xs mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
    </div>
  )
}

export default function Testimonials(){
  return (
    <section className="py-16 bg-white">
      <Container maxWidth="md" className="text-center">
        <div className="text-sm text-gray-500 mb-4">- Testimonials</div>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <TestCard />
          <TestCard />
        </div>

        <div className="mt-12 bg-lmsgreen p-8 rounded-xl-card">
          <h4 className="text-lg font-semibold text-white mb-2">Get in touch with us</h4>
          <p className="text-sm text-white/90 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <div className="flex justify-center">
            <input placeholder="Email..." className="p-2 rounded-l-full w-64" />
            <button className="bg-black text-white px-4 rounded-r-full">SUBMIT</button>
          </div>
        </div>
      </Container>
    </section>
  )
}
