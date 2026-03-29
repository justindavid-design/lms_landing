import React from 'react';
import { Link, useLocation } from 'react-router-dom'
import LogoutButton from '../LogoutButton'

function DynamicSvgIcon({ src, active }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-5 w-5 ${active ? 'opacity-100' : 'opacity-70'}`}
      style={{
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  )
}

const SidebarItem = ({ iconSrc, label, isOpen, to }) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link to={to} className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-all
    ${active ? 'bg-surface-alt text-main rounded-r-full mr-2' : 'text-muted hover-surface'}`}>
      <DynamicSvgIcon src={iconSrc} active={active} />
      
      {isOpen && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
    </Link>
  );
};

export default function Sidebar({ isOpen }) {
  return (
    // CHANGE: Height is now 100% of the remaining space, no top padding needed for logo
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-sidebar transition-all duration-300 flex flex-col border-r border-token overflow-hidden`}>
      
      <nav className="flex-1 overflow-y-auto pt-4">
        <SidebarItem iconSrc="/src/assets/dash.svg" label="Dashboard" to="/dashboard" isOpen={isOpen} />
        <SidebarItem iconSrc="/src/assets/cour.svg" label="Courses" to="/courses" isOpen={isOpen} />
        <SidebarItem iconSrc="/src/assets/cale.svg" label="Calendar" to="/calendar" isOpen={isOpen} />
        <SidebarItem iconSrc="/src/assets/task.svg" label="To-do" to="/tasks" isOpen={isOpen} />
        
        <div className="my-4 border-t border-token mx-4" />

        <SidebarItem iconSrc="/src/assets/arch.svg" label="Archived Courses" to="/archived" isOpen={isOpen} />
      </nav>

      <div className="pb-8 border-t border-token pt-4">
        {isOpen && <p className="px-6 text-[10px] uppercase tracking-widest text-subtle font-bold mb-2">Settings</p>}
        <SidebarItem iconSrc="/src/assets/sett.svg" label="Settings" to="/settings" isOpen={isOpen} />
        <div className={`mt-2 ${isOpen ? 'px-2' : 'px-0'}`}>
          <LogoutButton isOpen={isOpen} />
        </div>
      </div>
    </aside>
  );
}