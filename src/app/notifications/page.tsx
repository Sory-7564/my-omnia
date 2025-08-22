'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Notification = {
  id: string
  type: string
  message: string | null
  is_read: boolean
  created_at: string
  from_user?: {
    id: string
    prenom?: string
    nom?: string
    image?: string
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let channelNotif: any = null

    const fetchNotifications = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          router.push('/auth/login')
          return
        }
        setUser(session.user)

        // Récupérer notifications pour l'utilisateur
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            id, type, message, is_read, created_at,
            from_user (id, prenom, nom, image)
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Normalisation pour éviter les nulls ou champs manquants
        const normalized = (data || []).map((n: any) => ({
          id: n.id,
          type: n.type,
          message: n.message,
          is_read: n.is_read,
          created_at: n.created_at,
          from_user: n.from_user
            ? {
                id: n.from_user.id,
                prenom: n.from_user.prenom,
                nom: n.from_user.nom,
                image: n.from_user.image
              }
            : undefined
        }))

        setNotifications(normalized)

        // Realtime pour les notifications
        channelNotif = supabase
          .channel('realtime-notifs')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'notifications' },
            (payload: any) => {
              if (payload.eventType === 'INSERT' && payload.new.user_id === session.user.id) {
                const newNotif = {
                  id: payload.new.id,
                  type: payload.new.type,
                  message: payload.new.message,
                  is_read: payload.new.is_read,
                  created_at: payload.new.created_at,
                  from_user: payload.new.from_user || undefined
                }
                setNotifications(prev => [newNotif, ...prev])
              }
              if (
                payload.eventType === 'UPDATE' &&
                payload.new.user_id === session.user.id
              ) {
                setNotifications(prev =>
                  prev.map(n => (n.id === payload.new.id ? { ...n, ...payload.new } : n))
                )
              }
            }
          )
          .subscribe()
      } catch (err) {
        console.error('Erreur chargement notifications:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    return () => {
      try {
        if (channelNotif) {
          if (supabase.removeChannel) supabase.removeChannel(channelNotif)
          if (channelNotif.unsubscribe) channelNotif.unsubscribe()
        }
      } catch (e) {
        // ignore
      }
    }
  }, [router])

  const handleNotificationClick = async (notifId: string) => {
    if (!user) return
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notifId)

      setNotifications(prev =>
        prev.map(n => (n.id === notifId ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      console.error('Erreur update notification:', err)
    }
  }

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some(n => !n.is_read) && (
          <span className="ml-2 h-3 w-3 bg-red-500 rounded-full"></span>
        )}
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : notifications.length === 0 ? (
        <p>Aucune notification pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map(notif => (
            <li
              key={notif.id}
              onClick={() => handleNotificationClick(notif.id)}
              className={`p-3 rounded-lg flex items-center space-x-3 cursor-pointer transition-colors ${
                notif.is_read ? 'bg-gray-800' : 'bg-gray-700'
              }`}
            >
              {/* Avatar from_user */}
              {notif.from_user?.image ? (
                <img
                  src={notif.from_user.image}
                  alt={`${notif.from_user.prenom || 'Utilisateur'} avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-xs">
                  {notif.from_user?.prenom?.slice(0, 1) || '?'}
                </div>
              )}

              <div>
                <p className="font-semibold">
                  {notif.from_user
                    ? `${notif.from_user.prenom || ''} ${notif.from_user.nom || ''}`
                    : 'Utilisateur inconnu'}
                </p>
                <p className="text-sm text-gray-300">{notif.message || 'Nouvelle notification'}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
