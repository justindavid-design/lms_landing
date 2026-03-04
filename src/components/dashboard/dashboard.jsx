import React, { useState } from 'react';
import Sidebar from './sidebar';
import { Add } from '@mui/icons-material';
import Home from './Home'

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-100 font-['Poppins']">
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white h-16 flex items-center justify-end px-8 gap-6 z-10">
          <Add className="text-slate-600 cursor-pointer hover:text-black" />
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-700 text-sm">
            JD
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
          <div className="w-full h-full">
            {children || <Home />}
          </div>
        </main>
      </div>
    </div>
  );
}