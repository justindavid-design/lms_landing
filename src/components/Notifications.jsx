import React, { useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'
import Loading from './Loading'
import { useAuth } from '../lib/AuthProvider'
import { 
  Notifications as NotificationsIcon, 
  TaskAlt, 
  WarningAmber, 
  Info, 
  Delete, 
  DoneAll,
  FilterList 
} from '@mui/icons-material'
import {
  NOTIFICATION_TYPES,
  getNotificationTypeLabel,
  getRelativeTime,
  getNotificationTypeColor,
  filterNotifications,
} from './notifications/notificationUtils'

/**
 * Notifications - Full notification management page
 * Displays all notifications with filtering, marking read/unread, and deletion
 */
export default function Notifications() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState(null)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [error, setError] = useState('')

  // Load notifications
  const loadNotifications = async () => {
    if (!user?.id) {
      setItems([])
      setLoading(false)
      return
    }

    try {
      setError('')
      const res = await fetch(`/api/notifications?user_id=${encodeURIComponent(user.id)}&limit=100`)
      if (!res.ok) throw new Error('Failed to load notifications')
      
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading notifications:', err)
      setError(err.message || 'Failed to load notifications')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user?.id])

  // Set up real-time updates
  useEffect(() => {
    if (!user?.id) return
    
    let subscription = null
    try {
      if (supabase && typeof supabase.channel === 'function') {
        // Supabase v2 realtime
        subscription = supabase
          .channel('public:notifications')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'notifications' },
            payload => {
              if (payload.eventType === 'INSERT') {
                setItems(prev => [payload.new, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                setItems(prev =>
                  prev.map(n => (n.id === payload.new.id ? payload.new : n))
                )
              } else if (payload.eventType === 'DELETE') {
                setItems(prev => prev.filter(n => n.id !== payload.old.id))
              }
            }
          )
          .subscribe()
      }
    } catch (e) {
      console.error('Error setting up real-time subscriptions:', e)
      // Fallback to polling if subscriptions fail
      const pollInterval = setInterval(loadNotifications, 30000)
      subscription = { unsubscribe: () => clearInterval(pollInterval) }
    }

    return () => {
      try {
        subscription?.unsubscribe()
      } catch (e) {}
    }
  }, [user?.id])

  const markAsRead = async (id) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      })
      if (!res.ok) throw new Error('Failed to mark as read')
      
      const data = await res.json()
      setItems(prev => prev.map(n => (n.id === data.id ? data : n)))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const markAsUnread = async (id) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: false }),
      })
      if (!res.ok) throw new Error('Failed to mark as unread')
      
      const data = await res.json()
      setItems(prev => prev.map(n => (n.id === data.id ? data : n)))
    } catch (err) {
      console.error('Error marking as unread:', err)
    }
  }

  const deleteNotification = async (id) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete notification')
      
      setItems(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = items.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) return

    try {
      await Promise.all(
        unreadIds.map(id =>
          fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, read: true }),
          })
        )
      )
      setItems(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.ASSIGNMENT:
        return <WarningAmber className="w-5 h-5 text-amber-500" />
      case NOTIFICATION_TYPES.QUIZ:
        return <Info className="w-5 h-5 text-blue-500" />
      case NOTIFICATION_TYPES.SUBMISSION:
        return <TaskAlt className="w-5 h-5 text-green-500" />
      case NOTIFICATION_TYPES.ANNOUNCEMENT:
        return <NotificationsIcon className="w-5 h-5 text-purple-500" />
      case NOTIFICATION_TYPES.COURSE_UPDATE:
        return <Info className="w-5 h-5 text-indigo-500" />
      default:
        return <NotificationsIcon className="w-5 h-5 text-muted" />
    }
  }

  // Filter notifications
  const displayedNotifications = filterNotifications(items, {
    unreadOnly: showUnreadOnly,
    type: filterType,
  })

  const unreadCount = items.filter(n => !n.read).length

  if (loading) {
    return (
      <Loading message="Loading notifications…">
        <div className="p-4 bg-surface rounded-lg border border-token shadow-sm animate-pulse" aria-hidden>
          <div className="h-4 bg-token-muted rounded w-32 mb-3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-token-muted rounded" />
            ))}
          </div>
        </div>
      </Loading>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-main">Notifications</h1>
          <p className="text-sm text-muted mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <DoneAll className="w-5 h-5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="bg-surface rounded-lg border border-token p-4 flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <FilterList className="w-5 h-5 text-muted" />
          <span className="text-sm font-medium text-muted">Filter:</span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-main">Unread only</span>
        </label>

        <div className="flex gap-2 flex-wrap">
          {[
            { value: null, label: 'All' },
            { value: NOTIFICATION_TYPES.ASSIGNMENT, label: 'Assignments' },
            { value: NOTIFICATION_TYPES.QUIZ, label: 'Quizzes' },
            { value: NOTIFICATION_TYPES.SUBMISSION, label: 'Graded' },
            { value: NOTIFICATION_TYPES.ANNOUNCEMENT, label: 'Announcements' },
            { value: NOTIFICATION_TYPES.COURSE_UPDATE, label: 'Updates' },
          ].map(({ value, label }) => (
            <button
              key={value || 'all'}
              onClick={() => setFilterType(value)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterType === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-surface-alt text-main hover:bg-surface-alt border border-token'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-surface rounded-lg border border-red-500 p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-2">
        {displayedNotifications.length === 0 ? (
          <div className="bg-surface rounded-lg border border-token p-8 text-center">
            <NotificationsIcon className="w-12 h-12 text-muted mx-auto mb-3 opacity-30" />
            <p className="text-muted text-sm">
              {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
            </p>
          </div>
        ) : (
          displayedNotifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-surface rounded-lg border transition-colors p-4 ${
                notification.read
                  ? 'border-token opacity-75 hover:opacity-100'
                  : 'border-blue-500 bg-blue-100 dark:bg-blue-900 dark:border-blue-600'
              }`}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-main line-clamp-1">
                        {notification.title}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${getNotificationTypeColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationTypeLabel(notification.type)}
                      </span>
                      {!notification.read && (
                        <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {notification.body && (
                    <p className="text-sm text-muted mb-2 line-clamp-3">
                      {notification.body}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">
                      {getRelativeTime(notification.created_at)}
                    </span>
                    <div className="flex gap-2">
                      {!notification.read ? (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          title="Mark as read"
                        >
                          Mark read
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsUnread(notification.id)}
                          className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                          title="Mark as unread"
                        >
                          Mark unread
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        title="Delete notification"
                      >
                        <Delete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
