function toIso(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function addDefaultEnd(startIso, minutes = 60) {
  if (!startIso) return null
  const date = new Date(startIso)
  date.setMinutes(date.getMinutes() + minutes)
  return date.toISOString()
}

function buildCoursePrefix(item, courseMap = {}) {
  const courseTitle = item.course_title || courseMap[item.course_id]?.title || courseMap[item.course_id] || ''
  return courseTitle ? `${courseTitle}: ` : ''
}

export function mapLearningItemsToCalendarEvents({
  assignments = [],
  quizzes = [],
  courseMap = {},
  baseUrl = '',
} = {}) {
  const assignmentEvents = assignments
    .map((assignment) => {
      const start = toIso(assignment.due_at || assignment.start_at)
      if (!start) return null

      return {
        id: `assignment-${assignment.id}`,
        type: 'assignment',
        title: `${buildCoursePrefix(assignment, courseMap)}${assignment.title}`,
        start,
        end: toIso(assignment.end_at) || addDefaultEnd(start),
        url: `${baseUrl}/courses/${assignment.course_id}?assignment=${assignment.id}`,
        extendedProps: {
          course_id: assignment.course_id,
          assignment_id: assignment.id,
          status: assignment.status,
          kind: assignment.kind || 'assignment',
        },
      }
    })
    .filter(Boolean)

  const quizEvents = quizzes
    .map((quiz) => {
      const start = toIso(quiz.due_at || quiz.start_at)
      if (!start) return null
      const courseId = quiz.course_id

      return {
        id: `quiz-${quiz.id}`,
        type: 'quiz',
        title: `${buildCoursePrefix(quiz, courseMap)}${quiz.title}`,
        start,
        end: toIso(quiz.end_at) || addDefaultEnd(start),
        url: `${baseUrl}/courses/${courseId}?quiz=${quiz.id}`,
        extendedProps: {
          course_id: courseId,
          quiz_id: quiz.id,
          assignment_id: quiz.assignment_id || null,
          status: quiz.status,
          kind: 'quiz',
        },
      }
    })
    .filter(Boolean)

  return [...assignmentEvents, ...quizEvents].sort((a, b) => new Date(a.start) - new Date(b.start))
}

export function mapAssignmentsTableToCalendarEvents(assignments = [], options = {}) {
  const assignmentRows = assignments.filter((item) => (item.kind || 'assignment') !== 'quiz')
  const quizRows = assignments
    .filter((item) => item.kind === 'quiz')
    .map((item) => ({
      ...item,
      assignment_id: item.id,
      id: item.quiz_id || item.id,
    }))

  return mapLearningItemsToCalendarEvents({
    assignments: assignmentRows,
    quizzes: quizRows,
    ...options,
  })
}
