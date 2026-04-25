import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import { Menu, Add } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import Home from './Home'
import { useAuth } from '../../lib/AuthProvider'
import { useCourseName } from '../../lib/CourseNameContext'
import { CourseModalProvider, useCourseModal } from '../../lib/CourseModalContext'
import CourseModalOverlay from '../CourseModalOverlay'

function DashboardContent({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const { openCreate, openEnroll } = useCourseModal();
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const location = useLocation();
  const { user, profileName } = useAuth();
  const { currentCourseName } = useCourseName();

  const isCoursesPage = location.pathname === '/courses';

  const titleMap = {
    '/dashboard': 'Home',
    '/courses': 'Courses',
    '/calendar': 'Calendar',
    '/tasks': 'Tasks',
    '/archived': 'Saved Courses',
    '/settings': 'Settings'
  };

  // Compute current title - handle dynamic routes
  const getCurrentTitle = () => {
    const path = location.pathname;
    
    // Handle course details page - use actual course name from context
    if (path.startsWith('/courses/') && path !== '/courses') {
      return currentCourseName || 'Course Details';
    }
    
    return titleMap[path] || 'Home';
  };

  const currentTitle = getCurrentTitle();
  const userName = profileName || user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email || 'Learner';
  const avatarInitials = String(userName)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('') || 'L';

  useEffect(() => {
    setShowCourseMenu(false);
  }, [location.pathname]);

  // Load profile picture from localStorage
  useEffect(() => {
    const loadProfilePicture = () => {
      try {
        const savedProfile = JSON.parse(window.localStorage.getItem('userProfile') || '{}')
        if (savedProfile.profilePicture) {
          setProfilePicture(savedProfile.profilePicture)
        }
      } catch (_e) {}
    }

    loadProfilePicture()

    // Poll for changes from Settings page (every 500ms)
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

  return (
    <div className="flex flex-col h-screen bg-app text-main font-['Poppins']">
      <header className="bg-header h-16 flex items-center justify-between px-4 border-b border-token sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div
            className="p-2 hover-surface rounded-full cursor-pointer transition-colors"
            onClick={() => setIsOpen(s => !s)}
          >
            <Menu className="text-muted" />
          </div>

          <div className="flex items-center gap-4">
            <img src="/src/assets/logo_f.png" alt="logo" className="w-[100px] h-[40px] object-contain" />
            <div className="h-6 w-[1px] mx-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
            <span className="text-xl text-main font-medium">{currentTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowCourseMenu(!showCourseMenu)}
              className={`p-2 rounded-full hover-surface transition-colors flex items-center justify-center
                ${showCourseMenu ? 'bg-surface-alt' : ''} 
                ${isCoursesPage ? 'text-muted' : 'text-subtle opacity-50'}`}
            >
              <Add className="w-7 h-7" />
            </button>

            {showCourseMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCourseMenu(false)}
                ></div>

                <div className="absolute right-0 mt-4 w-48 bg-surface border border-token rounded-md shadow-xl z-50 py-2">
                  <button
                    onClick={() => { openCreate(); setShowCourseMenu(false); }}
                    className="w-full text-left px-4 py-3 hover-surface text-sm text-main"
                  >
                    Create Course
                  </button>
                  <button
                    onClick={() => { openEnroll(); setShowCourseMenu(false); }}
                    className="w-full text-left px-4 py-3 hover-surface text-sm text-main"
                  >
                    Join Course
                  </button>
                </div>
              </>
            )}
          </div>

          <div
            title={userName}
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs cursor-pointer ml-2 overflow-hidden flex-shrink-0"
            style={profilePicture ? {} : { backgroundColor: '#4f46e5' }}
          >
            {profilePicture ? (
              <img src={profilePicture} alt={userName} className="w-full h-full object-cover" />
            ) : (
              avatarInitials
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isOpen} />

        <main className="flex-1 overflow-y-auto bg-app">
          <div className="w-full h-full pt-6 px-6">
            {React.isValidElement(children)
              ? children
              : (children || <Home />)}
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
