import React, { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import AOS from 'aos'
import 'aos/dist/aos.css' // Import styles

const featureData = [
  {
    title: "Adaptive Feedback",
    description: "Our system analyzes your answers in real-time to provide hints and guidance tailored to your learning pace.",
    image: "/src/assets/f2.png"
  },
  {
    title: "PWD Accessibility",
    description: "Designed with inclusivity in mind, featuring screen reader support and customizable high-contrast themes.",
    image: "/src/assets/f1.png"
  },
  {
    title: "Smart Progress Tracking",
    description: "Visualize your improvement over time with detailed charts and achievement milestones.",
    image: "/src/assets/f3.png"
  }
];

export default function Features() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  const prevIndex = (currentIndex - 1 + featureData.length) % featureData.length;
  const nextIndex = (currentIndex + 1) % featureData.length;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featureData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, isPaused]);

  return (
    <section 
      className="py-16 bg-surface overflow-hidden font-['Poppins']"
      onMouseEnter={() => setIsPaused(true)}  
      onMouseLeave={() => setIsPaused(false)} 
    >
      {/* AOS added to the Header Container */}
      <Container maxWidth="md" className="text-center" data-aos="fade-up">
        <h4 className="text-sm text-gray-500 font-medium">_</h4>
        <div className="text-sm text-gray-500 mb-4 font-medium">Features</div>
      </Container>
    
      <Container maxWidth="lg" className="text-center">
        {/* AOS added to the Slider Container with a slight delay */}
        <div className="flex items-center justify-center gap-4 md:gap-12 mb-10 h-80" data-aos="fade-up" data-aos-delay="200">
          
          {/* LEFT PEEK */}
          <div className="hidden lg:flex flex-col items-center gap-2 w-32 opacity-20 scale-75 transition-all duration-1000 ease-in-out grayscale">
            <div className="w-28 h-20 flex items-center justify-center overflow-hidden">
              <img src={featureData[prevIndex].image} alt="" className="w-full h-full object-contain" />
            </div>
          </div>
          
          {/* MAIN ACTIVE CARD */}
          <div className="relative w-80 md:w-[500px] h-64 flex items-center justify-center transition-all duration-1000 ease-in-out transform scale-110">
             <img 
               key={currentIndex} 
               src={featureData[currentIndex].image} 
               alt={featureData[currentIndex].title} 
               className="w-full h-full object-contain animate-in fade-in zoom-in-75 duration-1000"
             />
          </div>

          {/* RIGHT PEEK */}
          <div className="hidden lg:flex flex-col items-center gap-2 w-32 opacity-20 scale-75 transition-all duration-1000 ease-in-out grayscale">
            <div className="w-28 h-20 flex items-center justify-center overflow-hidden">
              <img src={featureData[nextIndex].image} alt="" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Text Content with AOS delay */}
        <div key={currentIndex} className="animate-in fade-in slide-in-from-bottom-4 duration-1000 px-4 mt-8" data-aos="fade-up" data-aos-delay="400">
          <h3 className="text-3xl font-bold font-poppins mb-3 text-main">
            {featureData[currentIndex].title}
          </h3>
          <p className="text-gray-600 font-['Montserrat'] max-w-lg mx-auto leading-relaxed text-sm">
            {featureData[currentIndex].description}
          </p>
        </div>
      </Container>
    </section>
  )
}