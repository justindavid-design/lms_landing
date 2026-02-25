import React from 'react'

export default function Footer(){
  return (
    <footer className="bg-lmsgreen text-white mt-12 py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <div className="font-bold mb-2">logoipsum</div>
          <div className="text-sm text-white/90">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
        </div>
        <div>
          <div className="font-semibold mb-2">Quick links</div>
          <ul className="text-sm">
            <li>LINK 1</li>
            <li>LINK 1</li>
            <li>LINK 1</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Our Services</div>
          <ul className="text-sm">
            <li>LINK 1</li>
            <li>LINK 1</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Contact us</div>
          <div className="text-sm">123-567-890</div>
          <div className="text-sm">your-email@mailk.com</div>
        </div>
      </div>
    </footer>
  )
}
