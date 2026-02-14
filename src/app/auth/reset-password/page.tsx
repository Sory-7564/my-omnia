'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') // récupère le token du lien email

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // On utilise le token pour créer une session temporaire
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Lien invalide ou expiré.')
        setChecking(false)
        return
      }

      const { data, error } = await supabase.auth.verifyOtp({ token, type: 'recovery' })

      if (error || !data.session) {
        setError('Lien invalide ou expiré.')
      } else {
        // On met en place la session temporaire pour que updateUser fonctionne
        await supabase.auth.setSession(data.session)
      }

      setChecking(false)
    }

    verifyToken()
  }, [token, supabase])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Mot de passe mis à jour avec succès 🎉')
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    }

    setLoading(false)
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Vérification du lien...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={handleUpdatePassword}
        className="w-full max-w-md bg-zinc-900 p-6 rounded-xl space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">
          Nouveau mot de passe
        </h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center">{success}</p>}

        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full p-2 rounded bg-zinc-800"
        />

        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          className="w-full p-2 rounded bg-zinc-800"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 rounded font-semibold disabled:opacity-50"
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
        </button>
      </form>
    </div>
  )
}
