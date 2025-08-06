'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ProfilPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const profileId = searchParams.get('id')
  const [loading, setLoading] = useState(true)
  const [sessionUser, setSessionUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    ville: '',
    quartier: ''
  })

  const isOwnProfile = !profileId || profileId === sessionUser?.id

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user
      if (!currentUser) return router.push('/auth/login')
      setSessionUser(currentUser)

      const targetUserId = profileId || currentUser.id

      const { data: userInfos, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (userErr || !userInfos) {
        setError("Impossible de charger les infos de l'utilisateur.")
      } else {
        setUserData(userInfos)
      }

      const { data: produits, error: produitsErr } = await supabase
        .from('produits')
        .select(`*, images_produits (url, type)`)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })

      if (!produitsErr) {
        const enrichis = produits.map((prod) => ({
          ...prod,
          medias: (prod.images_produits || []).map((m: any) => {
            const publicUrl = supabase.storage
              .from('produits')
              .getPublicUrl(m.url).data.publicUrl

            return {
              url: publicUrl,
              type: m.type || (m.url?.endsWith('.mp4') || m.url?.endsWith('.webm') ? 'video' : 'image')
            }
          })
        }))
        setProducts(enrichis)
      }

      setLoading(false)
    }

    fetchData()
  }, [profileId, router])

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !sessionUser) return

    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${sessionUser.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('users')
        .update({ image: publicUrl })
        .eq('id', sessionUser.id)

      if (updateError) throw updateError

      setUserData((prev: any) => ({ ...prev, image: publicUrl }))
      alert("✅ Photo de profil mise à jour")
    } catch {
      alert("Erreur lors du changement de la photo")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return
    const { error } = await supabase.from('produits').delete().eq('id', id)
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } else {
      alert("Erreur lors de la suppression")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) return <p className="text-center text-white mt-10">Chargement...</p>
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 pb-24 relative">
      {isOwnProfile && (
        <div className="absolute top-4 right-4">
          <button onClick={() => setShowSettings(!showSettings)} className="text-white text-2xl">⚙️</button>
          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded shadow-md z-10">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-red-400"
              >
                🚪 Se déconnecter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Infos utilisateur */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={userData?.image || '/default-avatar.png'}
          alt="avatar"
          className="w-20 h-20 rounded-full object-cover border cursor-pointer"
          onClick={() => isOwnProfile && fileInputRef.current?.click()}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUploadAvatar}
          className="hidden"
          disabled={uploading}
        />
        <div>
          <p className="text-xl font-bold">{userData?.prenom} {userData?.nom}</p>
          <p className="text-sm text-gray-400">{userData?.email}</p>
          <p className="text-sm">📍 {userData?.ville}, {userData?.quartier}</p>
          <p className="text-sm">📞 {userData?.telephone}</p>
        </div>
      </div>

      {!isOwnProfile && (
        <div className="mb-4">
          <button
            onClick={() => router.push(`/messages/${userData.id}`)}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            💬 Contacter le vendeur
          </button>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4">Mes produits</h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-400 mt-8 italic">
          Cet utilisateur n'a encore publié aucun produit. 😢
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {products.map(prod => (
            <div
              key={prod.id}
              onClick={() => router.push(`/produit/${prod.id}`)}
              className="bg-zinc-800 rounded-xl p-3 relative border border-zinc-700 hover:border-blue-500 transition cursor-pointer"
            >
              <div className="overflow-x-auto flex gap-2 mb-2">
                {prod.medias?.length > 0 ? (
                  prod.medias.map((media: any, index: number) =>
                    media.type === 'video' ? (
                      <div key={index} className="relative w-40 h-28 rounded overflow-hidden">
                        <video src={media.url} className="w-full h-full object-cover" muted autoPlay loop />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const video = e.currentTarget.previousElementSibling as HTMLVideoElement
                            video.muted = !video.muted
                            e.currentTarget.textContent = video.muted ? '🔇' : '🔊'
                          }}
                          className="absolute bottom-1 right-1 text-xs bg-black/60 px-2 py-1 rounded-full text-white z-10"
                        >
                          🔇
                        </button>
                      </div>
                    ) : (
                      <img key={index} src={media.url} alt={prod.nom} className="w-40 h-28 object-cover rounded" />
                    )
                  )
                ) : (
                  <div className="w-full h-28 bg-zinc-700 flex items-center justify-center rounded text-xs text-gray-300">
                    Aucun média
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold truncate">{prod.nom}</h3>
              <p className="text-sm line-clamp-2">{prod.description}</p>
              <p className="text-green-400 font-semibold mt-1">{prod.prix} FCFA</p>
              <p className="text-xs text-gray-400 mt-1">Publié le {new Date(prod.created_at).toLocaleDateString()}</p>

              {isOwnProfile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteProduct(prod.id)
                  }}
                  className="absolute top-2 right-2 text-red-500 font-bold"
                >
                  X
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
