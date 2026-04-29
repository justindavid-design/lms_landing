# Notifications System Integration Guide

## Quick Start

The notification system is **fully implemented** and ready to use. The UI components are already in place:

### ✅ Already Done
- [x] NotificationPanel dropdown in dashboard header (shows unread count)
- [x] Full notifications page at `/notifications`
- [x] Notification utility functions and context
- [x] Real-time + polling infrastructure
- [x] Read/unread status management
- [x] Filtering by type and status
- [x] Delete functionality
- [x] Database schema exists

### 🔧 What You Need to Do

To **enable automatic notifications** for assignments, quizzes, and submissions, you need to integrate the notification event handlers into your existing API files. Here's how:

---

## Step 1: Update course-assignments.js

Add automatic notifications when assignments are created.

**File**: `api/course-assignments.js`

```javascript
// Add at the top with other imports
const { notifyAssignmentCreated } = require('./notification-events')

// In your POST handler, after creating the assignment:
if (req.method === 'POST') {
  // ... existing assignment creation code ...
  
  const { data, error } = await db
    .from('assignments')
    .insert([assignmentData])
    .select()
    .single()

  if (error) throw error
  
  // 👇 ADD THIS - Notify all students in the course
  try {
    await notifyAssignmentCreated(data.id, data, courseId)
  } catch (notifyErr) {
    console.error('Failed to send assignment notification:', notifyErr)
    // Don't fail the request if notification fails
  }

  return res.status(201).json(data)
}
```

---

## Step 2: Update course-quizzes.js

Add automatic notifications when quizzes are created.

**File**: `api/course-quizzes.js`

```javascript
// Add at the top
const { notifyQuizCreated } = require('./notification-events')

// In your POST handler:
if (req.method === 'POST') {
  // ... existing quiz creation code ...
  
  const { data, error } = await db
    .from('quizzes')
    .insert([quizData])
    .select()
    .single()

  if (error) throw error
  
  // 👇 ADD THIS - Notify all students
  try {
    await notifyQuizCreated(data.id, data, courseId)
  } catch (notifyErr) {
    console.error('Failed to send quiz notification:', notifyErr)
  }

  return res.status(201).json(data)
}
```

---

## Step 3: Update submissions.js

Add automatic notifications when submissions are graded.

**File**: `api/submissions.js`

```javascript
// Add at the top
const { notifySubmissionGraded } = require('./notification-events')

// In your PATCH handler where you update grade:
if (req.method === 'PATCH') {
  const body = req.body || {}
  
  // ... existing update code ...
  
  // When updating with a score/grade:
  if (body.score !== undefined) {
    const { data: updatedSubmission, error } = await db
      .from('submissions')
      .update({ score: body.score, feedback: body.feedback, graded_at: new Date() })
      .eq('id', submissionId)
      .select('*')
      .single()

    if (error) throw error
    
    // 👇 ADD THIS - Notify student their work was graded
    try {
      const { data: assignment } = await db
        .from('assignments')
        .select('*')
        .eq('id', updatedSubmission.assignment_id)
        .single()
      
      if (assignment) {
        await notifySubmissionGraded(updatedSubmission, assignment)
      }
    } catch (notifyErr) {
      console.error('Failed to send grading notification:', notifyErr)
    }

    return res.status(200).json(updatedSubmission)
  }
}
```

---

## Step 4: (Optional) Update course-modules.js

Add notifications when new modules are added to a course.

**File**: `api/course-modules.js`

```javascript
// Add at the top
const { notifyCourseUpdate } = require('./notification-events')

// In your POST handler:
if (req.method === 'POST') {
  // ... existing module creation code ...
  
  const { data, error } = await db
    .from('course_modules')
    .insert([moduleData])
    .select()
    .single()

  if (error) throw error
  
  // 👇 ADD THIS - Notify course students
  try {
    const { data: course } = await db
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single()
    
    if (course) {
      await notifyCourseUpdate(courseId, course.title, 'module')
    }
  } catch (notifyErr) {
    console.error('Failed to send course update notification:', notifyErr)
  }

  return res.status(201).json(data)
}
```

---

## Step 5: (Optional) Create Custom Notifications

For course announcements or special notifications, use the general notification API:

**From any backend code:**

```javascript
const { createNotification } = require('./_lms')

// Broadcast to a specific student
await createNotification({
  user_id: studentId,
  course_id: courseId,
  type: 'announcement',
  title: 'Important Announcement',
  body: 'Check the course for important updates.'
})

// Broadcast to all students (null user_id for course broadcast)
await createNotification({
  user_id: null,
  course_id: courseId,
  type: 'announcement',
  title: 'Course Announcement',
  body: 'A new announcement has been posted.'
})
```

---

## Testing Integration

### 1. Test Assignment Notifications
- Create a new assignment as a teacher
- Check as a student - notification should appear in dropdown
- Click notification - it should mark as read
- Check unread count updates

### 2. Test Quiz Notifications
- Create a new quiz as a teacher
- Check as a student - notification appears
- Click "Mark all as read" - all should update

### 3. Test Submission Grading
- Submit an assignment as a student
- Grade it as a teacher
- Check student's inbox - grading notification appears

### 4. Test Real-Time Updates
- Open notifications in 2 browser windows
- Mark as read in one window
- Should update in the other (within 30 seconds)

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│  Dashboard Header (dashboard.jsx)   │
│  └── NotificationPanel.jsx          │
│      └── Shows dropdown + unread    │
│          count badge               │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  NotificationContext (Global State) │
│  ├── Manages all notifications      │
│  ├── Realtime + polling             │
│  └── Mark read/delete functions     │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  API Layer                          │
│  ├── GET /api/notifications         │
│  ├── POST /api/notifications        │
│  ├── PATCH /api/notifications       │
│  └── DELETE /api/notifications      │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  Database (notifications table)     │
│  ├── user_id (recipient)            │
│  ├── course_id (context)            │
│  ├── type (assignment/quiz/etc)     │
│  ├── title & body (content)         │
│  ├── read (status)                  │
│  └── created_at (timestamp)         │
└─────────────────────────────────────┘
```

---

## API Reference (Backend)

### GET /api/notifications
```javascript
// Returns notifications for a user
const response = await fetch(
  `/api/notifications?user_id=${userId}&limit=20`
)
const notifications = await response.json()
```

### POST /api/notifications
```javascript
// Create a notification
await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipient_user_id: studentId,  // or null for broadcast
    course_id: courseId,
    type: 'assignment',
    title: 'New Assignment',
    body: 'Check assignment details'
  })
})
```

### PATCH /api/notifications
```javascript
// Mark as read/unread
await fetch('/api/notifications', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: notificationId,
    read: true  // or false to mark unread
  })
})
```

### DELETE /api/notifications
```javascript
// Delete a notification
await fetch('/api/notifications', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: notificationId })
})
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/components/dashboard/NotificationPanel.jsx` | Header dropdown UI |
| `src/components/Notifications.jsx` | Full page view |
| `src/components/notifications/notificationUtils.js` | Utility functions |
| `src/lib/NotificationContext.jsx` | Global state management |
| `api/notifications.js` | API endpoint handler |
| `api/notification-events.js` | Event handlers (integrate into other APIs) |
| `api/NOTIFICATIONS.md` | Complete documentation |

---

## Troubleshooting

### Notifications not showing
1. Check browser console for errors
2. Verify user is enrolled in course
3. Check `/api/notifications?user_id=<uuid>` endpoint directly
4. Clear browser cache

### Real-time not working
1. Check Supabase Realtime is enabled
2. Fall back to 30-second polling should work
3. Check network tab for WebSocket connections

### Integration issues
1. Ensure you're awaiting the notification function with try/catch
2. Don't let notification failures block the main operation
3. Check API logs for errors

---

## Next Steps

1. **Integrate** into assignment/quiz/submission files (Steps 1-3 above)
2. **Test** with sample data
3. **Deploy** to production
4. **Monitor** notification delivery

The system is production-ready and handles errors gracefully!
