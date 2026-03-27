import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import { Menu, Add } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import Home from './Home'
import { useAuth } from '../../lib/AuthProvider'

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [courseActions, setCourseActions] = useState(null);
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const location = useLocation();
  const { user, profileName } = useAuth();

  const isCoursesPage = location.pathname === '/courses';

  const titleMap = {
    '/dashboard': 'Dashboard',
    '/courses': 'Courses',
    '/calendar': 'Calendar',
    '/tasks': 'Tasks',
    '/archived': 'Archived Courses',
    '/settings': 'Settings'
  };

  const currentTitle = titleMap[location.pathname] || 'Google Classroom';
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
                    onClick={() => { courseActions?.openCreate?.(); setShowCourseMenu(false); }}
                    className="w-full text-left px-4 py-3 hover-surface text-sm text-main"
                  >
                    Create Course
                  </button>
                  <button
                    onClick={() => { courseActions?.openEnroll?.(); setShowCourseMenu(false); }}
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
            className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-xs cursor-pointer ml-2"
          >
            {avatarInitials}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isOpen} />

        <main className="flex-1 overflow-y-auto bg-app">
          <div className="w-full h-full pt-6 px-6">
            {React.isValidElement(children)
              ? React.cloneElement(children, { registerHeaderActions: setCourseActions })
              : (children || <Home />)}
          </div>
        </main>
      </div>
    </div>
  );
}