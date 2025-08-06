'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [usersMap, setUsersMap] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchConversations = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user

      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      const { data, error } = await supabase.rpc('get_conversations', {
        current_user_id: currentUser.id,
      })

      if (error) {
        console.error('Erreur RPC:', error.message)
        setLoading(false)
        return
      }

      setConversations(data || [])

      const otherUserIds = (data || [])
        .map((conv: any) => {
          const [id1, id2] = conv.conversation_id.split('_')
          return id1 === currentUser.id ? id2 : id1
        })
        .filter((v: any, i: number, a: any[]) => a.indexOf(v) === i)

      if (otherUserIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, prenom, nom, image')
          .in('id', otherUserIds)

        if (usersData) {
          const map: Record<string, any> = {}
          usersData.forEach(u => map[u.id] = u)
          setUsersMap(map)
        }
      }

      setLoading(false)
    }

    fetchConversations()
  }, [router])

  const handleOpenConversation = (conversationId: string) => {
    if (!user) return
    const [id1, id2] = conversationId.split('_')
    const otherUserId = user.id === id1 ? id2 : id1
    router.push(`/messages/${otherUserId}`)
  }

  if (loading) {
    return <p className="text-center text-white mt-10">Chargement...</p>
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">💬 Mes Conversations</h1>

      {conversations.length === 0 ? (
        <p className="text-center text-zinc-400 mt-10">Aucune conversation pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          {conversations.map((conv, index) => {
            const [id1, id2] = conv.conversation_id.split('_')
            const otherUserId = user?.id === id1 ? id2 : id1
            const otherUser = usersMap[otherUserId]

            return (
              <li
                key={index}
                className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 flex items-center gap-4"
              >
                <img
                  src={otherUser?.image || '/default-avatar.png'}
                  alt={`${otherUser?.prenom || ''} ${otherUser?.nom || ''}`}
                  className="w-12 h-12 rounded-full object-cover cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/profil/${otherUserId}`)
                  }}
                />

                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleOpenConversation(conv.conversation_id)}
                >
                  <p className="font-semibold truncate">
                    {otherUser ? `${otherUser.prenom} ${otherUser.nom}` : 'Utilisateur'}
                  </p>
                  <p className="text-sm text-zinc-400 truncate">
                    {conv.last_message || 'Aucun message'}
                  </p>
                </div>

                <p className="text-xs text-zinc-400 text-right whitespace-nowrap">
                  {conv.last_date
                    ? new Date(conv.last_date).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : ''}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}



