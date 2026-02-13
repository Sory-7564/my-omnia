'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        setError("Lien invalide ou expiré.")
      }
    }

    checkSession()
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setMessage('')

    if (password.length < 6) {
      setError("Mot de passe trop court (min 6 caractères)")
      return
    }

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMessage("Mot de passe mis à jour avec succès 🎉")

    setTimeout(() => {
      router.replace('/')
    }, 2000)
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

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {message && (
          <p className="text-green-500 text-sm text-center">{message}</p>
        )}

        {/* Nouveau mot de passe */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nouveau mot de passe"
            className="w-full p-2 rounded bg-zinc-800 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-gray-400"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Confirmation */}
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Confirmer le mot de passe"
          className="w-full p-2 rounded bg-zinc-800"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 rounded font-semibold disabled:opacity-50"
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
      </form>
    </div>
  )
}
