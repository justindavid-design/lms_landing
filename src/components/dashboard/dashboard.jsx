import React, { useEffect, useState } from 'react';
import { Add, KeyboardArrowDown, Menu, NotificationsNone, Search, TuneOutlined } from '@mui/icons-material';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Sidebar from './sidebar';
import Home from './Home'
import LogoutButton from '../LogoutButton'
import { useAuth } from '../../lib/AuthProvider'
import { useCourseName } from '../../lib/CourseNameContext'
import { CourseModalProvider, useCourseModal } from '../../lib/CourseModalContext'
import CourseModalOverlay from '../CourseModalOverlay'
import logo from '../../assets/logo.png'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/courses', label: 'Courses' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/quiz-maker', label: 'Quiz Maker' },
  { to: '/archived', label: 'Archive' },
  { to: '/settings', label: 'Settings' },
]

function AppMark() {
  return (
    <span className="relative block h-9 w-10 text-[#006400]">
      <span className="absolute bottom-0 left-0 h-7 w-5 rounded-t-full border-[7px] border-current border-b-0" />
      <span className="absolute bottom-0 right-0 h-7 w-5 rounded-t-full border-[7px] border-current border-b-0" />
      <span className="absolute bottom-0 left-2 h-2 w-6 bg-current" />
    </span>
  )
}

function getInitials(name, user) {
  const metadata = user?.user_metadata || {}
  const first = metadata.first_name || metadata.given_name
  const last = metadata.last_name || metadata.family_name

  if (first || last) {
    return `${String(first || '').trim()[0] || ''}${String(last || '').trim()[0] || ''}`.toUpperCase() || 'U'
  }

  const cleanName = String(name || '')
    .trim()
    .replace(/\s+/g, ' ')

  if (cleanName && !cleanName.includes('@')) {
    const parts = cleanName.split(' ')
    const firstInitial = parts[0]?.[0] || ''
    const lastInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : ''
    return `${firstInitial}${lastInitial}`.toUpperCase() || 'U'
  }

  return String(user?.email || cleanName || 'U')[0]?.toUpperCase() || 'U'
}

function DashboardContent({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const { openCreate, openEnroll } = useCourseModal();
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const location = useLocation();
  const { user, profileName } = useAuth();
  const { currentCourseName } = useCourseName();

  const userName = profileName || user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email || 'Justin';
  const firstName = String(userName).split(/\s+/)[0] || 'Justin'
  const avatarInitials = getInitials(userName, user);

  useEffect(() => {
    setShowCourseMenu(false);
    setShowAvatarMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const loadProfilePicture = () => {
      try {
        const savedProfile = JSON.parse(window.localStorage.getItem('userProfile') || '{}')
        if (savedProfile.profilePicture) setProfilePicture(savedProfile.profilePicture)
      } catch (_e) {}
    }

    loadProfilePicture()
    const interval = setInterval(loadProfilePicture, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('academee_accessibility') || '{}');
      document.documentElement.classList.toggle('a11y-high-contrast', !!prefs.highContrast);
      document.documentElement.classList.toggle('a11y-large-text', !!prefs.largeText);
      document.documentElement.classList.toggle('a11y-reduced-motion', !!prefs.reducedMotion);
      document.documentElement.classList.toggle('a11y-readable-font', !!prefs.readableFont);
    } catch (_e) {}
  }, []);

  const currentTitle = location.pathname.startsWith('/courses/') && location.pathname !== '/courses'
    ? currentCourseName || 'Course Details'
    : navItems.find((item) => item.to === location.pathname)?.label || 'Dashboard'

  return (
    <div className="flex h-screen flex-col bg-[#f4fbf6] text-[#1d2b24] font-sans">
      <header className="sticky top-0 z-30 flex min-h-[82px] flex-shrink-0 items-center justify-between border-b border-white/80 bg-[#f8fff9]/86 px-5 shadow-[0_10px_32px_rgba(31,122,77,0.06)] backdrop-blur-xl md:px-7">
        <div className="flex min-w-0 items-center gap-5">
          <Link to="/dashboard" aria-label="Academee dashboard" className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-[0_12px_30px_rgba(31,122,77,0.12)]">
              <img src={logo} alt="Academee logo" className="h-7 w-8" />
            </span>
            <span className="hidden lg:block">
              <span className="block text-sm font-black uppercase tracking-[0.16em] text-[#6c7c71]">Academee</span>
              <span className="block text-xl font-black tracking-tight text-[#1d2b24]">Welcome back, {firstName}</span>
            </span>
          </Link>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#1d2b24] shadow-sm md:hidden"
            onClick={() => setIsOpen((value) => !value)}
            aria-label="Toggle sidebar"
          >
            <Menu />
          </button>
        </div>

        <div className="mx-5 hidden min-w-[260px] max-w-xl flex-1 items-center rounded-2xl border border-[#dfe9e2] bg-white/88 px-4 py-2.5 shadow-[0_12px_28px_rgba(31,122,77,0.06)] lg:flex">
          <Search sx={{ fontSize: 21 }} className="text-[#65766c]" />
          <input
            type="search"
            placeholder="Search courses, tasks, students..."
            className="ml-3 w-full bg-transparent text-sm font-semibold text-[#1d2b24] placeholder:text-[#7a8b80] focus:outline-none"
            aria-label="Search dashboard"
          />
          <button type="button" className="ml-3 grid h-8 w-8 place-items-center rounded-xl bg-[#edf7f0] text-[#1f7a4d]" aria-label="Search filters">
            <TuneOutlined sx={{ fontSize: 18 }} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCourseMenu((value) => !value)}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#1f7a4d] px-4 text-sm font-black text-white shadow-[0_16px_30px_rgba(31,122,77,0.22)] transition hover:bg-[#18613d]"
              aria-label="Course actions"
            >
              <Add sx={{ fontSize: 20 }} />
              <span className="hidden sm:inline">Create</span>
            </button>
            {showCourseMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCourseMenu(false)} />
                <div className="absolute right-0 z-50 mt-3 w-56 rounded-3xl border border-[#dfe9e2] bg-white p-2 shadow-[0_24px_60px_rgba(31,42,35,0.14)]">
                  <button
                    onClick={() => { openCreate(); setShowCourseMenu(false); }}
                    className="w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-[#1d2b24] hover:bg-[#e6f6ec]"
                  >
                    Create Course
                  </button>
                  <button
                    onClick={() => { openEnroll(); setShowCourseMenu(false); }}
                    className="w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-[#1d2b24] hover:bg-[#e6f6ec]"
                  >
                    Join Course
                  </button>
                </div>
              </>
            )}
          </div>

          <Link to="/notifications" className="relative grid h-11 w-11 place-items-center rounded-2xl border border-[#dfe9e2] bg-white text-[#314238] shadow-sm transition hover:bg-[#f0faf3]" aria-label="Notifications">
            <NotificationsNone />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#1f7a4d]" />
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAvatarMenu((value) => !value)}
              className="flex items-center gap-2 rounded-2xl border border-[#dfe9e2] bg-white px-2 py-1.5 shadow-sm transition hover:bg-[#f0faf3]"
              aria-expanded={showAvatarMenu}
              aria-haspopup="menu"
            >
              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[#1f7a4d] text-sm font-black text-white">
                {profilePicture ? <img src={profilePicture} alt={userName} className="h-full w-full object-cover" /> : avatarInitials}
              </span>
              <KeyboardArrowDown className="text-[#65766c]" />
            </button>

            {showAvatarMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAvatarMenu(false)} />
                <div role="menu" className="absolute right-0 z-50 mt-3 w-64 rounded-3xl border border-[#dfe9e2] bg-white p-2 shadow-[0_24px_60px_rgba(31,42,35,0.14)]">
                  <div className="px-3 py-3">
                    <p className="truncate text-sm font-black text-[#1d2b24]">{userName}</p>
                    <p className="truncate text-xs font-medium text-[#65766c]">{user?.email}</p>
                  </div>
                  <Link to="/settings" className="block rounded-2xl px-3 py-2.5 text-sm font-bold text-[#1d2b24] hover:bg-[#e6f6ec]">
                    Profile settings
                  </Link>
                  <LogoutButton isOpen />
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar isOpen={isOpen} />

        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full px-5 pb-8 pt-6 md:px-8">
            <div className="sr-only">{currentTitle}</div>
            {React.isValidElement(children) ? children : (children || <Home />)}
          </div>
        </main>
      </div>

      <CourseModalOverlay />
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <CourseModalProvider>
      <DashboardContent>{children}</DashboardContent>
    </CourseModalProvider>
  )
}
