'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [produit, setProduit] = useState<any>(null)

  useEffect(() => {
    const produits = JSON.parse(localStorage.getItem('produits') || '[]')
    const item = produits.find((p: any) => p.id === id)
    setProduit(item)
  }, [id])

  const handleContact = () => {
    if (!produit) return
    router.push(`/conversations/new?produitId=${produit.id}&vendeurId=${produit.vendeurId}`)
  }

  if (!produit) return <div>Chargement...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{produit.nom}</h1>
      <p>{produit.description}</p>
      <p className="text-lg font-semibold">{produit.prix} €</p>

      <button
        onClick={handleContact}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Contacter le vendeur
      </button>
    </div>
  )
}

