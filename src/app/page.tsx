'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Produit = {
  id: string;
  nom: string;
  description: string;
  prix: number;
  categorie: string;
  created_at: string;
  user_id: string;
  vendeur: {
    prenom: string;
    ville: string;
    quartier: string;
    image: string;
  };
  images: {
    url: string;
    type: string;
  }[];
}

type LikesMap = { [key: string]: number }
type UserLikesMap = { [key: string]: boolean }
type CommentsMap = { [key: string]: number }

export default function AccueilPage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [filtered, setFiltered] = useState<Produit[]>([])
  const [likes, setLikes] = useState<LikesMap>({})
  const [userLikes, setUserLikes] = useState<UserLikesMap>({})
  const [commentsCount, setCommentsCount] = useState<CommentsMap>({})
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [search, setSearch] = useState('')
  const [categorieActive, setCategorieActive] = useState('Tout')
  const [villeFilter, setVilleFilter] = useState('')
  const [quartierFilter, setQuartierFilter] = useState('')
  const [notifCount, setNotifCount] = useState(0) // non lues

  // ✨ Ajouts
  const [sort, setSort] = useState<'recent' | 'prixAsc' | 'prixDesc' | 'plusLikes'>('recent')
  const [visibleCount, setVisibleCount] = useState(12)
  const loadingMoreRef = useRef<HTMLDivElement | null>(null)

  const router = useRouter()

  const categories = [
    'Tout', 'Nourriture', 'Voitures', 'Électronique', 'Vêtements', 'Chaussures', 'Maison',
    'Auto', 'Gaming', 'Sport', 'Cuisine', 'Livres', 'Outils', 'Bijoux', 'Animaux', 'Autres'
  ]

  useEffect(() => {
    let channelAime: any = null
    let channelNotif: any = null

    const fetchData = async () => {
      try {
        setLoading(true)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          router.push('/auth/login')
          return
        }
        setUser(session.user)

        // user info
        const { data: userInfo, error: userErr } = await supabase
          .from('users')
          .select('prenom, nom')
          .eq('id', session.user.id)
          .single()

        if (userErr) console.error('[users] error:', userErr)
        if (userInfo) {
          setPrenom(userInfo.prenom)
          setNom(userInfo.nom)
        }

        // produits + enrichissement medias & vendeur
        const { data: produitsData, error: produitsErr } = await supabase
          .from('produits')
          .select(`
            id, nom, description, prix, categorie, created_at, user_id,
            users (prenom, ville, quartier, image),
            images_produits (url, type)
          `)
          .order('created_at', { ascending: false })

        if (produitsErr) console.error('[produits] error:', produitsErr)

        const enrichis: Produit[] = (produitsData || []).map((p: any) => ({
          ...p,
          vendeur: p.users,
          images: (p.images_produits || []).map((img: any) => {
            const publicUrl = supabase.storage.from('produits').getPublicUrl(img.url).data.publicUrl
            return {
              url: publicUrl,
              type: img.type || (img.url?.endsWith?.('.mp4') ? 'video' : 'image')
            }
          })
        }))

        setProduits(enrichis)
        setFiltered(enrichis)

        // Charger likes depuis la table `aime`
        const { data: aimeData, error: aimeErr } = await supabase
          .from('aime')
          .select('produit_id, user_id')

        if (aimeErr) console.error('[aime] error:', aimeErr)

        const likesCount: LikesMap = {}
        const userLikeStatus: UserLikesMap = {}
        aimeData?.forEach((l: any) => {
          likesCount[l.produit_id] = (likesCount[l.produit_id] || 0) + 1
          if (l.user_id === session.user.id) userLikeStatus[l.produit_id] = true
        })
        setLikes(likesCount)
        setUserLikes(userLikeStatus)

        // Charger nombre de commentaires (tous)
        const { data: commentsData, error: commentsErr } = await supabase
          .from('commentaires')
          .select('id, produit_id')

        if (commentsErr) console.error('[commentaires] error:', commentsErr)

        const commentsCountMap: CommentsMap = {}
        commentsData?.forEach((c: any) => {
          commentsCountMap[c.produit_id] = (commentsCountMap[c.produit_id] || 0) + 1
        })
        setCommentsCount(commentsCountMap)

        // ⚡ Notifications — stratégie robuste (is_read OU lu) avec fallback
        let unreadCount = 0
        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('is_read', false)
          if (error) throw error
          unreadCount = data?.length || 0
          console.log('[notifications] using is_read, count =', unreadCount)
        } catch (e1) {
          console.warn('[notifications] is_read query failed, trying lu:', e1)
          try {
            const { data, error } = await supabase
              .from('notifications')
              .select('id')
              .eq('user_id', session.user.id)
              .eq('lu', false)
            if (error) throw error
            unreadCount = data?.length || 0
            console.log('[notifications] using lu, count =', unreadCount)
          } catch (e2) {
            console.warn('[notifications] both filtered queries failed, fallback select *:', e2)
            const { data, error } = await supabase
              .from('notifications')
              .select('*')
              .eq('user_id', session.user.id)
            if (error) {
              console.error('Erreur chargement notifications (fallback):', error)
            } else {
              unreadCount = (data || []).filter((n: any) => {
                const hasIsRead = Object.prototype.hasOwnProperty.call(n, 'is_read')
                const hasLu = Object.prototype.hasOwnProperty.call(n, 'lu')
                if (hasIsRead) return n.is_read === false
                if (hasLu) return n.lu === false
                return false
              }).length
              console.log('[notifications] fallback count =', unreadCount)
            }
          }
        }
        setNotifCount(unreadCount)

        // *** Abonnement realtime sur la table `aime` *** (compat new/old vs record)
        channelAime = supabase
          .channel('realtime-aime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'aime' },
            (payload: any) => {
              const rec = (payload.new ?? payload.record)
              const ev: string = payload.eventType
              if (!rec) return
              const pid = rec.produit_id

              setLikes(prev => {
                const current = prev[pid] || 0
                let next = current
                if (ev === 'INSERT') next = current + 1
                if (ev === 'DELETE') next = Math.max(0, current - 1)
                return { ...prev, [pid]: next }
              })

              setUserLikes(prev => {
                if (rec.user_id === session?.user?.id && ev === 'INSERT') {
                  return { ...prev, [rec.produit_id]: true }
                }
                if (rec.user_id === session?.user?.id && ev === 'DELETE') {
                  return { ...prev, [rec.produit_id]: false }
                }
                return prev
              })
            }
          )
          .subscribe()

        // *** Abonnement realtime sur la table `notifications` *** (is_read OU lu)
        channelNotif = supabase
          .channel('realtime-notifs')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'notifications' },
            (payload: any) => {
              console.log('[notifications] realtime payload:', payload)
              const n = payload.new ?? payload.record
              if (!n || n.user_id !== session?.user?.id) return

              if (payload.eventType === 'INSERT') {
                setNotifCount(prev => prev + 1)
              }

              if (payload.eventType === 'UPDATE') {
                const readValue = (n.lu ?? n.is_read)
                if (readValue === true) {
                  setNotifCount(prev => Math.max(0, prev - 1))
                }
              }
            }
          )
          .subscribe()

      } catch (err) {
        console.error('Erreur chargement accueil:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      try {
        if (channelAime) {
          if ((supabase as any).removeChannel) (supabase as any).removeChannel(channelAime)
          if (channelAime.unsubscribe) channelAime.unsubscribe()
        }
        if (channelNotif) {
          if ((supabase as any).removeChannel) (supabase as any).removeChannel(channelNotif)
          if (channelNotif.unsubscribe) channelNotif.unsubscribe()
        }
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tri et filtres (reprend ta logique et ajoute le tri)
  const applyFilters = (searchText: string, cat: string, ville = '', quartier = '', tri = sort) => {
    let filtres = [...produits]

    if (cat !== 'Tout') {
      filtres = filtres.filter(p => p.categorie === cat)
    }

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase()
      filtres = filtres.filter(p =>
        p.nom?.toLowerCase().includes(q) ||
        p.categorie?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }

    if (ville.trim()) {
      filtres = filtres.filter(p =>
        p.vendeur?.ville?.toLowerCase().includes(ville.toLowerCase())
      )
    }

    if (quartier.trim()) {
      filtres = filtres.filter(p =>
        p.vendeur?.quartier?.toLowerCase().includes(quartier.toLowerCase())
      )
    }

    // Tri
    if (tri === 'prixAsc') filtres.sort((a, b) => (a.prix || 0) - (b.prix || 0))
    if (tri === 'prixDesc') filtres.sort((a, b) => (b.prix || 0) - (a.prix || 0))
    if (tri === 'recent') filtres.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (tri === 'plusLikes') {
      filtres.sort((a, b) => (likes[b.id] || 0) - (likes[a.id] || 0))
    }

    setFiltered(filtres)
    setVisibleCount(12)
  }

  // Re-appliquer le tri "plus likés" si les likes changent
  useEffect(() => {
    if (sort === 'plusLikes') {
      applyFilters(search, categorieActive, villeFilter, quartierFilter, 'plusLikes')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likes])

  const toggleLike = async (produitId: string) => {
    if (!user) return
    if (userLikes[produitId]) {
      const { error } = await supabase
        .from('aime')
        .delete()
        .match({ produit_id: produitId, user_id: user.id })
      if (error) {
        console.error('Erreur suppression like:', error)
        return
      }
      setLikes(prev => ({ ...prev, [produitId]: Math.max(0, (prev[produitId] || 1) - 1) }))
      setUserLikes(prev => ({ ...prev, [produitId]: false }))
    } else {
      const { error } = await supabase
        .from('aime')
        .insert({ produit_id: produitId, user_id: user.id })
      if (error) {
        console.error('Erreur insertion like:', error)
        return
      }
      setLikes(prev => ({ ...prev, [produitId]: (prev[produitId] || 0) + 1 }))
      setUserLikes(prev => ({ ...prev, [produitId]: true }))
    }
  }

  // Partage
  const shareProduit = async (p: Produit) => {
    const url = `${window.location.origin}/produit/${p.id}`
    const text = `${p.nom} - ${p.prix} FCFA`

    if (navigator.share) {
      try {
        await navigator.share({ title: p.nom, text: p.description || text, url })
        return
      } catch (e) {
        // annulé, on tente fallback
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      alert('Lien copié ✅')
    } catch {
      alert('Partage non supporté. Lien: ' + url)
    }
  }

  // Infinite scroll léger
  useEffect(() => {
    if (!loadingMoreRef.current) return
    const el = loadingMoreRef.current
    const obs = new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first.isIntersecting) {
        setVisibleCount((v) => Math.min(v + 12, filtered.length))
      }
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [filtered.length])

  const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="flex justify-between items-center px-4 pt-4 relative">
        <h1 className="text-2xl font-bold">Omnia</h1>
        {(prenom && nom) && <p className="text-sm">Bonjour, {prenom} {nom}</p>}

        {/* Cloche notifications */}
        <button
          onClick={() => router.push('/notifications')}
          className="absolute right-4 top-4 text-white relative"
          aria-label="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notifCount > 0 && (
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600" />
          )}
        </button>
      </header>

      {/* Recherche */}
      <div className="px-4 mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            applyFilters(e.target.value, categorieActive, villeFilter, quartierFilter)
          }}
          placeholder="Rechercher un produit ou une catégorie"
          className="w-full p-3 rounded-xl bg-zinc-800 text-white placeholder-zinc-400 outline-none"
        />
      </div>

      {/* Filtres ville/quartier */}
      <div className="px-4 mt-2 flex gap-2">
        <input
          type="text"
          value={villeFilter}
          onChange={(e) => {
            setVilleFilter(e.target.value)
            applyFilters(search, categorieActive, e.target.value, quartierFilter)
          }}
          placeholder="Filtrer par ville"
          className="w-1/2 p-2 rounded-xl bg-zinc-800 text-white"
        />
        <input
          type="text"
          value={quartierFilter}
          onChange={(e) => {
            setQuartierFilter(e.target.value)
            applyFilters(search, categorieActive, villeFilter, e.target.value)
          }}
          placeholder="Filtrer par quartier"
          className="w-1/2 p-2 rounded-xl bg-zinc-800 text-white"
        />
      </div>

      {/* Catégories */}
      <div className="px-4 mt-4 overflow-x-auto whitespace-nowrap scrollbar-hide space-x-2">
        {categories.map((cat, index) => (
          <button
            key={index}
            onClick={() => {
              setCategorieActive(cat)
              applyFilters(search, cat, villeFilter, quartierFilter)
            }}
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
              categorieActive === cat ? 'bg-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tri */}
      <div className="px-4 mt-3">
        <select
          value={sort}
          onChange={(e) => {
            const value = e.target.value as typeof sort
            setSort(value)
            applyFilters(search, categorieActive, villeFilter, quartierFilter, value)
          }}
          className="w-full p-2 rounded-xl bg-zinc-800 text-white"
        >
          <option value="recent">Plus récents</option>
          <option value="prixAsc">Prix croissant</option>
          <option value="prixDesc">Prix décroissant</option>
          <option value="plusLikes">Plus likés</option>
        </select>
      </div>

      {/* Produits */}
      <section className="mt-6 px-4">
        {loading ? (
          // ✨ Skeleton loader
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl p-2 animate-pulse">
                <div className="w-full h-32 bg-zinc-800 rounded-lg mb-2" />
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-1" />
                <div className="h-4 bg-zinc-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-zinc-400 mt-10">Aucun produit trouvé.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {visibleItems.map((produit) => (
                <div key={produit.id} className="bg-zinc-900 rounded-xl p-2 text-sm">
                  {/* Vendeur */}
                  {produit.vendeur && (
                    <div
                      className="flex items-center gap-2 mb-2 cursor-pointer"
                      onClick={() => router.push(`/profil/${produit.user_id}`)}
                    >
                      <img
                        src={produit.vendeur.image || '/default-avatar.png'}
                        alt="Vendeur"
                        className="w-6 h-6 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div className="text-xs font-semibold">
                        {produit.vendeur.prenom}
                        <div className="text-[10px] text-zinc-400">
                          {produit.vendeur.ville}, {produit.vendeur.quartier}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Médias */}
                  <div className="overflow-x-auto flex gap-2 mb-2">
                    {produit.images.length > 0 ? (
                      produit.images.map((media, index) =>
                        media.type === 'video' ? (
                          <video
                            key={index}
                            src={media.url}
                            className="w-44 h-32 object-cover rounded-lg cursor-pointer"
                            onClick={() => router.push(`/produit/${produit.id}`)}
                            muted
                            loop
                            autoPlay
                            preload="metadata"
                          />
                        ) : (
                          <img
                            key={index}
                            src={media.url}
                            alt="produit"
                            className="w-44 h-32 object-cover rounded-lg cursor-pointer"
                            onClick={() => router.push(`/produit/${produit.id}`)}
                            loading="lazy"
                          />
                        )
                      )
                    ) : (
                      <div className="w-44 h-32 bg-zinc-800 flex items-center justify-center rounded-lg text-zinc-500 text-xs">
                        Pas de média
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <h2 className="font-semibold truncate">{produit.nom}</h2>
                  <p className="text-[13px] text-zinc-400">{produit.categorie}</p>
                  <p className="text-green-400 font-bold text-sm">{produit.prix} FCFA</p>

                  {/* Boutons Like + Commentaire */}
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => toggleLike(produit.id)}
                      className="flex items-center gap-1"
                      aria-label={userLikes[produit.id] ? 'Retirer like' : 'Ajouter like'}
                    >
                      <span className="text-xl">
                        {userLikes[produit.id] ? '❤️' : '♡'}
                      </span>
                      <span>{likes[produit.id] || 0}</span>
                    </button>
                    <div className="flex items-center gap-1 text-zinc-400 text-sm">
                      💬 <span>{commentsCount[produit.id] || 0}</span>
                    </div>
                  </div>

                  {/* Partage + Voir + Contacter */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => shareProduit(produit)}
                      className="text-xs bg-blue-700 text-white px-2 py-1 rounded-lg"
                    >
                      Partager
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${produit.nom} - ${produit.prix} FCFA\n${window?.location?.origin || ''}/produit/${produit.id}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs bg-emerald-700 px-2 py-1 rounded-lg"
                    >
                      WhatsApp
                    </a>
                    <button
                      onClick={() => router.push(`/produit/${produit.id}`)}
                      className="text-xs bg-zinc-700 px-2 py-1 rounded-lg ml-auto"
                    >
                      Voir
                    </button>
                  </div>

                  <button
                    onClick={() => router.push(`/messages/${produit.user_id}`)}
                    className="mt-2 w-full text-xs bg-blue-700 text-white py-1 rounded-lg"
                  >
                    Contacter le vendeur
                  </button>
                </div>
              ))}
            </div>

            {/* Charger plus */}
            {visibleCount < filtered.length && (
              <div className="mt-4 flex flex-col items-center">
                <button
                  onClick={() => setVisibleCount(v => Math.min(v + 12, filtered.length))}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
                >
                  Charger plus
                </button>
                <div ref={loadingMoreRef} className="h-4" />
              </div>
            )}
          </>
        )}
      </section>

      {/* Navigation */}
      <nav className="fixed bottom-0 w-full bg-zinc-900 border-t border-zinc-800 text-white flex justify-around py-2 z-50">
        <a href="/">🏠</a>
        <a href="/explorer">🔍</a>
        <a href="/publier" className="text-3xl">➕</a>
        <a href="/messages">💬</a>
        <a href="/profil">👤</a>
      </nav>
    </main>
  )
}
