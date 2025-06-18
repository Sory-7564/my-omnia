'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function NouvelleConversation() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const produitId = searchParams.get('produitId')
  const vendeurId = searchParams.get('vendeurId')
  const [produit, setProduit] = useState<any>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!produitId) return
    const produits = JSON.parse(localStorage.getItem('produits') || '[]')
    const item = produits.find((p: any) => p.id === produitId)
    setProduit(item)
  }, [produitId])

  const handleSendMessage = () => {
    if (!message || !produitId || !vendeurId) return

    // Sauvegarde du message dans localStorage
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]')

    const nouvelleConversation = {
      id: Date.now().toString(),
      produitId,
      vendeurId,
      messages: [
        {
          auteur: 'acheteur', // ou l'id du user actuel si auth
          texte: message,
          date: new Date().toISOString()
        }
      ]
    }

    conversations.push(nouvelleConversation)
    localStorage.setItem('conversations', JSON.stringify(conversations))

    // Redirection vers page des conversations
    router.push('/conversations')
  }

  if (!produit) return <div>Chargement du produit...</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Contacter le vendeur de : {produit.nom}</h2>

      <textarea
        placeholder="Votre message..."
        className="w-full border rounded p-2 mb-4"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={handleSendMessage}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Envoyer
      </button>
    </div>
  )
}
