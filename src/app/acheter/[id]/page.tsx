'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [produit, setProduit] = useState<any>(null)

  useEffect(() => {
    const produits = JSON.parse(localStorage.getItem('produits') || '[]')
    const item = produits.find((p: any) => p.id === params.id)
    setProduit(item)
  }, [params.id])

  const handleContact = () => {
    if (!produit) return
    // Redirige vers une page de conversation (ex: /conversations/new?vendeur=xyz)
    router.push(`/conversations/new?produitId=${produit.id}&vendeurId=${produit.vendeurId}`)
  }

  if (!produit) return <div>Chargement...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{produit.nom}</h1>
      <p>{produit.description}</p>
      <p className="text-lg font-semibold">{produit.prix} €</p>

      {/* Bouton pour contacter */}
      <button
        onClick={handleContact}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Contacter le vendeur
      </button>
    </div>
  )
}
