import React, { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/apiClient'

export default function NotificationCenter({ userId, isOpen, onClose }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await apiFetch(`/api/notifications?userId=${userId}`)
      setNotifications(data || [])
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await apiFetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' })
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await apiFetch(`/api/notifications/${notificationId}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiFetch(`/api/notifications/mark-all-read`, { method: 'PATCH' })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment_posted':
        return <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      case 'due_soon':
        return <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      case 'grade_posted':
        return <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      case 'feedback':
        return <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      default:
        return <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'assignment_posted': return 'bg-green-50 border-green-200'
      case 'due_soon': return 'bg-amber-50 border-amber-200'
      case 'grade_posted': return 'bg-blue-50 border-blue-200'
      case 'feedback': return 'bg-purple-50 border-purple-200'
      default: return 'bg-slate-50 border-slate-200'
    }
  }

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'assignment_posted':
        return `New assignment: ${notification.metadata?.title || 'Untitled'}`
      case 'due_soon':
        return `${notification.metadata?.title || 'Assignment'} due in ${notification.metadata?.hours || 24} hours`
      case 'grade_posted':
        return `Grade posted for ${notification.metadata?.title || 'assignment'}: ${notification.metadata?.score || 'N/A'}`
      case 'feedback':
        return `Teacher feedback on ${notification.metadata?.title || 'your submission'}`
      default:
        return notification.content
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Just now'
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filtered = filter === 'all' 
    ? notifications 
    : filter === 'unread'
      ? notifications.filter(n => !n.is_read)
      : notifications

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-end">
      <div className="w-96 h-screen bg-white shadow-2xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 font-semibold text-xl"
            >
              ✕
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Unread {unreadCount > 0 && <span className="ml-1 font-bold">({unreadCount})</span>}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-600 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600 font-medium">No notifications</p>
              <p className="text-xs text-slate-500 mt-2">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filtered.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors ${notification.is_read ? 'bg-white' : 'bg-blue-50'} hover:bg-slate-50`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      getNotificationColor(notification.type)
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.is_read ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-slate-400 hover:text-slate-600 font-medium"
                    >
                      ✕
                    </button>
                  </div>

                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
