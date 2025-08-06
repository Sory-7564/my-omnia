'use client'

import { useState } from 'react'

export default function LivraisonPage() {
  const numeroContact = '+22375646428'

  const [colis, setColis] = useState('')
  const [depart, setDepart] = useState('')
  const [telDepart, setTelDepart] = useState('')
  const [destination, setDestination] = useState('')
  const [telDestination, setTelDestination] = useState('')

  const envoyerWhatsApp = () => {
    const message = `Bonjour 👋\nJe souhaite une livraison à Bamako.\n\n📦 Colis : ${colis}\n\n🏠 Départ : ${depart}\n📞 Numéro à appeler : ${telDepart}\n\n🎯 Destination : ${destination}\n📞 Numéro à appeler : ${telDestination}`

    const lien = `https://wa.me/${numeroContact.replace('+', '')}?text=${encodeURIComponent(message)}`
    window.open(lien, '_blank')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-6 pb-40">
      <h1 className="text-2xl font-bold">📦 Livraison – Bamako</h1>

      <div className="bg-zinc-900 p-4 rounded-xl space-y-4">
        <p className="text-sm text-zinc-400">Remplis les informations ci-dessous :</p>

        <input
          value={colis}
          onChange={(e) => setColis(e.target.value)}
          placeholder="Nom du colis"
          className="w-full p-3 rounded-lg bg-zinc-800 text-white placeholder-zinc-400"
        />

        <input
          value={depart}
          onChange={(e) => setDepart(e.target.value)}
          placeholder="Lieu de départ"
          className="w-full p-3 rounded-lg bg-zinc-800 text-white placeholder-zinc-400"
        />

        <input
          value={telDepart}
          onChange={(e) => setTelDepart(e.target.value)}
          placeholder="Numéro à appeler (départ)"
          className="w-full p-3 rounded-lg bg-zinc-800 text-white placeholder-zinc-400"
        />

        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Lieu de destination"
          className="w-full p-3 rounded-lg bg-zinc-800 text-white placeholder-zinc-400"
        />

        <input
          value={telDestination}
          onChange={(e) => setTelDestination(e.target.value)}
          placeholder="Numéro à appeler (destination)"
          className="w-full p-3 rounded-lg bg-zinc-800 text-white placeholder-zinc-400"
        />

        <button
          onClick={envoyerWhatsApp}
          disabled={!colis || !depart || !telDepart || !destination || !telDestination}
          className="w-full px-4 py-3 rounded-lg bg-green-600 text-white font-semibold disabled:opacity-50"
        >
          Envoyer sur WhatsApp
        </button>
      </div>
    </div>
  )
}

