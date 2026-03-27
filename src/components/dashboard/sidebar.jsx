import React from 'react';
import { Link, useLocation } from 'react-router-dom'
import LogoutButton from '../LogoutButton'

const SidebarItem = ({ imgSrc, label, isOpen, to }) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link to={to} className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-all
    ${active ? 'bg-surface-alt text-main rounded-r-full mr-2' : 'text-muted hover-surface'}`}>
      
      <img 
        src={imgSrc} 
        alt={label} 
        className={`w-5 h-5 object-contain ${active ? 'grayscale-0' : 'grayscale opacity-70'}`} 
      />
      
      {isOpen && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
    </Link>
  );
};

export default function Sidebar({ isOpen }) {
  return (
    // CHANGE: Height is now 100% of the remaining space, no top padding needed for logo
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-sidebar transition-all duration-300 flex flex-col border-r border-token overflow-hidden`}>
      
      <nav className="flex-1 overflow-y-auto pt-4">
        <SidebarItem imgSrc="/src/assets/dashb.png" label="Dashboard" to="/dashboard" isOpen={isOpen} />
        <SidebarItem imgSrc="/src/assets/course.png" label="Courses" to="/courses" isOpen={isOpen} />
        <SidebarItem imgSrc="/src/assets/calendar.png" label="Calendar" to="/calendar" isOpen={isOpen} />
        <SidebarItem imgSrc="/src/assets/task.png" label="To-do" to="/tasks" isOpen={isOpen} />
        
        <div className="my-4 border-t border-token mx-4" />

        <SidebarItem imgSrc="/src/assets/archi.png" label="Archived Courses" to="/archived" isOpen={isOpen} />
      </nav>

      <div className="pb-8 border-t border-token pt-4">
        {isOpen && <p className="px-6 text-[10px] uppercase tracking-widest text-subtle font-bold mb-2">Settings</p>}
        <SidebarItem imgSrc="/src/assets/settin.png" label="Settings" to="/settings" isOpen={isOpen} />
        <div className="mt-2 px-2">
          <LogoutButton isOpen={isOpen} />
        </div>
      </div>
    </aside>
  );
}