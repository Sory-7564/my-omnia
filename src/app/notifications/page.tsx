'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const router = useRouter()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    setNotifications(data || [])
  }

  const handleClick = async (notif: any) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notif.id)
    router.push(notif.link)
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {notifications.map((notif) => (
        <div
          key={notif.id}
          onClick={() => handleClick(notif)}
          className={`cursor-pointer p-3 mb-2 rounded-lg ${
            notif.is_read ? 'bg-gray-800' : 'bg-blue-600 text-white'
          }`}
        >
          {notif.content}
        </div>
      ))}
    </div>
  )
}
