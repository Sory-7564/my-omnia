'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function PublierPage() {
  const router = useRouter()
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [prix, setPrix] = useState('')
  const [categorie, setCategorie] = useState('')
  const [fichiers, setFichiers] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
      } else {
        router.push('/auth/login')
      }
    }
    getUser()
  }, [router])

  const handleFichierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) setFichiers(Array.from(files))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !nom || !prix || !categorie || fichiers.length === 0) {
      alert("⚠️ Remplis tous les champs et ajoute au moins une image ou vidéo.")
      return
    }

    setLoading(true)

    try {
      // ✅ Convertir prix en nombre
      const prixNumber = parseFloat(prix)
      if (isNaN(prixNumber)) {
        alert("⚠️ Le prix doit être un nombre.")
        setLoading(false)
        return
      }

      // ✅ Insérer produit dans Supabase
      const { data: produitData, error: produitError } = await supabase
        .from('produits')
        .insert({
          nom,
          description,
          prix: prixNumber,
          categorie,
          user_id: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (produitError || !produitData) {
        console.error("❌ Erreur insertion produit :", produitError)
        alert("Erreur lors de la publication.")
        setLoading(false)
        return
      }

      console.log("✅ Produit inséré :", produitData)

      // ✅ Upload des fichiers en parallèle
      const uploadPromises = fichiers.map(async (file) => {
        const ext = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('produits')
          .upload(fileName, file)

        if (uploadError) {
          console.error("❌ Erreur upload fichier :", uploadError)
          return
        }

        const { data: urlData } = supabase.storage
          .from('produits')
          .getPublicUrl(fileName)

        const { error: imageError } = await supabase.from('images_produits').insert({
          produit_id: produitData.id,
          url: fileName, // ✅ on stocke juste le path
          type: file.type.startsWith('video/') ? 'video' : 'image'
        })

        if (imageError) {
          console.error("❌ Erreur insertion image_produits :", imageError)
        }
      })

      await Promise.all(uploadPromises)

      alert("✅ Produit publié avec succès 🎉")
      router.push('/')
    } catch (err) {
      console.error("❌ Erreur générale :", err)
      alert("Erreur inattendue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6 pb-32">
      <h1 className="text-2xl font-bold mb-6">Publier un produit</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nom du produit"
          value={nom}
          onChange={e => setNom(e.target.value)}
          className="w-full p-3 rounded-xl bg-zinc-800 text-white"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full p-3 rounded-xl bg-zinc-800 text-white"
          required
        />
        <input
          type="number"
          placeholder="Prix"
          value={prix}
          onChange={e => setPrix(e.target.value)}
          className="w-full p-3 rounded-xl bg-zinc-800 text-white"
          required
        />

        <select
          value={categorie}
          onChange={e => setCategorie(e.target.value)}
          className="w-full p-3 rounded-xl bg-zinc-800 text-white"
          required
        >
          <option value="">Choisir une catégorie</option>
          {[
            'Électronique', 'Vêtements', 'Maison', 'Auto', 'Gaming', 'Sport',
            'Cuisine', 'Livres', 'Outils', 'Nourriture', 'Bijoux', 'Bricolage',
            'Animaux', 'Voitures', 'Autres'
          ].map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFichierChange}
          className="w-full p-3 bg-zinc-800 rounded-xl text-white"
          required
        />

        {/* ✅ Prévisualisation */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {fichiers.map((f, i) => (
            <div key={i} className="relative">
              {f.type.startsWith('image') ? (
                <img src={URL.createObjectURL(f)} className="h-24 w-full object-cover rounded-lg" />
              ) : (
                <video src={URL.createObjectURL(f)} className="h-24 w-full object-cover rounded-lg" controls />
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl"
        >
          {loading ? 'Publication...' : 'Publier'}
        </button>
      </form>
    </main>
  )
}





