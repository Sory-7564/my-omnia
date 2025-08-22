'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type User = {
  id: string
  prenom: string
  nom: string
  image?: string
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  contenu?: string
  media_url?: string
  media_type?: 'image' | 'video'
  audio_url?: string
  audio_duration?: number
  supprimer?: boolean
  vu?: boolean
  created_at: string
}

export default function ConversationPage() {
  const router = useRouter()
  const { id } = useParams()
  const otherUserId = String(id)

  const [user, setUser] = useState<User | null>(null)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [previewMedia, setPreviewMedia] = useState<File[]>([])
  const [viewMediaUrl, setViewMediaUrl] = useState<string | null>(null)

  const endRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<number | null>(null)
  const currentStreamRef = useRef<MediaStream | null>(null)

  const scrollToBottom = () => {
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  const formatDuration = (s?: number) => {
    if (!s && s !== 0) return ''
    const mm = Math.floor(s / 60).toString().padStart(2, '0')
    const ss = Math.floor(s % 60).toString().padStart(2, '0')
    return `${mm}:${ss}`
  }

  const getConversationId = () =>
    user && user.id < otherUserId
      ? `${user.id}_${otherUserId}`
      : `${otherUserId}_${user?.id}`

  // -------------------- INIT --------------------
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const authUser = session?.user
      if (!authUser) return router.push('/auth/login')

      setUser({
        id: authUser.id,
        prenom: (authUser.user_metadata as any)?.prenom || 'Utilisateur',
        nom: (authUser.user_metadata as any)?.nom || '',
        image: (authUser.user_metadata as any)?.image || '/default-avatar.png'
      })

      const { data: other } = await supabase
        .from('users')
        .select('id, prenom, nom, image')
        .eq('id', otherUserId)
        .single()
      setOtherUser(other as User | null)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${authUser.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${authUser.id})`)
        .order('created_at', { ascending: true })
      setMessages((msgs as Message[]) || [])
      setLoading(false)
      scrollToBottom()

      await supabase
        .from('messages')
        .update({ vu: true })
        .eq('receiver_id', authUser.id)
        .eq('sender_id', otherUserId)

      const channel = supabase
        .channel('messages-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async (payload) => {
          if (payload.eventType === 'INSERT') {
            const msg = payload.new as Message
            const isThisConv =
              (msg.sender_id === authUser.id && msg.receiver_id === otherUserId) ||
              (msg.sender_id === otherUserId && msg.receiver_id === authUser.id)
            if (isThisConv) {
              setMessages(prev => [...prev, msg])
              if (msg.receiver_id === authUser.id) {
                await supabase.from('messages').update({ vu: true }).eq('id', msg.id)
              }
              scrollToBottom()
            }
          }
          if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => m.id === (payload.new as Message).id ? (payload.new as Message) : m))
          }
          if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== (payload.old as Message).id))
          }
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    init()
  }, [otherUserId, router])

  // -------------------- ENVOI TEXTE & MEDIAS --------------------
  const sendMessage = async () => {
    if (!user) return
    if (!newMessage.trim() && previewMedia.length === 0) return

    const filesToSend = [...previewMedia]
    setPreviewMedia([])

    // Texte
    if (newMessage.trim()) {
      const { data: inserted } = await supabase
        .from('messages')
        .insert({
          conversation_id: getConversationId(),
          sender_id: user.id,
          receiver_id: otherUserId,
          contenu: newMessage,
          supprimer: false,
        })
        .select()
        .single()

      if (inserted) {
        setMessages(prev => [...prev, inserted as Message])
        scrollToBottom()
        // 🚀 Ajouter notification
        await supabase.from('notifications').insert({
          user_id: otherUserId,
          sender_id: user.id,
          type: 'message',
          message: newMessage,
          vu: false,
          created_at: new Date().toISOString()
        })
      }
      setNewMessage('')
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

      const { data: insertedMedia } = await supabase
        .from('messages')
        .insert({
          conversation_id: getConversationId(),
          sender_id: user.id,
          receiver_id: otherUserId,
          media_url: publicUrl,
          media_type: type,
          supprimer: false,
        })
        .select()
        .single()

      if (insertedMedia) {
        setMessages(prev => [...prev, insertedMedia as Message])
        scrollToBottom()
        // 🚀 Ajouter notification
        await supabase.from('notifications').insert({
          user_id: otherUserId,
          sender_id: user.id,
          type: 'media',
          message: type,
          vu: false,
          created_at: new Date().toISOString()
        })
      }
    }
  }

  // -------------------- AUDIO --------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      currentStreamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        if (!user) return
        currentStreamRef.current?.getTracks().forEach(t => t.stop())
        currentStreamRef.current = null

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const fileName = `audio-${Date.now()}.webm`
        const { error: uploadErr } = await supabase.storage.from('audios').upload(fileName, audioBlob)
        if (uploadErr) return

        const publicUrl = supabase.storage.from('audios').getPublicUrl(fileName).data.publicUrl

        const { data: insertedAudio } = await supabase
          .from('messages')
          .insert({
            conversation_id: getConversationId(),
            sender_id: user.id,
            receiver_id: otherUserId,
            audio_url: publicUrl,
            audio_duration: recordingTime,
            supprimer: false,
          })
          .select()
          .single()

        if (insertedAudio) {
          setMessages(prev => [...prev, insertedAudio as Message])
          scrollToBottom()
          // 🚀 Ajouter notification
          await supabase.from('notifications').insert({
            user_id: otherUserId,
            sender_id: user.id,
            type: 'audio',
            message: 'audio',
            vu: false,
            created_at: new Date().toISOString()
          })
        }

        setRecordingTime(0)
        if (recordingIntervalRef.current !== null) {
          clearInterval(recordingIntervalRef.current)
          recordingIntervalRef.current = null
        }
      }

      mediaRecorder.start()
      setRecording(true)
      setRecordingTime(0)
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch {
      alert('Micro non autorisé.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    if (recordingIntervalRef.current !== null) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
  }

  // -------------------- PREVIEW MEDIAS --------------------
  const handleMediaPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) setPreviewMedia(prev => [...prev, ...files])
    e.target.value = ''
  }

  const removePreviewItem = (index: number) => {
    setPreviewMedia(prev => prev.filter((_, i) => i !== index))
  }

  const handleDeleteMessage = async (msgId: string) => {
    await supabase.from('messages').update({ supprimer: true }).eq('id', msgId)
  }

  if (loading) return <p className="text-white text-center mt-10">Chargement...</p>

  // -------------------- RENDER --------------------
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 pb-24 flex flex-col">
      {/* Entête */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={otherUser?.image || '/default-avatar.png'}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <h1 className="text-lg font-bold">
          {otherUser?.prenom} {otherUser?.nom}
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map(msg => {
          const isSender = msg.sender_id === user?.id
          const senderName = isSender ? 'Moi' : otherUser?.prenom || 'Contact'
          return (
            <div
              key={msg.id}
              onClick={() => handleDeleteMessage(msg.id)}
              className={`flex flex-col max-w-[80%] px-4 py-2 rounded-lg cursor-pointer ${
                isSender ? 'bg-blue-600 self-end ml-auto' : 'bg-zinc-800 self-start mr-auto'
              }`}
            >
              <div className="text-xs font-semibold mb-1">{senderName}</div>
              {msg.supprimer ? (
                <p className="italic text-sm text-gray-300">Message supprimé</p>
              ) : (
                <>
                  {msg.contenu && <p className="whitespace-pre-wrap">{msg.contenu}</p>}
                  {msg.audio_url && (
                    <div className="flex items-center gap-2 mt-1">
                      <audio src={msg.audio_url} controls />
                      {typeof msg.audio_duration === 'number' && (
                        <span className="text-xs text-gray-200">{formatDuration(msg.audio_duration)}</span>
                      )}
                    </div>
                  )}
                  {msg.media_url && (
                    msg.media_type === 'image' ? (
                      <img
                        src={msg.media_url}
                        onClick={() => setViewMediaUrl(msg.media_url!)}
                        className="mt-1 rounded-lg max-w-[220px] cursor-zoom-in"
                        alt="media"
                      />
                    ) : (
                      <video
                        src={msg.media_url}
                        controls
                        className="mt-1 rounded-lg max-w-[260px]"
                      />
                    )
                  )}
                </>
              )}
              <div className="text-[10px] text-right mt-1 text-gray-200">
                {new Date(msg.created_at).toLocaleString('fr-FR')}
                {isSender && msg.vu && <span className="ml-1">✅</span>}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Aperçu fichiers */}
      {previewMedia.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {previewMedia.map((file, index) => {
            const url = URL.createObjectURL(file)
            const isImage = file.type.startsWith('image')
            const isVideo = file.type.startsWith('video')
            return (
              <div key={index} className="relative">
                {isImage && <img src={url} className="w-20 h-20 object-cover rounded" alt="preview" />}
                {isVideo && <video src={url} className="w-20 h-20 rounded" />}
                <button
                  onClick={() => removePreviewItem(index)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1"
                  title="Retirer"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Zone d’envoi */}
      <div className="mt-4 flex gap-2 items-center">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Écrire un message..."
          className="flex-1 p-3 rounded-xl bg-zinc-800 text-white outline-none"
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-xl">
          Envoyer
        </button>

        <label className="text-xl cursor-pointer" title="Joindre des images/vidéos">
          📎
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaPreview}
            className="hidden"
          />
        </label>

        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={() => recording && stopRecording()}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`text-2xl px-3 py-2 rounded-xl ${recording ? 'bg-red-600' : 'bg-zinc-800'}`}
          title="Maintenir pour enregistrer un audio"
        >
          🎤
        </button>
        {recording && (
          <span className="ml-2 text-sm text-gray-300 tabular-nums">
            {formatDuration(recordingTime)}
          </span>
        )}
      </div>

      {/* Aperçu plein écran */}
      {viewMediaUrl && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <img src={viewMediaUrl} className="max-h-[90vh] max-w-[90vw] object-contain" alt="aperçu" />
          <a
            href={viewMediaUrl}
            download
            className="absolute top-5 right-5 bg-white text-black px-3 py-1 rounded"
          >
            Télécharger
          </a>
          <button
            onClick={() => setViewMediaUrl(null)}
            className="absolute top-5 left-5 text-white text-3xl"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>
      )}
    </main>
  )
}
