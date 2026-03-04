import React from 'react';
import { Link, useLocation } from 'react-router-dom' // Added useLocation
import { Menu } from '@mui/icons-material';
import LogoutButton from '../LogoutButton'

const SidebarItem = ({ imgSrc, label, isOpen, to }) => {
  const location = useLocation(); // Get the current path
  const active = location.pathname === to; // Check if current path matches item destination

  const getIconSrc = (src, active) => {
    if (!active) return src
    const match = src.match(/(.+)\.(svg|png|jpg|jpeg)$/i)
    if (!match) return src
    const base = match[1]
    const ext = match[2]
    return `${base}-green.${ext}`
  }

  const iconSrc = getIconSrc(imgSrc, active)

  return (
    <Link to={to} className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-colors
    ${active ? 'bg-green-50/50 text-green-600 rounded-l-md' : 'text-slate-600 hover:bg-slate-50'}`}>
    
    <img 
      src={iconSrc} 
      alt={label} 
      className={`w-5 h-5 object-contain ${active ? 'grayscale-0 opacity-100' : 'grayscale opacity-70'}`} 
    />
    
    {isOpen && <span className="text-sm font-medium">{label}</span>}
  </Link>
  );
};

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <aside className={`${isOpen ? 'w-64' : 'w-[75px]'} bg-white transition-all duration-300 flex flex-col h-screen border-r border-slate-100 shadow-sm`}>
      <div className="p-6 mb-2 flex items-center gap-3">
        <Menu className="cursor-pointer text-slate-600" onClick={toggleSidebar} />
        {isOpen && (
          <div className="flex items-center gap-2">
            <img src="/src/assets/logo_f.png" alt="logo" className="w-[94px] h-10 object-contain" />
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto">
        <SidebarItem imgSrc="/src/assets/dashb.png" label="Dashboard" to="/dashboard" isOpen={isOpen} />
        <SidebarItem imgSrc="/src/assets/course.png" label="Courses" to="/courses" isOpen={isOpen} />
        <SidebarItem imgSrc="/src/assets/calendar.png" label="Calendar" to="/calendar" isOpen={isOpen} />
        <SidebarItem imgSrc="/src/assets/task.png" label="Task" to="/tasks" isOpen={isOpen} />
        
        <div className="mt-[175px]">
          <SidebarItem imgSrc="/src/assets/archi.png" label="Archived Courses" to="/archived" isOpen={isOpen} />
        </div>
      </nav>

      <div className="pb-8 border-t border-slate-100 pt-4">
        {isOpen && <p className="px-6 text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Setting</p>}
        <SidebarItem imgSrc="/src/assets/settin.png" label="Settings" to="/settings" isOpen={isOpen} />
        <div className="mt-2">
          <LogoutButton isOpen={isOpen} />
        </div>
      </div>
    </aside>
  );
}