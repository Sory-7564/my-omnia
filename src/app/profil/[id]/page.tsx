'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface Produit {
  id: string
  nom: string
  description: string
  prix: number
  medias: { url: string | null; type: string }[]
}

export default function ProfilAutrePage() {
  const { id } = useParams()
  const router = useRouter()

  const [userData, setUserData] = useState<any>(null)
  const [products, setProducts] = useState<Produit[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setCurrentUser(session?.user || null)

      // Infos utilisateur
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      setUserData(user)

      // Produits
      const { data: produits } = await supabase
        .from('produits')
        .select('id, nom, description, prix')
        .eq('user_id', id)
        .order('created_at', { ascending: false })

      // Charger médias
      const produitsAvecMedias: Produit[] = await Promise.all(
        (produits || []).map(async (prod) => {
          const { data: medias } = await supabase
            .from('images_produits')
            .select('url, type')
            .eq('produit_id', prod.id)

          const mediasAvecUrl = await Promise.all(
            (medias || []).map(async (media) => {
              const { data: signed } = await supabase.storage
                .from('produits')
                .createSignedUrl(media.url, 3600)

              return {
                url: signed?.signedUrl || null,
                type: media.type,
              }
            })
          )

          return {
            ...prod,
            medias: mediasAvecUrl,
          }
        })
      )

      setProducts(produitsAvecMedias)
      setLoading(false)
    }

    fetchData()
  }, [id])

  const handleContact = () => {
    if (id && currentUser?.id && currentUser.id !== id) {
      router.push(`/messages/${id}`)
    } else {
      alert("Vous ne pouvez pas discuter avec vous-même.")
    }
  }

  if (loading) return <p className="text-center mt-10 text-white">Chargement...</p>
  if (!userData) return <p className="text-center mt-10 text-red-500">Utilisateur introuvable.</p>

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 pb-24">
      {/* Infos utilisateur */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={userData.image || '/default-avatar.png'}
          alt="avatar"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <p className="text-xl font-bold">{userData.prenom} {userData.nom}</p>
          <p className="text-sm text-gray-400">{userData.email}</p>
          <p className="text-sm">📍 {userData.ville}, {userData.quartier}</p>
          <p className="text-sm">📞 {userData.telephone}</p>
        </div>
      </div>

      {/* Contacter */}
      {currentUser?.id !== id && (
        <div className="mb-4">
          <button
            onClick={handleContact}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg"
          >
            Contacter
          </button>
        </div>
      )}

      {/* Produits */}
      <h2 className="text-lg font-semibold mb-4">Ses produits</h2>
      {products.length === 0 ? (
        <p className="text-gray-400">Aucun produit publié.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(prod => (
            <div
              key={prod.id}
              onClick={() => router.push(`/produit/${prod.id}`)}
              className="bg-zinc-800 rounded-lg p-3 cursor-pointer hover:border hover:border-blue-500 transition"
            >
              {prod.medias?.[0] && prod.medias[0].url && (
                prod.medias[0].type === 'video' ? (
                  <video
                    controls
                    className="w-full h-40 object-cover rounded mb-2"
                    src={prod.medias[0].url}
                  />
                ) : (
                  <img
                    src={prod.medias[0].url}
                    alt={prod.nom}
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                )
              )}
              <h3 className="text-lg font-bold truncate">{prod.nom}</h3>
              <p className="text-sm line-clamp-2">{prod.description}</p>
              <p className="text-green-400 font-semibold mt-1">{prod.prix} FCFA</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
