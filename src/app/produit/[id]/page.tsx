'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Modal from 'react-modal'

Modal.setAppElement('body')

export default function ProduitPage() {
  const { id } = useParams()
  const router = useRouter()

  const [produit, setProduit] = useState<any>(null)
  const [media, setMedia] = useState<any[]>([])
  const [vendeur, setVendeur] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  const [liked, setLiked] = useState(false)
  const [likesTotal, setLikesTotal] = useState(0)
  const [rating, setRating] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)

  const [commentaires, setCommentaires] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [commentLikes, setCommentLikes] = useState<any[]>([])

  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        setLoading(true)

        const { data: sessionData } = await supabase.auth.getSession()
        const sessionUser = sessionData?.session?.user
        if (!sessionUser) return router.push('/auth/login')
        setUser(sessionUser)

        const { data: produitData, error } = await supabase
          .from('produits')
          .select(`
            *,
            users (prenom, image, ville, quartier),
            images_produits (url)
          `)
          .eq('id', id)
          .single()

        if (error || !produitData) {
          console.error('❌ Erreur chargement produit :', error)
          setLoading(false)
          return
        }

        setProduit(produitData)
        setVendeur(produitData.users)

        const fichiers = (produitData.images_produits || []).map((img: any) => {
          const { data } = supabase.storage.from('produits').getPublicUrl(img.url)
          const url = data?.publicUrl
          const type = img.url.endsWith('.mp4') || img.url.endsWith('.webm') ? 'video' : 'image'
          return { url, type }
        })
        setMedia(fichiers)

        const { count: likeCount } = await supabase
          .from('aime')
          .select('*', { count: 'exact', head: true })
          .eq('produit_id', id)
        setLikesTotal(likeCount || 0)

        const { data: userLike } = await supabase
          .from('aime')
          .select('*')
          .eq('produit_id', id)
          .eq('user_id', sessionUser.id)
          .maybeSingle()
        setLiked(!!userLike)

        const { data: userRating } = await supabase
          .from('ratings')
          .select('rating')
          .eq('produit_id', id)
          .eq('user_id', sessionUser.id)
          .maybeSingle()
        if (userRating) setRating(userRating.rating)

        const { data: allRatings } = await supabase
          .from('ratings')
          .select('rating')
          .eq('produit_id', id)
        if (allRatings?.length) {
          const sum = allRatings.reduce((acc, r) => acc + r.rating, 0)
          setAverageRating(sum / allRatings.length)
          setTotalRatings(allRatings.length)
        }

        const { data: commentsData } = await supabase
          .from('commentaires')
          .select('id, contenu, created_at, user_id, parent_id, users (prenom, image)')
          .eq('produit_id', id)
          .order('created_at', { ascending: true })
        setCommentaires(commentsData || [])

        const { data: likesCommentaires } = await supabase
          .from('likes_commentaires')
          .select('*')
        setCommentLikes(likesCommentaires || [])

        setLoading(false)
      } catch (err) {
        console.error('❌ Erreur chargement produit :', err)
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  const handleLike = async () => {
    if (!user || !produit) return
    if (liked) {
      await supabase.from('aime').delete().eq('produit_id', produit.id).eq('user_id', user.id)
      setLiked(false)
      setLikesTotal(likesTotal - 1)
    } else {
      await supabase.from('aime').insert({ produit_id: produit.id, user_id: user.id })
      setLiked(true)
      setLikesTotal(likesTotal + 1)
    }
  }

  const handleRating = async (val: number) => {
    if (!user || !produit) return
    await supabase.from('ratings').upsert({ produit_id: produit.id, user_id: user.id, rating: val })
    setRating(val)
    const { data } = await supabase.from('ratings').select('rating').eq('produit_id', produit.id)
    if (data?.length) {
      const total = data.reduce((acc, r) => acc + r.rating, 0)
      setAverageRating(total / data.length)
      setTotalRatings(data.length)
    }
  }

  const sendComment = async () => {
    if (!newComment.trim()) return
    await supabase.from('commentaires').insert({
      produit_id: produit.id,
      user_id: user.id,
      contenu: newComment,
      parent_id: replyTo,
    })
    setNewComment('')
    setReplyTo(null)
    location.reload()
  }

  const toggleLikeComment = async (commentId: string) => {
    const alreadyLiked = commentLikes.find(
      (l) => l.commentaire_id === commentId && l.user_id === user?.id
    )
    if (alreadyLiked) {
      await supabase
        .from('likes_commentaires')
        .delete()
        .eq('id', alreadyLiked.id)
    } else {
      await supabase
        .from('likes_commentaires')
        .insert({ commentaire_id: commentId, user_id: user?.id })
    }
    const { data: updated } = await supabase.from('likes_commentaires').select('*')
    setCommentLikes(updated || [])
  }

  const handleContacter = () => {
    if (produit?.user_id && user?.id !== produit.user_id) {
      router.push(`/messages/${produit.user_id}`)
    }
  }

  const renderCommentaires = (parentId: string | null = null): any =>
    commentaires
      .filter((c) => c.parent_id === parentId)
      .map((c) => {
        const likes = commentLikes.filter((l) => l.commentaire_id === c.id).length
        const likedByUser = commentLikes.some(
          (l) => l.commentaire_id === c.id && l.user_id === user?.id
        )

        return (
          <div key={c.id} className="mb-3 ml-[10px]">
            <div className="flex gap-2 items-center cursor-pointer" onClick={() => router.push(`/profil/${c.user_id}`)}>
              <img src={c.users?.image || '/default-avatar.png'} className="w-6 h-6 rounded-full" />
              <span className="text-sm font-bold">{c.users?.prenom}</span>
              <span className="text-xs text-zinc-400">{new Date(c.created_at).toLocaleString()}</span>
            </div>
            <p className="ml-8">{c.contenu}</p>

            <div className="ml-8 mt-1 flex gap-4 text-xs text-blue-400">
              <button onClick={() => { setReplyTo(c.id); textareaRef.current?.focus() }}>Répondre</button>
              <button onClick={() => toggleLikeComment(c.id)}>
                {likedByUser ? '❤️' : '🤍'} {likes}
              </button>
              {c.user_id === user?.id && (
                <button onClick={async () => {
                  await supabase.from('commentaires').delete().eq('id', c.id)
                  location.reload()
                }} className="text-red-400">Supprimer</button>
              )}
            </div>

            <div className="ml-4 border-l border-zinc-700 pl-2 mt-2">
              {renderCommentaires(c.id)}
            </div>
          </div>
        )
      })

  const openModal = (index: number) => {
    setCurrentMediaIndex(index)
    setIsModalOpen(true)
  }

  if (loading || !produit) return <div className="p-4 text-white">Chargement...</div>

  return (
    <main className="text-white p-4 pb-32">
      <div onClick={() => router.push(`/profil/${produit.user_id}`)} className="flex gap-3 mb-4 items-center cursor-pointer">
        <img src={vendeur?.image || '/default-avatar.png'} className="w-10 h-10 rounded-full" />
        <div>
          <p className="font-bold">{vendeur?.prenom}</p>
          <p className="text-sm text-zinc-400">{vendeur?.ville}, {vendeur?.quartier}</p>
        </div>
      </div>

      <div className="flex overflow-x-auto space-x-3 mb-4 scrollbar-hide">
        {media.length > 0 ? media.map((m, i) =>
          m.type === 'video' ? (
            <video key={i} src={m.url} className="w-64 h-40 rounded-lg" muted loop autoPlay onClick={() => openModal(i)} />
          ) : (
            <img key={i} src={m.url} className="w-64 h-40 rounded-lg" onClick={() => openModal(i)} />
          )
        ) : (
          <div className="text-zinc-500 text-sm">Aucun média</div>
        )}
      </div>

      <h2 className="text-xl font-semibold">{produit.nom}</h2>
      <p className="text-sm text-zinc-400">Catégorie : {produit.categorie}</p>
      <p className="text-green-400 text-lg font-bold">{produit.prix} FCFA</p>

      <button onClick={handleContacter} className="bg-blue-600 px-4 py-2 text-sm rounded mt-2">
        Contacter le vendeur
      </button>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center cursor-pointer" onClick={handleLike}>
          <span className="text-xl">{liked ? '❤️' : '🤍'}</span> <span>{likesTotal}</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} onClick={() => handleRating(n)} className={`cursor-pointer ${rating >= n ? 'text-yellow-400' : 'text-zinc-500'}`}>★</span>
          ))}
          {averageRating > 0 && (
            <span className="text-sm text-zinc-400 ml-2">
              ({averageRating.toFixed(1)} · {totalRatings})
            </span>
          )}
        </div>
      </div>

      <p className="mt-4 whitespace-pre-line">{produit.description}</p>

      <div className="mt-6">
        <h3 className="font-bold mb-2">Commentaires</h3>

        {replyTo && (
          <div className="text-xs text-blue-400 mb-1">
            En réponse à un commentaire
            <button onClick={() => setReplyTo(null)} className="ml-2 text-red-400">Annuler</button>
          </div>
        )}

        {renderCommentaires()}

        <textarea
          ref={textareaRef}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full bg-zinc-800 rounded p-2 mt-2"
          placeholder="Ajouter un commentaire"
        />
        <button onClick={sendComment} className="mt-2 bg-blue-600 px-4 py-1 rounded text-sm">
          Envoyer
        </button>
      </div>

      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} style={{
        content: {
          backgroundColor: 'black',
          padding: 0,
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}>
        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-6 text-white text-2xl">✖</button>
        <button onClick={() => setCurrentMediaIndex((prev) => (prev - 1 + media.length) % media.length)} className="absolute left-4 text-white text-3xl">⬅</button>
        {media[currentMediaIndex]?.type === 'video' ? (
          <video src={media[currentMediaIndex].url} controls autoPlay style={{ maxHeight: '90%', maxWidth: '90%' }} />
        ) : (
          <img src={media[currentMediaIndex].url} style={{ maxHeight: '90%', maxWidth: '90%' }} />
        )}
        <button onClick={() => setCurrentMediaIndex((prev) => (prev + 1) % media.length)} className="absolute right-4 text-white text-3xl">➡</button>
      </Modal>
    </main>
  )
}
