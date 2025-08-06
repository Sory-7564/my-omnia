'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ConversationPage() {
  const router = useRouter()
  const { id } = useParams()
  const otherUserId = String(id)

  const [user, setUser] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [recording, setRecording] = useState(false)
  const [previewMedia, setPreviewMedia] = useState<any[]>([])
  const [viewMediaUrl, setViewMediaUrl] = useState<string | null>(null)

  const endRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return router.push('/auth/login')
      setUser(session.user)

      const { data: other } = await supabase
        .from('users')
        .select('id, prenom, nom, image')
        .eq('id', otherUserId)
        .single()

      if (!other) return
      setOtherUser(other)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${session.user.id})`)
        .order('created_at', { ascending: true })

      if (msgs) setMessages(msgs)

      setLoading(false)
      scrollToBottom()

      // Marquer comme "vu"
      await supabase.from('messages')
        .update({ vu: true })
        .eq('receiver_id', session.user.id)
        .eq('sender_id', otherUserId)
    }

    fetchData()
  }, [otherUserId, router])

  const scrollToBottom = () => {
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const getConversationId = () => {
    return user.id < otherUserId
      ? `${user.id}_${otherUserId}`
      : `${otherUserId}_${user.id}`
  }

  const sendMessage = async () => {
    if (!newMessage.trim() && previewMedia.length === 0) return

    const filesToSend = [...previewMedia]
    setPreviewMedia([])

    // Texte
    if (newMessage.trim()) {
      const { data, error } = await supabase.from('messages').insert({
        conversation_id: getConversationId(),
        sender_id: user.id,
        receiver_id: otherUserId,
        contenu: newMessage,
        supprimer: false,
      }).select()

      if (!error && data) {
        setMessages(prev => [...prev, ...data])
      }
    }

    // Médias
    for (const file of filesToSend) {
      const type = file.type.startsWith('image') ? 'image'
                 : file.type.startsWith('video') ? 'video' : null
      if (!type) continue

      const fileName = `${type}-${Date.now()}-${file.name}`
      const { error: uploadErr } = await supabase.storage.from('medias').upload(fileName, file)
      if (uploadErr) continue

      const publicUrl = supabase.storage.from('medias').getPublicUrl(fileName).data.publicUrl

      const { data, error } = await supabase.from('messages').insert({
        conversation_id: getConversationId(),
        sender_id: user.id,
        receiver_id: otherUserId,
        media_url: publicUrl,
        media_type: type,
        supprimer: false,
      }).select()

      if (!error && data) {
        setMessages(prev => [...prev, ...data])
      }
    }

    setNewMessage('')
    scrollToBottom()
  }

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('Supprimer ce message ?')) return
    await supabase.from('messages').update({ supprimer: true }).eq('id', msgId)
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, supprimer: true } : m))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const fileName = `audio-${Date.now()}.webm`

        const { error: uploadErr } = await supabase.storage.from('audios').upload(fileName, audioBlob)
        if (uploadErr) return alert('Erreur envoi audio')

        const publicUrl = supabase.storage.from('audios').getPublicUrl(fileName).data.publicUrl

        const { data, error } = await supabase.from('messages').insert({
          conversation_id: getConversationId(),
          sender_id: user.id,
          receiver_id: otherUserId,
          audio_url: publicUrl,
          supprimer: false,
        }).select()

        if (!error && data) {
          setMessages(prev => [...prev, ...data])
          scrollToBottom()
        }
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setRecording(true)
    } catch (err) {
      alert("Micro non autorisé.")
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  const handleMediaPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPreviewMedia(prev => [...prev, ...files])
    e.target.value = ''
  }

  if (loading) return <p className="text-white text-center mt-10">Chargement...</p>

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 pb-24 flex flex-col">
      {/* Entête */}
      <div className="flex items-center gap-3 mb-4">
        <img src={otherUser?.image || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
        <h1 className="text-lg font-bold">{otherUser?.prenom} {otherUser?.nom}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, i) => {
          const isSender = msg.sender_id === user.id
          return (
            <div key={i} onClick={() => handleDeleteMessage(msg.id)} className={`flex max-w-[80%] px-4 py-2 rounded-lg cursor-pointer group ${isSender ? 'bg-blue-600 self-end ml-auto' : 'bg-zinc-800 self-start mr-auto'}`}>
              <div>
                {msg.supprimer ? (
                  <p className="italic text-sm text-gray-400">Message supprimé</p>
                ) : (
                  <>
                    {msg.contenu && <p>{msg.contenu}</p>}
                    {msg.audio_url && <audio src={msg.audio_url} controls className="mt-1" />}
                    {msg.media_url && msg.media_type === 'image' && (
                      <img src={msg.media_url} onClick={() => setViewMediaUrl(msg.media_url)} className="mt-1 rounded-lg max-w-[200px] cursor-zoom-in" />
                    )}
                    {msg.media_url && msg.media_type === 'video' && (
                      <video src={msg.media_url} controls className="mt-1 rounded-lg max-w-[250px]" />
                    )}
                  </>
                )}
                <div className="text-[10px] text-right mt-1 text-gray-300">
                  {new Date(msg.created_at).toLocaleString()}
                  {isSender && msg.vu && <span className="ml-1">✅</span>}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Aperçu des fichiers avant envoi */}
      {previewMedia.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {previewMedia.map((file, index) => {
            const url = URL.createObjectURL(file)
            return file.type.startsWith('image') ? (
              <img key={index} src={url} className="w-20 h-20 object-cover rounded" />
            ) : file.type.startsWith('video') ? (
              <video key={index} src={url} className="w-20 h-20 rounded" />
            ) : null
          })}
        </div>
      )}

      {/* Zone d’envoi */}
      <div className="mt-4 flex gap-2 items-center">
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Écrire un message..." className="flex-1 p-3 rounded-xl bg-zinc-800 text-white outline-none" onKeyDown={e => e.key === 'Enter' && sendMessage()} />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-xl">Envoyer</button>
        <label className="text-xl cursor-pointer">📎
          <input type="file" accept="image/*,video/*" multiple onChange={handleMediaPreview} className="hidden" />
        </label>
        <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className="text-2xl" title="Maintenir pour enregistrer un audio" disabled={recording}>🎤</button>
      </div>

      {/* Aperçu plein écran */}
      {viewMediaUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <img src={viewMediaUrl} className="max-h-[90vh] max-w-[90vw] object-contain" />
          <a href={viewMediaUrl} download className="absolute top-5 right-5 bg-white text-black px-3 py-1 rounded">Télécharger</a>
          <button onClick={() => setViewMediaUrl(null)} className="absolute top-5 left-5 text-white text-3xl">&times;</button>
        </div>
      )}
    </main>
  )
}
