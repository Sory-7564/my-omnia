'use client'

import { useState } from 'react'

export default function LivraisonPage() {
  const numeroContact = '+22375646428'

  const [colis, setColis] = useState('')
  const [description, setDescription] = useState('')
  const [depart, setDepart] = useState('')
  const [telDepart, setTelDepart] = useState('')
  const [destination, setDestination] = useState('')
  const [telDestination, setTelDestination] = useState('')

  const estNumeroValide = (numero: string) => {
    return /^[0-9]{8,15}$/.test(numero)
  }

  const envoyerWhatsApp = () => {
    if (!confirm("Confirmer l'envoi de la demande de livraison ?")) return

    const date = new Date().toLocaleString()

    const message = `Bonjour 👋
Je souhaite une livraison via *Omnia* à Bamako.

📦 Colis : ${colis}
📝 Détails : ${description || 'Aucun détail fourni'}

🏠 Départ : ${depart}
📞 Numéro à appeler : ${telDepart}

🎯 Destination : ${destination}
📞 Numéro à appeler : ${telDestination}

🕒 Date : ${date}`

    const lien = `https://wa.me/${numeroContact.replace('+', '')}?text=${encodeURIComponent(message)}`
    window.open(lien, '_blank')
  }

  const formulaireValide =
    colis &&
    depart &&
    telDepart &&
    destination &&
    telDestination &&
    estNumeroValide(telDepart) &&
    estNumeroValide(telDestination)

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-6 pb-40">
      <h1 className="text-2xl font-bold">📦 Livraison – Bamako</h1>

      <div className="bg-zinc-900 p-4 rounded-xl space-y-4 shadow-lg">
        <p className="text-sm text-zinc-400">
          Remplis les informations ci-dessous pour programmer une livraison avec Omnia.
        </p>

        <input
          value={colis}
          onChange={(e) => setColis(e.target.value)}
          placeholder="Nom du colis (ex: chaussures, téléphone...)"
          className="w-full p-3 rounded-lg bg-zinc-800 text-white placeholder-zinc-400"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description ou détails du colis (facultatif)"
          className="w-full p-3 rounded-lg bg-zinc-800 text-white placeholder-zinc-400"
        />

        <input
          value={depart}
          onChange={(e) => setDepart(e.target.value)}
          placeholder="Lieu de départ"
          className="w-full p-3 rounded-lg bg-zinc-800 text-white placeholder-zinc-400"
        />

        <input
          type="tel"
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
          type="tel"
          value={telDestination}
          onChange={(e) => setTelDestination(e.target.value)}
          placeholder="Numéro à appeler (destination)"
          className="w-full p-3 rounded-lg bg-zinc-800 text-white placeholder-zinc-400"
        />

        {!estNumeroValide(telDepart) && telDepart && (
          <p className="text-red-400 text-sm">Numéro de départ invalide</p>
        )}

        {!estNumeroValide(telDestination) && telDestination && (
          <p className="text-red-400 text-sm">Numéro de destination invalide</p>
        )}

        <button
          onClick={envoyerWhatsApp}
          disabled={!formulaireValide}
          className="w-full px-4 py-3 rounded-lg bg-green-600 text-white font-semibold disabled:opacity-50 hover:bg-green-700 transition"
        >
          Envoyer sur WhatsApp
        </button>
      </div>
    </div>
  )
}
