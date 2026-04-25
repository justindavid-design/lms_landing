import React, { createContext, useState, useCallback } from 'react'

export const CourseModalContext = createContext()

export function CourseModalProvider({ children }) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  const openCreate = useCallback(() => {
    setEditingCourse(null)
    setShowCreateForm(true)
  }, [])

  const openEnroll = useCallback(() => {
    setShowEnrollForm(true)
  }, [])

  const closeCreate = useCallback(() => {
    setShowCreateForm(false)
    setEditingCourse(null)
  }, [])

  const closeEnroll = useCallback(() => {
    setShowEnrollForm(false)
  }, [])

  const value = {
    showCreateForm,
    showEnrollForm,
    editingCourse,
    openCreate,
    openEnroll,
    closeCreate,
    closeEnroll,
    setEditingCourse,
  }

  return <CourseModalContext.Provider value={value}>{children}</CourseModalContext.Provider>
}

export function useCourseModal() {
  const context = React.useContext(CourseModalContext)
  if (!context) {
    throw new Error('useCourseModal must be used within CourseModalProvider')
  }
  return context
}
