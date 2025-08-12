'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setNotifications(data)
      }
    }

    fetchNotifications()
  }, [])

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 ? (
        <p>Aucune notification pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notif) => (
            <li key={notif.id} className="p-3 bg-gray-800 rounded-lg">
              {notif.message || 'Nouvelle notification'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
