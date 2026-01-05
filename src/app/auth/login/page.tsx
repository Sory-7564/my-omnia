'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResend, setShowResend] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResendMessage('')
    setShowResend(false)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const user = data.user
    if (!user) {
      setError("Impossible de récupérer les infos utilisateur.")
      setLoading(false)
      return
    }

    if (!user.email_confirmed_at) {
      setError("Veuillez confirmer votre email avant de vous connecter.")
      setShowResend(true)
      setLoading(false)
      return
    }

    // ✅ Login OK
    router.replace('/')
  }

  const handleResendConfirmation = async () => {
    setLoading(true)
    setError('')
    setResendMessage('')

    const { error } = await supabase.auth.resend({ type: 'signup', email })

    if (error) {
      setError("Erreur lors de l'envoi : " + error.message)
    } else {
      setResendMessage("Email de confirmation renvoyé avec succès.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-zinc-900 p-6 rounded-xl space-y-4">
        <h2 className="text-2xl font-bold text-center">Connexion</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {resendMessage && <p className="text-green-500 text-sm text-center">{resendMessage}</p>}

        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full p-2 rounded bg-zinc-800" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" required className="w-full p-2 rounded bg-zinc-800" />

        <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 rounded font-semibold">
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        {showResend && (
          <button type="button" onClick={handleResendConfirmation} className="w-full py-2 bg-yellow-600 rounded font-semibold">
            Renvoyer l’email de confirmation
          </button>
        )}

        <p className="text-center text-sm text-gray-400">
          Pas encore inscrit ? <a href="/auth/register" className="text-blue-400 underline">Créer un compte</a>
        </p>
      </form>
    </div>
  )
             }
