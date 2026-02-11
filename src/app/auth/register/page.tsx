'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    ville: '',
    quartier: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { nom, prenom, email, password, telephone, ville, quartier } = formData

    try {
      // 1️⃣ Création du compte Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nom, prenom, telephone, ville, quartier } },
      })

      if (signUpError) throw signUpError
      if (!data.user?.id) throw new Error("Impossible de créer l'utilisateur.")

      // 2️⃣ Insertion dans la table users
      const { error: insertError } = await supabase.from('users').insert({
        id: data.user.id,
        nom,
        prenom,
        email,
        telephone,
        ville,
        quartier,
      })

      if (insertError) throw insertError

      setMessage("Compte créé ! Vérifie ton email pour confirmer ton compte.")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-zinc-900 p-6 rounded-xl space-y-4 mx-auto mt-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Créer un compte</h2>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        {message && (
          <p className="text-green-500 text-sm text-center">{message}</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <input
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Nom"
            className="p-2 rounded bg-zinc-800 text-white"
            required
          />
          <input
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            placeholder="Prénom"
            className="p-2 rounded bg-zinc-800 text-white"
            required
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="p-2 rounded bg-zinc-800 text-white"
            required
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mot de passe"
            className="p-2 rounded bg-zinc-800 text-white"
            required
          />
          <input
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="Téléphone"
            className="p-2 rounded bg-zinc-800 text-white"
          />
          <input
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            placeholder="Ville"
            className="p-2 rounded bg-zinc-800 text-white"
          />
          <input
            name="quartier"
            value={formData.quartier}
            onChange={handleChange}
            placeholder="Quartier"
            className="p-2 rounded bg-zinc-800 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 rounded font-semibold disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer le compte'}
        </button>

        <p className="text-center text-sm text-gray-400">
          Déjà un compte ?{' '}
          <Link className="text-blue-400" href="/auth/login">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  )
}
