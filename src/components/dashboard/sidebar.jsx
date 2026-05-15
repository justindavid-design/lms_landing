import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  ArchiveOutlined,
  AssignmentOutlined,
  CalendarTodayOutlined,
  DashboardOutlined,
  LibraryBooksOutlined,
  QuizOutlined,
  SettingsOutlined,
} from '@mui/icons-material'
import LogoutButton from '../LogoutButton'
import logoutIcon from '../../assets/lg.png'

const primaryItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardOutlined },
  { to: '/courses', label: 'Courses', icon: LibraryBooksOutlined },
  { to: '/calendar', label: 'Calendar', icon: CalendarTodayOutlined },
  { to: '/tasks', label: 'Assignments', icon: AssignmentOutlined },
  { to: '/quiz-maker', label: 'Quiz Maker', icon: QuizOutlined },
  { to: '/archived', label: 'Archive', icon: ArchiveOutlined },
]

function SidebarItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      title={label}
      aria-label={label}
      className={({ isActive }) =>
        `group flex min-h-[48px] items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold outline-none transition focus-visible:ring-4 focus-visible:ring-[#1f7a4d]/20 ${
          isActive
            ? 'bg-[#e6f6ec] text-[#145c39] shadow-[inset_3px_0_0_#1f7a4d]'
            : 'text-[#425466] hover:bg-white/80 hover:text-[#145c39]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl transition ${isActive ? 'bg-[#1f7a4d] text-white' : 'bg-white text-[#4d6357] group-hover:bg-[#effaf3]'}`}>
            <Icon sx={{ fontSize: 20 }} />
          </span>
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ isOpen }) {
  return (
    <aside
      className={`${isOpen ? 'w-[250px]' : 'w-0 md:w-[86px]'} flex-shrink-0 overflow-hidden border-r border-white/70 bg-white/72 backdrop-blur-xl transition-all duration-300`}
      aria-label="Dashboard navigation"
    >
      <div className="flex h-full flex-col justify-between px-4 pb-6 pt-5">
        <div>
          <nav className="grid gap-1.5">
            {primaryItems.map((item) => (
              <SidebarItem key={item.to} {...item} />
            ))}
          </nav>
        </div>

        <div className="grid gap-1.5 rounded-3xl border border-white/80 bg-white/64 p-2 shadow-[0_20px_50px_rgba(31,122,77,0.08)]">
          <SidebarItem to="/settings" label="Settings" icon={SettingsOutlined} />
          <div className="[&_button]:flex [&_button]:min-h-[48px] [&_button]:w-full [&_button]:items-center [&_button]:gap-3 [&_button]:rounded-2xl [&_button]:px-3.5 [&_button]:py-3 [&_button]:text-sm [&_button]:font-bold [&_button]:text-[#425466] [&_button]:transition [&_button]:hover:bg-white [&_button]:hover:text-[#145c39]">
            <LogoutButton isOpen={isOpen} imageSrc={logoutIcon} />
          </div>
        </div>
      </div>
    </aside>
  )
}
