'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

type Notification = {
  id: string
  type: "like" | "comment"
  message: string
  is_read: boolean
  created_at: string
  produit_id: string
  sender_id: string
  sender?: {
    id: string
    prenom?: string
    nom?: string
    email: string
  } | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let channel: any = null

    const fetchNotifications = async () => {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Utilisateur non connecté")
        setLoading(false)
        return
      }

      // Charger les notifications
      const { data: notifData, error: notifError } = await supabase
        .from("notifications")
        .select("*")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false })

      if (notifError) {
        console.error("Erreur chargement notifications:", notifError.message)
        setError(notifError.message)
        setLoading(false)
        return
      }

      if (notifData && notifData.length > 0) {
        // Récupérer les sender_id uniques
        const senderIds = [...new Set(notifData.map((n) => n.sender_id))]

        // Charger les infos des utilisateurs
        const { data: usersData } = await supabase
          .from("users")
          .select("id, prenom, nom, email")
          .in("id", senderIds)

        // Fusionner notifications + users
        const merged = notifData.map((n) => ({
          ...n,
          sender: usersData?.find((u) => u.id === n.sender_id) || null,
        }))

        setNotifications(merged as Notification[])
      } else {
        setNotifications([])
      }

      // 🔔 Realtime notifications
      channel = supabase
        .channel('notifications-' + user.id)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `receiver_id=eq.${user.id}` },
          async (payload: any) => {
            const rec = payload.record
            if (!rec) return

            // Charger le sender correspondant
            const { data: senderData } = await supabase
              .from("users")
              .select("id, prenom, nom, email")
              .eq("id", rec.sender_id)
              .single()

            setNotifications((prev) => [
              { ...rec, sender: senderData || null },
              ...prev,
            ])
          }
        )
        .subscribe()

      setLoading(false)
    }

    fetchNotifications()

    return () => {
      if (channel) {
        // @ts-ignore
        if (supabase.removeChannel) supabase.removeChannel(channel)
        // @ts-ignore
        if (channel.unsubscribe) channel.unsubscribe()
      }
    }
  }, [])

  if (loading) return <p className="p-4">⏳ Chargement...</p>
  if (error) return <p className="p-4 text-red-500">⚠️ {error}</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">🔔 Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500">Aucune notification pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`p-3 rounded-xl shadow ${
                notif.is_read ? "bg-gray-100" : "bg-blue-100"
              }`}
            >
              <p>
                <strong>
                  {notif.sender?.prenom && notif.sender?.nom
                    ? `${notif.sender.prenom} ${notif.sender.nom}`
                    : notif.sender?.email || "Utilisateur inconnu"}
                </strong>{" "}
                {notif.type === "like"
                  ? "a aimé votre produit 💙"
                  : "a commenté votre produit 💬"}
              </p>

              <Link
                href={`/produit/${notif.produit_id}`}
                className="text-sm text-blue-600 underline"
              >
                Voir le produit
              </Link>

              <p className="text-xs text-gray-500 mt-1">
                {new Date(notif.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
