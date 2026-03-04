import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, X, Phone, Mail} from '@mui/icons-material'

export default function Footer() {
  return (
    <footer className="font-['Poppins'] bg-lmsgreen text-white py-16 px-8 md:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/10 pb-12">
          
          {/* Logo & Description */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
                {/* Fixed size to match your Hero logo */}
                <div>
                  <img 
                    src="/src/assets/logo_w.png" 
                    alt="Academee Logo" 
                    className="w-[150px] h-[84px] object-contain" 
                  />
                </div>
            </div>
            <p className="text-[13px] leading-relaxed max-w-xs mb-8 font-['Montserrat']">
              Empowering learners through adaptive feedback and inclusive design for all abilities.
            </p>
            {/* Social Icons matching Footer.png */}
            <div className="flex gap-4">
              <Facebook fontSize="small" className="cursor-pointer hover:opacity-70" />
              <Instagram fontSize="small" className="cursor-pointer hover:opacity-70" />
              <X fontSize="small" className="cursor-pointer hover:opacity-70" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="font-poppins font-bold text-lg mb-6">Quick links</h4>
            <ul className="space-y-4 text-[13px]">
              <li><Link to="/" className="hover:underline transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:underline transition-colors">About Us</Link></li>
              <li><Link to="/features" className="hover:underline transition-colors">Features</Link></li>
              <li><Link to="/faq" className="hover:underline transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="md:col-span-2">
            <h4 className="font-poppins font-bold text-lg mb-6">Our Services</h4>
            <ul className="space-y-4 text-[13px]">
              <li><Link to="/dashboard" className="hover:underline transition-colors">LMS Dashboard</Link></li>
              <li><Link to="/courses" className="hover:underline transition-colors">Course Library</Link></li>
              <li><Link to="/accessibility" className="hover:underline transition-colors">PWD Support</Link></li>
              <li><Link to="/feedback" className="hover:underline transition-colors">Adaptive Tools</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="md:col-span-4">
            <h4 className="font-poppins font-bold text-lg mb-6">Contact us</h4>
            <div className="space-y-4 text-[13px]">
              <div className="flex items-center gap-3">
                <Phone fontSize="small" />
                <span>123-567-890</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail fontSize="small" />
                <span>academee@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: ITEC 106A Requirement */}
        <div className="pt-8 text-center text-[10px] text-white/60 font-medium font-['Montserrat']">
          <p className="mb-1">© 2026 ITEC 106A Requirement</p>
          <div className="flex justify-center gap-4">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <span className="border-l border-white/20 h-3"></span>
            <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}