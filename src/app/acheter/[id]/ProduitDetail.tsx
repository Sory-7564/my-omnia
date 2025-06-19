'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Props = {
  id: string
}

export default function ProduitDetail({ id }: Props) {
  const router = useRouter()
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

  if (!produit) return <div className="p-4 text-white bg-black">Chargement...</div>

  return (
    <div className="p-4 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-2">{produit.nom}</h1>
      <p className="mb-2">{produit.description}</p>
      <p className="text-lg font-semibold mb-4">{produit.prix} €</p>

      <button
        onClick={handleContact}
        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
      >
        Contacter le vendeur
      </button>
    </div>
  )
}

