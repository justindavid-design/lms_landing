# Student Progress Tracking System

## Overview

This LMS now includes comprehensive student progress tracking that allows both students to view their own progress and teachers to track individual student performance within a course.

## Features

### For Students
- View personal course progress percentage
- See completion status for all assignments and quizzes
- View individual scores and grades
- Identify pending and overdue work
- Track submission status (not started, submitted, graded, late)

### For Teachers
- View progress for any student in their course
- Select and compare student performance
- See detailed assignment and quiz scores
- Monitor submission patterns
- Identify students with pending or overdue work

## Architecture

### API Endpoint: `/api/progress`

**Method:** GET

**Query Parameters:**
- `course_id` (required): UUID of the course
- `student_id` (optional): UUID of the student (for teachers viewing other students; if omitted, returns logged-in user's progress)

**Response Structure:**
```json
{
  "course_id": "uuid",
  "student_id": "uuid",
  "completed_assignments": 5,
  "total_assignments": 10,
  "completed_quizzes": 3,
  "total_quizzes": 5,
  "pending_assignments": 2,
  "overdue_assignments": 1,
  "course_completion_percentage": 42,
  "assignment_scores": [
    {
      "id": "uuid",
      "title": "Assignment 1",
      "score": 85,
      "status": "graded",
      "submitted_at": "2024-01-15T10:30:00Z",
      "graded_at": "2024-01-16T14:20:00Z"
    }
  ],
  "quiz_scores": [
    {
      "id": "uuid",
      "title": "Quiz 1",
      "score": 92,
      "status": "graded",
      "submitted_at": "2024-01-10T09:15:00Z",
      "graded_at": "2024-01-10T09:45:00Z"
    }
  ],
  "last_activity": "2024-01-20T15:30:00Z"
}
```

### Frontend Components

#### 1. **StudentProgress.jsx**
Main component for displaying student progress.

**Location:** `src/components/dashboard/StudentProgress.jsx`

**Props:**
- `courseId` (string, required): The course UUID
- `studentId` (string, optional): For teachers viewing other students' progress

**Features:**
- Progress bar showing completion percentage
- Metrics grid with assignments, quizzes, pending, and overdue counts
- Detailed breakdown tables for assignments and quizzes
- Real-time data loading with error handling

**Usage:**
```jsx
import StudentProgress from './StudentProgress'

<StudentProgress courseId={courseId} />
```

#### 2. **TeacherStudentProgress.jsx**
Teacher interface for selecting and viewing student progress.

**Location:** `src/components/dashboard/TeacherStudentProgress.jsx`

**Props:**
- `courseId` (string, required): The course UUID

**Features:**
- Student selector dropdown
- Integrates StudentProgress component
- Displays student list from course enrollments

**Usage:**
```jsx
import TeacherStudentProgress from './TeacherStudentProgress'

<TeacherStudentProgress courseId={courseId} />
```

#### 3. **CourseTabs.jsx**
Updated to include a "Progress" tab.

**New Tab:**
- ID: `progress`
- Label: "Progress"
- Icon: TrendingUp

### Integration Points

#### CourseDetails.jsx
- Added imports for `StudentProgress` and `TeacherStudentProgress`
- Added conditional rendering based on `activeTab === 'progress'`
- Shows appropriate component based on user role:
  - Students see `<StudentProgress />`
  - Teachers see `<TeacherStudentProgress />`

#### CourseTabs.jsx
- Added `progress` tab to the TABS array
- Imported `TrendingUp` icon from Material-UI

#### api-server.js
- Added route handler for GET `/api/progress`
- Integrated `progress.js` module

## Usage Flows

### Student Viewing Own Progress
1. Navigate to a course
2. Click the "Progress" tab
3. View personal progress metrics, completion percentage, and detailed breakdown

### Teacher Viewing Student Progress
1. Navigate to a course
2. Click the "Progress" tab
3. Select a student from the dropdown
4. View student's progress metrics and detailed breakdown

## Calculation Methods

### Course Completion Percentage
```
(completed_assignments + completed_quizzes) / (total_assignments + total_quizzes) * 100
```

### Completed Work
- Assignments: status is 'submitted', 'graded', or 'late'
- Quizzes: status is 'submitted', 'graded', or 'late'

### Pending Work
- Assignments not in completed statuses OR have no submission

### Overdue Work
- Assignment due_at is in the past
- AND has no completed submission

## Status Values

- `not_started`: No submission yet
- `assigned`: Assignment created but not started
- `submitted`: Work submitted but not graded
- `late`: Submitted after due date
- `graded`: Graded by instructor

## Data Flow

1. **Student/Teacher accesses course** → Course Details page loads
2. **User clicks Progress tab** → `activeTab` state changes to 'progress'
3. **Component mounts** → API call to `/api/progress` with course_id (and student_id if teacher)
4. **API processes**:
   - Validates user has access to course
   - Queries all assignments and quizzes for course
   - Fetches submissions for target student
   - Calculates metrics
   - Returns compiled progress data
5. **Component displays** → Progress metrics and breakdowns render

## Error Handling

- Missing course_id returns 400 Bad Request
- Unauthorized access (students accessing other students' data) returns 403 Forbidden
- Failed database queries return 500 Internal Server Error
- Network errors display user-friendly message in UI

## Theme Support

All progress components use theme-aware styling:
- CSS custom properties for colors: `--app-bg`, `--text-main`, `--border-color`, `--text-muted`
- Dark mode support via `.dark` class
- Responsive design for mobile and desktop

## Future Enhancements

- Export progress reports (PDF/CSV)
- Progress graphs and charts
- Trend analysis over time
- Custom score calculations
- Progress notifications/alerts
- Weighted grading
- Class-wide analytics dashboard
- Parent/guardian progress access

## Testing

To test the feature:

1. **Student View:**
   - Log in as a student
   - Go to any enrolled course
   - Click "Progress" tab
   - Verify metrics match actual submissions

2. **Teacher View:**
   - Log in as a teacher
   - Go to your course
   - Click "Progress" tab
   - Select a student from dropdown
   - Verify student metrics display correctly

3. **Edge Cases:**
   - Course with no assignments/quizzes (should show 0%)
   - Student with no submissions (should show 0 completed)
   - All work completed (should show 100%)
   - Overdue work (should appear in overdue count)
