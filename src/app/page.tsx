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
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [search, setSearch] = useState('')
  const [categorieActive, setCategorieActive] = useState('Tout')
  const [villeFilter, setVilleFilter] = useState('')
  const [quartierFilter, setQuartierFilter] = useState('')
  const router = useRouter()

  const categories = [
    'Tout', 'Nourriture', 'Électronique', 'Vêtements', 'Chaussures', 'Maison',
    'Auto', 'Gaming', 'Sport', 'Cuisine', 'Livres', 'Outils', 'Bijoux', 'Animaux', 'Autres'
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          router.push('/auth/login')
          return
        }
        setUser(session.user)

        const { data: userInfo } = await supabase
          .from('users')
          .select('prenom, nom')
          .eq('id', session.user.id)
          .single()

        if (userInfo) {
          setPrenom(userInfo.prenom)
          setNom(userInfo.nom)
        }

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
      } catch (err) {
        console.error('Erreur chargement accueil:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
      <header className="flex justify-between items-center px-4 pt-4">
        <h1 className="text-2xl font-bold">Omnia</h1>
        {(prenom && nom) && <p className="text-sm">Bonjour, {prenom} {nom}</p>}
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
