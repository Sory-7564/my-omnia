'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    ville: '',
    quartier: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { email, password, nom, prenom, telephone, ville, quartier } = formData

    // Étape 1 : créer le compte Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const userId = signUpData.user?.id
    if (!userId) {
      setError("Erreur lors de la création du compte.")
      setLoading(false)
      return
    }

    // Étape 2 : insérer les infos utilisateur dans la table "users"
    const { error: insertError } = await supabase.from('users').insert({
      id: userId,
      nom,
      prenom,
      email,
      telephone,
      ville,
      quartier,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Succès : inviter l'utilisateur à vérifier son email
    alert("Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte mail.")
    router.push('/auth/login') // Redirige vers la page de connexion
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-zinc-900 p-6 rounded-xl space-y-4">
        <h2 className="text-2xl font-bold text-center">Créer un compte</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="grid grid-cols-2 gap-2">
          <input type="text" name="nom" placeholder="Nom" onChange={handleChange} required className="p-2 rounded bg-zinc-800" />
          <input type="text" name="prenom" placeholder="Prénom" onChange={handleChange} required className="p-2 rounded bg-zinc-800" />
        </div>

        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full p-2 rounded bg-zinc-800" />
        <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required className="w-full p-2 rounded bg-zinc-800" />
        <input type="text" name="telephone" placeholder="Téléphone" onChange={handleChange} required className="w-full p-2 rounded bg-zinc-800" />
        <input type="text" name="ville" placeholder="Ville" onChange={handleChange} required className="w-full p-2 rounded bg-zinc-800" />
        <input type="text" name="quartier" placeholder="Quartier" onChange={handleChange} required className="w-full p-2 rounded bg-zinc-800" />

        <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 rounded font-semibold">
          {loading ? 'Création...' : 'Créer le compte'}
        </button>

        <p className="text-center text-sm text-gray-400">
          Déjà un compte ? <a href="/auth/login" className="text-blue-400 underline">Se connecter</a>
        </p>
      </form>
    </div>
  )
}
