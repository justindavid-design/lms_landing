# Notifications System Documentation

## Overview

The LMS now includes a complete notifications system that automatically notifies students about:
- **New Assignments** - When a teacher creates a new assignment
- **Quizzes Due Soon** - When a quiz is created or available
- **Graded Submissions** - When a teacher grades a student's submission
- **Course Announcements** - Course-wide announcements and updates
- **Course Updates** - New modules, content, or course changes

## Features

### User Features
- ✅ Real-time notification dropdown in dashboard header
- ✅ Unread/read status tracking
- ✅ Mark notifications as read/unread
- ✅ Delete notifications
- ✅ Filter notifications by type
- ✅ View all notifications page with full filtering
- ✅ Relative timestamps ("5m ago", "2h ago", etc.)
- ✅ Unread count badge on bell icon
- ✅ Real-time updates via Supabase subscriptions with polling fallback

### Admin/Teacher Features
- ✅ Broadcast notifications to all course students
- ✅ Create custom announcements/course updates
- ✅ Automatic notifications for assignments and quizzes
- ✅ Automatic notifications for submission grades

## UI Components

### NotificationPanel.jsx
- **Location**: `src/components/dashboard/NotificationPanel.jsx`
- **Purpose**: Dropdown notification center in the dashboard header
- **Features**:
  - Shows unread count badge
  - Lists recent notifications with filtering
  - Quick actions: mark read, delete
  - Link to full notifications page
  - Click-to-read functionality

### Notifications.jsx
- **Location**: `src/components/Notifications.jsx`
- **Purpose**: Full-page notification management
- **Features**:
  - View all notifications
  - Filter by type (Assignments, Quizzes, Graded, Announcements, Updates)
  - Filter by unread only
  - Mark all as read
  - Color-coded notification types
  - Detailed information with body text and timestamps

## API Endpoints

### GET /api/notifications
Fetch notifications for a user

**Query Parameters:**
- `user_id` (required): UUID of the user
- `limit` (optional): Max notifications to return (default: 25)
- `course_id` (optional): Filter by course

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "course_id": "uuid or null",
    "type": "assignment|quiz|submission|announcement|course_update|general",
    "title": "string",
    "body": "string or null",
    "read": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### POST /api/notifications
Create a new notification (admin/teacher only)

**Body:**
```json
{
  "recipient_user_id": "uuid or null (broadcast if null)",
  "course_id": "uuid or null",
  "type": "assignment|quiz|submission|announcement|course_update|general",
  "title": "string",
  "body": "string or null"
}
```

### PATCH /api/notifications
Mark notification as read/unread

**Body:**
```json
{
  "id": "uuid",
  "read": true|false
}
```

### DELETE /api/notifications
Delete a notification

**Body:**
```json
{
  "id": "uuid"
}
```

## Utility Functions

### notificationUtils.js
- **Location**: `src/components/notifications/notificationUtils.js`

**Available Functions:**

#### Notification Creation Helpers
```javascript
import { 
  createAssignmentNotification,
  createQuizNotification,
  createSubmissionNotification,
  createAnnouncementNotification,
  createCourseUpdateNotification
} from '../notifications/notificationUtils'

// Usage in backend when creating assignments:
const payload = createAssignmentNotification(assignment, courseId)
const notification = await createNotification(payload)
```

#### Utility Functions
```javascript
import {
  getNotificationTypeLabel,      // Get display name ("New Assignment")
  getNotificationTypeColor,      // Get Tailwind color classes
  getRelativeTime,               // Format as "5m ago"
  getFormattedTime,              // Format as "Jan 15, 10:30 AM"
  filterNotifications,           // Filter by type, read status, course
  fetchNotifications,            // Fetch from API
  markNotificationAsRead,        // Mark single as read
  deleteNotification,            // Delete notification
  createNotification             // Create custom notification
} from '../notifications/notificationUtils'
```

## Automatic Notifications

### notification-events.js
- **Location**: `api/notification-events.js`
- **Purpose**: Automatic notification dispatch for LMS events

**Available Functions:**

```javascript
const {
  notifyAssignmentCreated,      // Call when assignment is created
  notifyQuizCreated,            // Call when quiz is created
  notifySubmissionGraded,       // Call when submission is graded
  notifyCourseUpdate,           // Call when course content is added
  notifyAnnouncement,           // Call when announcement is posted
  notifyUpcomingDeadline,       // Call for deadline reminders
  notifyAllCourseStudents       // Broadcast to all course students
} from './notification-events'
```

## Integration Guide

### For Assignment Creation

In `api/course-assignments.js`:

```javascript
const { notifyAssignmentCreated } = require('./notification-events')

if (req.method === 'POST') {
  // ... create assignment ...
  
  // After successful creation, notify students
  await notifyAssignmentCreated(data.id, data, courseId)
  
  return res.status(201).json(data)
}
```

### For Quiz Creation

In `api/course-quizzes.js`:

```javascript
const { notifyQuizCreated } = require('./notification-events')

if (req.method === 'POST') {
  // ... create quiz ...
  
  // Notify students
  await notifyQuizCreated(data.id, data, courseId)
  
  return res.status(201).json(data)
}
```

### For Submission Grading

In `api/submissions.js`:

```javascript
const { notifySubmissionGraded } = require('./notification-events')

if (req.method === 'PATCH' && body.score !== undefined) {
  // ... update submission with grade ...
  
  // Notify student
  await notifySubmissionGraded(data, assignment)
  
  return res.status(200).json(data)
}
```

### For Course Updates

In `api/course-modules.js`:

```javascript
const { notifyCourseUpdate } = require('./notification-events')

if (req.method === 'POST') {
  // ... create module ...
  
  // Notify course students
  await notifyCourseUpdate(courseId, courseName, 'module')
  
  return res.status(201).json(data)
}
```

## Database Schema

The notifications table structure:

```sql
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  type text default 'general',
  title text not null,
  body text,
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_course_id on notifications(course_id);
```

## Real-Time Updates

The notification system uses:

1. **Primary**: Supabase Realtime subscriptions for instant updates
2. **Fallback**: 30-second polling if subscriptions unavailable
3. **Manual Refresh**: Users can manually load latest notifications

```javascript
// NotificationPanel automatically:
// - Subscribes to realtime notifications on mount
// - Falls back to polling if needed
// - Handles connection errors gracefully
// - Cleans up subscriptions on unmount
```

## Notification Types & Colors

| Type | Display Name | Color | Icon |
|------|--------------|-------|------|
| `assignment` | New Assignment | Amber | AlertCircle |
| `quiz` | Quiz Due Soon | Blue | Info |
| `submission` | Submission Graded | Green | CheckCircle |
| `announcement` | Course Announcement | Purple | Bell |
| `course_update` | Course Update | Indigo | Info |
| `general` | Notification | Gray | Bell |

## Best Practices

### For Teachers/Admins

1. **Timing**: Create assignments/quizzes before students need them
2. **Descriptions**: Include clear, concise descriptions in assignments
3. **Announcements**: Use course announcements for important updates
4. **Feedback**: Always provide feedback when grading submissions

### For Students

1. **Check Often**: Review the notification dropdown regularly
2. **Mark Read**: Mark notifications as read when actioned
3. **Set Preferences**: Future: Add notification preferences/settings
4. **Archive**: Delete old notifications to keep inbox clean

## Future Enhancements

- [ ] Email notifications for important events
- [ ] Notification preferences/opt-out per type
- [ ] Notification history and search
- [ ] Grouped notifications by course
- [ ] Custom notification sounds
- [ ] Push notifications for mobile
- [ ] Desktop notifications via browser API
- [ ] Digest notifications (daily/weekly summaries)

## Troubleshooting

### Notifications Not Appearing

1. Check user is enrolled in course
2. Verify notification API endpoint is working: `GET /api/notifications?user_id=<uuid>`
3. Check browser console for errors
4. Verify Supabase connection in `src/lib/supabaseClient.js`

### Real-Time Not Working

1. Check Supabase Realtime is enabled in dashboard
2. Check for CORS or network errors in browser console
3. Fallback to polling (30-second) should still work
4. Try manually refreshing page

### Notifications Stuck as Unread

1. Check network connection when marking as read
2. Verify API response status is 200
3. Check browser console for fetch errors
4. Try clearing browser cache

## Support

For issues or questions about the notification system:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Check Supabase logs for backend issues
4. File an issue with reproduction steps
