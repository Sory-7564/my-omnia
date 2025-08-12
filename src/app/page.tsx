'use client'

import { useEffect, useState } from 'react'
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

export default function AccueilPage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [filtered, setFiltered] = useState<Produit[]>([])
  const [likes, setLikes] = useState<{ [key: string]: number }>({})
  const [userLikes, setUserLikes] = useState<{ [key: string]: boolean }>({})
  const [commentsCount, setCommentsCount] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [search, setSearch] = useState('')
  const [categorieActive, setCategorieActive] = useState('Tout')
  const [villeFilter, setVilleFilter] = useState('')
  const [quartierFilter, setQuartierFilter] = useState('')
  const [notifCount, setNotifCount] = useState(0) // Notifications non lues dynamiques
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
        const { data: userInfo } = await supabase
          .from('users')
          .select('prenom, nom')
          .eq('id', session.user.id)
          .single()

        if (userInfo) {
          setPrenom(userInfo.prenom)
          setNom(userInfo.nom)
        }

        // produits + enrichissement medias & vendeur
        const { data: produitsData } = await supabase
          .from('produits')
          .select(`
            id, nom, description, prix, categorie, created_at, user_id,
            users (prenom, ville, quartier, image),
            images_produits (url, type)
          `)
          .order('created_at', { ascending: false })

        const enrichis = (produitsData || []).map((p: any) => ({
          ...p,
          vendeur: p.users,
          images: (p.images_produits || []).map((img: any) => {
            const publicUrl = supabase.storage.from('produits').getPublicUrl(img.url).data.publicUrl
            return {
              url: publicUrl,
              type: img.type || (img.url.endsWith('.mp4') ? 'video' : 'image')
            }
          })
        }))

        setProduits(enrichis)
        setFiltered(enrichis)

        // Charger likes depuis la table `aime`
        const { data: aimeData } = await supabase
          .from('aime')
          .select('produit_id, user_id')

        const likesCount: { [key: string]: number } = {}
        const userLikeStatus: { [key: string]: boolean } = {}
        aimeData?.forEach((l: any) => {
          likesCount[l.produit_id] = (likesCount[l.produit_id] || 0) + 1
          if (l.user_id === session.user.id) userLikeStatus[l.produit_id] = true
        })
        setLikes(likesCount)
        setUserLikes(userLikeStatus)

        // Charger nombre de commentaires (tous)
        const { data: commentsData } = await supabase
          .from('commentaires')
          .select('id, produit_id')

        const commentsCountMap: { [key: string]: number } = {}
        commentsData?.forEach((c: any) => {
          commentsCountMap[c.produit_id] = (commentsCountMap[c.produit_id] || 0) + 1
        })
        setCommentsCount(commentsCountMap)

        // Charger notifications non lues dynamiques
        const { data: notifData, error: notifErr } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('lu', false)

        if (notifErr) console.error('Erreur chargement notifications:', notifErr)
        else setNotifCount(notifData?.length || 0)

        // *** Abonnement realtime sur la table `aime` ***
        channelAime = supabase
          .channel('realtime-aime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'aime' },
            (payload: any) => {
              const rec = payload.record
              const ev = payload.eventType
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
                if (rec.user_id === session.user.id && payload.eventType === 'INSERT') {
                  return { ...prev, [rec.produit_id]: true }
                }
                if (rec.user_id === session.user.id && payload.eventType === 'DELETE') {
                  return { ...prev, [rec.produit_id]: false }
                }
                return prev
              })
            }
          )
          .subscribe()

        // *** Abonnement realtime sur la table `notifications` ***
        channelNotif = supabase
          .channel('realtime-notifs')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'notifications' },
            (payload: any) => {
              if (payload.eventType === 'INSERT' && payload.new.user_id === session.user.id) {
                setNotifCount(prev => prev + 1)
              }
              if (
                payload.eventType === 'UPDATE' &&
                payload.new.user_id === session.user.id &&
                payload.new.lu === true
              ) {
                setNotifCount(prev => Math.max(0, prev - 1))
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
          if (supabase.removeChannel) supabase.removeChannel(channelAime)
          if (channelAime.unsubscribe) channelAime.unsubscribe()
        }
        if (channelNotif) {
          if (supabase.removeChannel) supabase.removeChannel(channelNotif)
          if (channelNotif.unsubscribe) channelNotif.unsubscribe()
        }
      } catch (e) {
        // ignore
      }
    }
  }, [])

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

  const applyFilters = (searchText: string, cat: string, ville = '', quartier = '') => {
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

    setFiltered(filtres)
  }

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

      {/* Produits */}
      <section className="mt-6 px-4">
        {loading ? (
          <p className="text-center text-zinc-500">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-zinc-400 mt-10">Aucun produit trouvé.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map((produit) => (
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
                        />
                      ) : (
                        <img
                          key={index}
                          src={media.url}
                          alt="produit"
                          className="w-44 h-32 object-cover rounded-lg cursor-pointer"
                          onClick={() => router.push(`/produit/${produit.id}`)}
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

                <button
                  onClick={() => router.push(`/messages/${produit.user_id}`)}
                  className="mt-2 w-full text-xs bg-blue-700 text-white py-1 rounded-lg"
                >
                  Contacter le vendeur
                </button>
              </div>
            ))}
          </div>
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
