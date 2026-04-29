# 📋 Notifications System - Quick Reference Card

## Status: ✅ READY TO USE

**UI:** Fully integrated and working  
**API:** Ready for notifications  
**Database:** Schema exists  
**What's left:** Add 3 lines of code to 3-4 API files

---

## 🎯 What Was Implemented

### UI Components (Already in Dashboard)
- 🔔 Notification bell icon in header with unread count badge
- 📋 Dropdown showing recent notifications (max 20)
- 🌐 Full notifications page at `/notifications`
- 🎨 Color-coded notification types
- ⏰ Relative timestamps ("5m ago")
- 🔄 Real-time updates + 30s polling fallback

### Notification Types
```
assignment        → 🆕 New Assignment
quiz              → 🧪 Quiz Due Soon
submission        → ✅ Submission Graded
announcement      → 📣 Course Announcement
course_update     → 📚 Course Update
general           → 🔔 General Notification
```

---

## ⚡ Quick Start - What You Need to Do

### Step 1: api/course-assignments.js
```javascript
// At top of file, add:
const { notifyAssignmentCreated } = require('./notification-events')

// In POST handler, after creating assignment, add:
try {
  await notifyAssignmentCreated(data.id, data, courseId)
} catch (e) {
  console.error('Notification failed:', e)
}
```

### Step 2: api/course-quizzes.js
```javascript
// At top:
const { notifyQuizCreated } = require('./notification-events')

// In POST handler:
try {
  await notifyQuizCreated(data.id, data, courseId)
} catch (e) {
  console.error('Notification failed:', e)
}
```

### Step 3: api/submissions.js
```javascript
// At top:
const { notifySubmissionGraded } = require('./notification-events')

// In PATCH handler (when grading):
try {
  await notifySubmissionGraded(data, assignment)
} catch (e) {
  console.error('Notification failed:', e)
}
```

### Step 4 (Optional): api/course-modules.js
```javascript
// At top:
const { notifyCourseUpdate } = require('./notification-events')

// In POST handler:
try {
  await notifyCourseUpdate(courseId, course.title, 'module')
} catch (e) {
  console.error('Notification failed:', e)
}
```

---

## 🧪 Test It

```bash
# 1. Create assignment as teacher
# 2. Check as student - notification appears
# 3. Click notification - marks as read
# 4. Unread count decreases
# ✅ Done!
```

---

## 📁 File Reference

### Frontend Components
| File | Purpose |
|------|---------|
| `src/components/dashboard/NotificationPanel.jsx` | Header dropdown |
| `src/components/Notifications.jsx` | Full page view |
| `src/components/notifications/notificationUtils.js` | Utility functions |
| `src/lib/NotificationContext.jsx` | Global state |

### Backend
| File | Purpose |
|------|---------|
| `api/notifications.js` | API endpoints |
| `api/notification-events.js` | Event handlers |

### Documentation
| File | Read for... |
|------|-------------|
| `NOTIFICATIONS-README.md` | Overview (2 min) |
| `NOTIFICATIONS-INTEGRATION.md` | Step-by-step (10 min) |
| `api/NOTIFICATIONS.md` | API details |
| `EXAMPLE-ASSIGNMENTS-WITH-NOTIFICATIONS.js` | Code example |

---

## 🔌 API Endpoints

```javascript
// GET notifications
fetch(`/api/notifications?user_id=${userId}&limit=20`)

// CREATE notification
fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipient_user_id: userId,
    course_id: courseId,
    type: 'assignment',
    title: 'New Assignment',
    body: 'Check assignment details'
  })
})

// MARK AS READ
fetch('/api/notifications', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: notificationId, read: true })
})

// DELETE
fetch('/api/notifications', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: notificationId })
})
```

---

## 🛠️ Utility Functions

```javascript
// Import from src/components/notifications/notificationUtils.js

import {
  // Constants
  NOTIFICATION_TYPES,
  
  // Creating notifications
  createAssignmentNotification,
  createQuizNotification,
  createSubmissionNotification,
  createAnnouncementNotification,
  createCourseUpdateNotification,
  
  // Formatting
  getNotificationTypeLabel,
  getNotificationTypeColor,
  getRelativeTime,
  getFormattedTime,
  
  // Filtering
  filterNotifications,
  
  // API
  fetchNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  deleteNotification,
  createNotification
} from '../notifications/notificationUtils'
```

---

## 🎣 Using Global Context

```javascript
import { useNotifications } from '../lib/NotificationContext'

function MyComponent() {
  const {
    notifications,      // array of notifications
    unreadCount,        // number
    loading,            // boolean
    markAsRead,         // async function
    markAsUnread,       // async function
    deleteNotification, // async function
    markAllAsRead,      // async function
    loadNotifications   // async function
  } = useNotifications()
  
  // Use them...
}
```

---

## 🚨 Troubleshooting

### Notifications not showing
```
✓ Check /api/notifications?user_id=<uuid> in browser
✓ Verify student is enrolled in course
✓ Check browser console for errors
✓ Refresh browser
```

### Real-time not working
```
✓ Still uses 30s polling fallback
✓ Check Supabase Realtime enabled
✓ Check network tab for WebSocket
```

### Automatic notifications not firing
```
✓ Did you add the import?
✓ Did you add the try/catch block?
✓ Check API logs for errors
✓ Verify course enrollment exists
```

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Read README | 2 min |
| Integrate 1 API file | 5 min |
| Integrate 3 API files | 15 min |
| Test integration | 5 min |
| **Total** | **~30 min** |

---

## ✅ Checklist

Before deploying:
- [ ] Added import to api/course-assignments.js
- [ ] Added try/catch to assignments POST handler
- [ ] Added import to api/course-quizzes.js
- [ ] Added try/catch to quizzes POST handler
- [ ] Added import to api/submissions.js
- [ ] Added try/catch to submissions PATCH handler
- [ ] Tested: Create assignment → see notification
- [ ] Tested: Mark as read → unread count changes
- [ ] Tested: Delete notification → removed from list
- [ ] Tested: Real-time updates in 2 browsers
- [ ] All console errors cleared
- [ ] Ready to deploy! 🚀

---

## 📞 Where to Find Answers

**"How do I use the UI?"**  
→ Try the bell icon in dashboard header

**"How do I integrate it?"**  
→ Read NOTIFICATIONS-INTEGRATION.md

**"What API endpoints exist?"**  
→ Check api/NOTIFICATIONS.md

**"Show me example code"**  
→ See EXAMPLE-ASSIGNMENTS-WITH-NOTIFICATIONS.js

**"What utilities are available?"**  
→ Check src/components/notifications/notificationUtils.js

**"Something's broken"**  
→ See Troubleshooting section above

---

## 🎉 You're All Set!

The notification system is **fully built and ready to go**. Just integrate it into your API files and you're done!

Questions? Check the documentation files - they have answers! 📚
