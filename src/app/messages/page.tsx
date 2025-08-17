'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type User = {
  id: string
  prenom: string
  nom: string
  image?: string
}

type Conversation = {
  conversation_id: string
  last_message?: string
  last_date?: string
  sender_id?: string
}

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [usersMap, setUsersMap] = useState<Record<string, User>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase.auth.getSession()
      const currentUser = data?.session?.user ?? null

      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser as unknown as User)

      const { data: convData, error: convError } = await supabase.rpc('get_conversations', {
        current_user_id: currentUser.id,
      })

      if (convError) {
        console.error('Erreur RPC:', convError.message)
        setLoading(false)
        return
      }

      const convs: Conversation[] = (convData || []).map((conv: any) => ({
        conversation_id: conv.conversation_id,
        last_message: conv.last_message,
        last_date: conv.last_date,
        sender_id: conv.sender_id
      }))
      setConversations(convs)

      const otherUserIds = convs
        .map(conv => {
          const [id1, id2] = conv.conversation_id.split('_')
          return id1 === currentUser.id ? id2 : id1
        })
        .filter((v, i, a) => a.indexOf(v) === i)

      if (otherUserIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, prenom, nom, image')
          .in('id', otherUserIds)

        if (usersData) {
          const map: Record<string, User> = {}
          usersData.forEach(u => map[u.id] = u)
          setUsersMap(map)
        }
      }

      setLoading(false)
    }

    fetchConversations()
  }, [router])

  // Live update for messages
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        payload => {
          const newMessage = payload.new
          const convId = [newMessage.sender_id, newMessage.receiver_id].sort().join('_')

          setConversations(prev => {
            const existingIndex = prev.findIndex(c => c.conversation_id === convId)
            if (existingIndex > -1) {
              const updated = [...prev]
              updated[existingIndex].last_message = newMessage.content
              updated[existingIndex].last_date = newMessage.created_at
              updated[existingIndex].sender_id = newMessage.sender_id
              return updated
            } else {
              return [
                ...prev,
                {
                  conversation_id: convId,
                  last_message: newMessage.content,
                  last_date: newMessage.created_at,
                  sender_id: newMessage.sender_id
                }
              ]
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleOpenConversation = (conversationId: string) => {
    if (!user) return
    const [id1, id2] = conversationId.split('_')
    const otherUserId = user.id === id1 ? id2 : id1
    router.push(`/messages/${otherUserId}`)
  }

  // Supprimer une conversation entière via la fonction SQL
  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette conversation ?')) return

    const [id1, id2] = conversationId.split('_')

    const { error } = await supabase.rpc('delete_conversation', {
      user1: id1,
      user2: id2
    })

    if (error) {
      console.error('Erreur lors de la suppression:', error.message)
      alert("Erreur lors de la suppression.")
    } else {
      setConversations(prev => prev.filter(c => c.conversation_id !== conversationId))
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const [id1, id2] = conv.conversation_id.split('_')
    const otherUserId = user?.id === id1 ? id2 : id1
    const otherUser = usersMap[otherUserId]
    if (!otherUser) return false
    const fullName = `${otherUser.prenom} ${otherUser.nom}`.toLowerCase()
    return fullName.includes(search.toLowerCase())
  })

  if (loading) {
    return <p className="text-center text-white mt-10">Chargement...</p>
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">💬 Mes Conversations</h1>

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 rounded-lg bg-zinc-800 text-white placeholder-zinc-400"
      />

      {filteredConversations.length === 0 ? (
        <p className="text-center text-zinc-400 mt-10">Aucune conversation trouvée.</p>
      ) : (
        <ul className="space-y-4">
          {filteredConversations.map((conv, index) => {
            const [id1, id2] = conv.conversation_id.split('_')
            const otherUserId = user?.id === id1 ? id2 : id1
            const otherUser = usersMap[otherUserId]
            const sender = conv.sender_id ? usersMap[conv.sender_id] : null

            return (
              <li
                key={index}
                className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 flex flex-col gap-2"
              >
                {sender && (
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={sender.image || '/default-avatar.png'}
                      alt={`${sender.prenom} ${sender.nom}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <p className="font-semibold">{sender.prenom} {sender.nom}</p>
                  </div>
                )}

                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => handleOpenConversation(conv.conversation_id)}
                >
                  <img
                    src={otherUser?.image || '/default-avatar.png'}
                    alt={`${otherUser?.prenom || ''} ${otherUser?.nom || ''}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div className="flex-1">
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
                </div>

                {/* Bouton supprimer */}
                <button
                  onClick={() => handleDeleteConversation(conv.conversation_id)}
                  className="mt-2 text-red-500 text-sm hover:underline self-end"
                >
                  Supprimer la conversation
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
