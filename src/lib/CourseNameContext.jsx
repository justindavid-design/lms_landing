import React, { createContext, useContext, useState } from 'react'

const CourseContextName = createContext()

export function CourseContextProvider({ children }) {
  const [currentCourseName, setCurrentCourseName] = useState('')

  return (
    <CourseContextName.Provider value={{ currentCourseName, setCurrentCourseName }}>
      {children}
    </CourseContextName.Provider>
  )
}

export function useCourseName() {
  return useContext(CourseContextName)
}
