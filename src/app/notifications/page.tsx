'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

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
    image?: string
  } | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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
        const senderIds = [...new Set(notifData.map((n) => n.sender_id))]

        const { data: usersData } = await supabase
          .from("users")
          .select("id, prenom, nom, email, image")
          .in("id", senderIds)

        // Récupérer les commentaires pour notifications de type "comment"
        const commentNotifs = notifData.filter(n => n.type === "comment")
        let commentsMap: Record<string, string> = {}

        if (commentNotifs.length > 0) {
          const { data: commentsData } = await supabase
            .from("commentaires")
            .select("id, contenu, user_id, produit_id")
            .in("produit_id", commentNotifs.map(n => n.produit_id))

          if (commentsData) {
            commentsData.forEach(c => {
              commentsMap[`${c.produit_id}_${c.user_id}`] = c.contenu
            })
          }
        }

        const merged = notifData.map(n => ({
          ...n,
          sender: usersData?.find(u => u.id === n.sender_id) || null,
          message: n.type === "comment" ? commentsMap[`${n.produit_id}_${n.sender_id}`] : n.message
        }))

        setNotifications(merged as Notification[])
      } else {
        setNotifications([])
      }

      // 🔔 Realtime
      channel = supabase
        .channel('notifications-' + user.id)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `receiver_id=eq.${user.id}` },
          async (payload: any) => {
            const rec = payload.record
            if (!rec) return

            const { data: senderData } = await supabase
              .from("users")
              .select("id, prenom, nom, email, image")
              .eq("id", rec.sender_id)
              .single()

            // Récupérer le commentaire si c'est une notif de type comment
            let commentText = rec.message
            if (rec.type === "comment") {
              const { data: commentData } = await supabase
                .from("commentaires")
                .select("contenu")
                .eq("produit_id", rec.produit_id)
                .eq("user_id", rec.sender_id)
                .single()
              commentText = commentData?.contenu || rec.message
            }

            setNotifications((prev) => [
              { ...rec, sender: senderData || null, message: commentText },
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

  if (loading) return <p className="text-center text-white mt-10">Chargement...</p>
  if (error) return <p className="p-4 text-red-500">⚠️ {error}</p>

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">🔔 Mes Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-center text-zinc-400 mt-10">Aucune notification pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={notif.sender?.image || '/default-avatar.png'}
                  alt={`${notif.sender?.prenom || ''} ${notif.sender?.nom || ''}`}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/profil/${notif.sender?.id}`)
                  }}
                />

                <div className="flex-1">
                  <p
                    className="font-semibold cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/profil/${notif.sender?.id}`)
                    }}
                  >
                    {notif.sender?.prenom && notif.sender?.nom
                      ? `${notif.sender.prenom} ${notif.sender.nom}`
                      : notif.sender?.email || "Utilisateur inconnu"}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {notif.type === "like"
                      ? "💙 a aimé votre produit"
                      : `💬 a commenté : "${notif.message || '...' }"`}
                  </p>
                </div>

                <p className="text-xs text-zinc-500 text-right whitespace-nowrap">
                  {new Date(notif.created_at).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>

              <button
                onClick={() => router.push(`/produit/${notif.produit_id}`)}
                className="text-sm text-blue-400 hover:underline self-start"
              >
                Voir le produit
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
