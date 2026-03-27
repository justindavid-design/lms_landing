import React from 'react'
import Container from '@mui/material/Container'
function Card({children, className = '', style = {}, sx = {}, ...rest}){
  const mergedStyle = Object.assign({}, style, sx)
  return (
    <div className={`bg-lmsgreen rounded-xl-card p-6 w-44 h-36 ${className}`} style={mergedStyle} {...rest}>
      {children}
    </div>
  )
}

export default function About(){

  React.useEffect(() => {
    // AOS is initialized globally in main.jsx; ensure refresh if needed
    if (typeof window !== 'undefined' && window.AOS) window.AOS.refresh()
  }, []);


  return (
    <section className="py-20 font-['Poppins']">
  <Container maxWidth="md" className="text-center" data-aos="fade-up">
    <h4 className="text-sm text-gray-500 font-medium">_</h4>
    <div className="text-sm text-gray-500 mb-4 font-medium">About Us</div>
    <h2 className="text-3xl font-bold mb-4" data-aos="fade-up" data-aos-delay="100">Our Core Values</h2>
    <p className="font-['Montserrat'] text-gray-600 mb-10" data-aos="fade-up" data-aos-delay="200">
      Learning Management System (LMS) with an integrated Quiz Maker featuring Adaptive Feedback. The system is designed to provide a distraction-free and accessible environment for all learners, particularly Persons with Disabilities (PWD).
    </p>
  </Container>

  <Container maxWidth="lg" className="mt-10">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      
      {/* 1st Card: Rounded Bottom Right (Speech Bubble Style) */}
      <div className="flex justify-center" data-aos="fade-right">
        <Card sx={{ 
          backgroundImage: "url('/src/assets/a1.png')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          minHeight: '280px', width: '65%',
          borderTopLeftRadius: '44px', 
          borderBottomRightRadius: 0,
          borderTopRightRadius: '44px',
          borderBottomLeftRadius: '44px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}/>
      </div>
      <div data-aos="fade-left">
        <h2 className="text-3xl font-bold mb-3">Empowering Learners through Intelligent Technology</h2>
        <p className="font-['Montserrat'] text-gray-600 leading-relaxed">
          Our platform goes beyond traditional testing by integrating an advanced quiz maker with real-time adaptive feedback. We believe that assessment should be a learning opportunity, not just a final score.
        </p>
      </div>

      {/* 2nd Card: Rounded Bottom Left (Aligned to the Right) */}
      <div className="flex flex-col text-right " data-aos="fade-right">
        <h3 className="text-2xl font-bold mb-3">Personalized Education for Every Ambition</h3>
        <p className="font-['Montserrat'] text-gray-600 leading-relaxed ">
          We are dedicated to making high-quality learning accessible and effective. Our Learning Management System is built with the student in mind, featuring an adaptive quiz engine that adjusts to your unique progress.
        </p>
      </div>
      <div className="flex justify-center" data-aos="fade-left">
        <Card sx={{ 
          backgroundImage: "url('/src/assets/a2.png')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          minHeight: '280px', width: '65%',
          borderTopLeftRadius: '44px', 
          borderBottomRightRadius: '44px',
          borderTopRightRadius: '44px',
          borderBottomLeftRadius: 0,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}/>
      </div>

      {/* 3rd Card: Rounded Top Right */}
      <div className="flex justify-center" data-aos="fade-right">
        <Card sx={{ 
          backgroundImage: "url('/src/assets/a3.png')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          minHeight: '280px', width: '65%',
          borderTopLeftRadius: '44px', 
          borderBottomRightRadius: '44px',
          borderTopRightRadius: 0,
          borderBottomLeftRadius: '44px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}/>
      </div>
      <div data-aos="fade-left">
        <h3 className="text-2xl font-bold mb-3">The Future of Adaptive Assessment</h3>
        <p className="font-['Montserrat'] text-gray-600 leading-relaxed">
          By leveraging adaptive feedback mechanisms, our LMS transforms the standard quiz experience into a dynamic dialogue between the learner and the material. We provide the tools necessary for schools and organizations to implement smarter, more responsive education strategies that ensure no learner is left behind.
        </p>
      </div>

    </div>
  </Container>
</section>
  )
}
