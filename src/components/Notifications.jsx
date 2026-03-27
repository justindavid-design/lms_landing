import React, { useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'
import Loading from './Loading'
import { useAuth } from '../lib/AuthProvider'

export default function Notifications(){
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    let mounted = true

    async function load(){
      if (!user?.id) {
        if (mounted) {
          setItems([])
          setLoading(false)
        }
        return
      }
      try{
        const res = await fetch(`/api/notifications?user_id=${encodeURIComponent(user.id)}`)
        const data = await res.json()
        if(!mounted) return
        setItems(data)
      }catch(err){
        console.error(err)
      }finally{ mounted && setLoading(false) }
    }

    load()

    // try Supabase realtime subscription if available
    let subscription = null
    try{
      if(supabase && typeof supabase.channel === 'function'){
        // v2 realtime
        subscription = supabase.channel('public:notifications')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, payload => {
            setItems(prev => [payload.new, ...prev])
          }).subscribe()
      }else if(supabase && supabase.from && typeof supabase.from === 'function'){
        const sub = supabase.from('notifications').on('INSERT', payload => {
          setItems(prev => [payload.new, ...prev])
        }).subscribe?.() || { unsubscribe: () => {} }
        subscription = sub
      }else{
        // fallback to polling
        const id = setInterval(load, 10000)
        subscription = { unsubscribe: () => clearInterval(id) }
      }
    }catch(e){
      // fallback to polling
      const id = setInterval(load, 10000)
      subscription = { unsubscribe: () => clearInterval(id) }
    }

    return () => { mounted = false; try{ subscription?.unsubscribe() }catch(e){} }
  }, [user?.id])

  const create = async () => {
    if(!newTitle || !user?.id) return
    try{
      const res = await fetch('/api/notifications', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ title: newTitle, actor_user_id: user.id, recipient_user_id: user.id, user_id: user.id }) })
      const data = await res.json()
      setItems(prev => [data, ...prev])
      setNewTitle('')
    }catch(err){ console.error(err) }
  }

  const markRead = async (id) => {
    try{
      const res = await fetch('/api/notifications', { method: 'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, read: true, user_id: user?.id }) })
      const data = await res.json()
      setItems(prev => prev.map(i => i.id === data.id ? data : i))
    }catch(err){ console.error(err) }
  }

  if(loading) return (
    <Loading message="Loading notifications…">
      <div className="p-4 bg-surface rounded-xl-card border border-token shadow-sm animate-pulse" aria-hidden>
        <div className="h-4 bg-token-muted rounded w-32 mb-3"></div>
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-12 bg-token-muted rounded" />
          ))}
        </div>
        <div className="mt-3 h-9 bg-token-muted rounded w-full"></div>
      </div>
    </Loading>
  )

  return (
    <div className="bg-surface rounded-xl-card p-4 border border-token shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Notifications</div>
        <div className="text-xs text-muted">Real-time</div>
      </div>

      <div className="space-y-2 max-h-64 overflow-auto mb-3">
        {items.length === 0 && <div className="text-sm text-muted">No notifications</div>}
        {items.map(item => (
          <div key={item.id} className={`p-2 border border-token rounded-md ${item.read ? 'bg-surface-alt' : 'bg-surface'}`}>
            <div className="flex items-center justify-between">
              <div className="font-medium">{item.title}</div>
              {!item.read && <button onClick={() => markRead(item.id)} className="text-xs text-blue-600">Mark read</button>}
            </div>
            {item.body && <div className="text-sm text-muted">{item.body}</div>}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="New notification" className="flex-1 input-base" />
        <button onClick={create} className="px-3 py-1 bg-black text-white rounded-md">Add</button>
      </div>
    </div>
  )
}
