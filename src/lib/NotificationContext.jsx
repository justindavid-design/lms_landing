import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthProvider'
import supabase from './supabaseClient'

/**
 * NotificationContext - Global notification state management
 * Provides notification data and functions to all components
 */
const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    try {
      setLoading(true)
      const res = await fetch(
        `/api/notifications?user_id=${encodeURIComponent(user.id)}&limit=50`
      )
      
      if (!res.ok) throw new Error('Failed to load notifications')
      
      const data = await res.json()
      const notifArray = Array.isArray(data) ? data : []
      
      setNotifications(notifArray)
      setUnreadCount(notifArray.filter(n => !n.read).length)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error loading notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Initial load
  useEffect(() => {
    loadNotifications()
  }, [user?.id, loadNotifications])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return

    let subscription = null
    let pollInterval = null

    try {
      if (supabase && typeof supabase.channel === 'function') {
        subscription = supabase
          .channel('public:notifications')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            payload => {
              if (payload.eventType === 'INSERT') {
                setNotifications(prev => [payload.new, ...prev])
                if (!payload.new.read) {
                  setUnreadCount(prev => prev + 1)
                }
              } else if (payload.eventType === 'UPDATE') {
                setNotifications(prev =>
                  prev.map(n => (n.id === payload.new.id ? payload.new : n))
                )
                // Update unread count
                const oldUnread = notifications.find(n => n.id === payload.new.id)?.read
                const newUnread = payload.new.read
                if (!oldUnread && newUnread) {
                  setUnreadCount(prev => Math.max(0, prev - 1))
                } else if (oldUnread && !newUnread) {
                  setUnreadCount(prev => prev + 1)
                }
              } else if (payload.eventType === 'DELETE') {
                const deleted = notifications.find(n => n.id === payload.old.id)
                setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
                if (deleted && !deleted.read) {
                  setUnreadCount(prev => Math.max(0, prev - 1))
                }
              }
            }
          )
          .subscribe()
      }
    } catch (e) {
      console.error('Error setting up realtime subscription:', e)
    }

    // Fallback polling every 30 seconds
    pollInterval = setInterval(loadNotifications, 30000)

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (e) {}
      }
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [user?.id, notifications, loadNotifications])

  const markAsRead = useCallback(async (notificationId) => {
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

      return updated
    } catch (err) {
      console.error('Error marking notification as read:', err)
      throw err
    }
  }, [])

  const markAsUnread = useCallback(async (notificationId) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId, read: false }),
      })

      if (!res.ok) throw new Error('Failed to mark as unread')

      const updated = await res.json()
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? updated : n))
      )
      setUnreadCount(prev => prev + 1)

      return updated
    } catch (err) {
      console.error('Error marking notification as unread:', err)
      throw err
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId }),
      })

      if (!res.ok) throw new Error('Failed to delete notification')

      const deleted = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
      throw err
    }
  }, [notifications])

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter(n => !n.read)
      .map(n => n.id)

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

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all as read:', err)
      throw err
    }
  }, [notifications])

  const value = {
    notifications,
    unreadCount,
    loading,
    lastUpdated,
    loadNotifications,
    markAsRead,
    markAsUnread,
    deleteNotification,
    markAllAsRead,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

/**
 * Hook to use notification context
 */
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export default NotificationContext
