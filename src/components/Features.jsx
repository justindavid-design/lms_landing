import React from 'react'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

export default function Features(){
  return (
    <section className="py-16">
      <Container maxWidth="md" className="text-center">
        <div className="text-sm text-gray-500 mb-4">- Features</div>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-28 h-20 bg-slate-200 rounded-xl"></div>
          <div className="bg-lmsgreen rounded-xl-card soft-shadow w-96 h-44"></div>
          <div className="w-28 h-20 bg-slate-200 rounded-xl"></div>
        </div>
        <h3 className="text-2xl font-semibold mb-2">Heading goes here</h3>
        <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi rutrum sed magna id mollis.</p>
      </Container>
    </section>
  )
}
