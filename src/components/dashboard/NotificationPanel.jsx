import React, { useEffect, useState, useRef } from 'react'
import { Notifications, Close, TaskAlt, WarningAmber, Info } from '@mui/icons-material'
import { useAuth } from '../../lib/AuthProvider'

/**
 * NotificationPanel - Dropdown notification center in the dashboard header
 * Features:
 * - Displays unread/read notifications
 * - Mark as read functionality
 * - Filter by type (assignments, quizzes, submissions, announcements, updates)
 * - Timestamps with relative time display
 * - Real-time updates via polling/subscriptions
 */
export default function NotificationPanel() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const panelRef = useRef(null)

  // Load notifications
  const loadNotifications = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const res = await fetch(
        `/api/notifications?user_id=${encodeURIComponent(user.id)}&limit=20`
      )
      if (!res.ok) throw new Error('Failed to fetch notifications')
      
      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
      
      // Count unread notifications
      const unread = Array.isArray(data) 
        ? data.filter(n => !n.read).length 
        : 0
      setUnreadCount(unread)
    } catch (err) {
      console.error('Error loading notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load on mount and when user changes
  useEffect(() => {
    loadNotifications()
  }, [user?.id])

  // Set up polling for real-time updates
  useEffect(() => {
    if (!user?.id) return
    
    const pollInterval = setInterval(loadNotifications, 30000) // Poll every 30s
    return () => clearInterval(pollInterval)
  }, [user?.id])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const markAsRead = async (notificationId, e) => {
    e.stopPropagation()
    
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId, read: true }),
      })
      
      if (!res.ok) throw new Error('Failed to mark as read')
      
      const updated = await res.json()
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? updated : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id)
      
      if (unreadIds.length === 0) return
      
      await Promise.all(
        unreadIds.map(id =>
          fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, read: true }),
          })
        )
      )
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation()
    
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId }),
      })
      
      if (!res.ok) throw new Error('Failed to delete notification')
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      const deleted = notifications.find(n => n.id === notificationId)
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <WarningAmber className="w-5 h-5 text-amber-500" />
      case 'quiz':
        return <Info className="w-5 h-5 text-blue-500" />
      case 'submission':
        return <TaskAlt className="w-5 h-5 text-green-500" />
      case 'announcement':
        return <Info className="w-5 h-5 text-purple-500" />
      case 'course_update':
        return <Info className="w-5 h-5 text-indigo-500" />
      default:
        return <Notifications className="w-5 h-5 text-muted" />
    }
  }

  // Get notification type label
  const getTypeLabel = (type) => {
    const labels = {
      assignment: 'New Assignment',
      quiz: 'Quiz Due Soon',
      submission: 'Submission Graded',
      announcement: 'Course Announcement',
      course_update: 'Course Update',
    }
    return labels[type] || 'Notification'
  }

  // Format relative time
  const getRelativeTime = (createdAt) => {
    const now = new Date()
    const notifTime = new Date(createdAt)
    const diffMs = now - notifTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return notifTime.toLocaleDateString()
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover-surface rounded-full transition-colors relative flex items-center justify-center"
        aria-label="Notifications"
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <Notifications className="w-6 h-6 text-muted" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Panel */}
          <div className="absolute right-0 top-12 w-96 max-h-96 bg-surface border border-token rounded-lg shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-token flex-shrink-0">
              <div className="flex items-center gap-2">
                <Notifications className="w-5 h-5 text-muted" />
                <h3 className="font-semibold text-main">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover-surface rounded transition-colors"
                aria-label="Close"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            {unreadCount > 0 && (
              <div className="px-4 py-2 border-b border-token flex-shrink-0">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-4 text-center text-muted text-sm">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Notifications className="w-12 h-12 text-muted mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-token">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id, { stopPropagation: () => {} })
                        }
                      }}
                      className={`p-4 transition-colors cursor-pointer hover:bg-surface-alt ${
                        notification.read ? 'bg-surface opacity-75' : 'bg-surface-alt'
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-main line-clamp-1">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                              )}
                            </div>
                          </div>

                          {notification.body && (
                            <p className="text-xs text-muted line-clamp-2 mb-2">
                              {notification.body}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted">
                              {getRelativeTime(notification.created_at)}
                            </span>
                            <div className="flex gap-1">
                              {!notification.read && (
                                <button
                                  onClick={(e) => markAsRead(notification.id, e)}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  Mark read
                                </button>
                              )}
                              <button
                                onClick={(e) => deleteNotification(notification.id, e)}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-token text-center flex-shrink-0">
                <a
                  href="/notifications"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all notifications
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
