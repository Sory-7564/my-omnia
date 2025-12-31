'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResendMessage('')
    setShowResend(false)

    // Tentative de connexion
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      if (signInError.message.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre adresse email avant de vous connecter.')
        setShowResend(true)
      } else {
        setError(signInError.message)
      }
      setLoading(false)
      return
    }

    // Récupérer la session à jour après confirmation
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      setError('Erreur lors de la récupération de la session.')
      setLoading(false)
      return
    }

    const user = sessionData.session?.user

    if (!user) {
      setError('Impossible de récupérer les informations utilisateur.')
      setLoading(false)
      return
    }

    if (!user.email_confirmed_at) {
      // Email non confirmé → message + possibilité de renvoyer
      setError('Veuillez confirmer votre adresse email avant de vous connecter.')
      setShowResend(true)
      setLoading(false)
      return
    }

    // Email confirmé → redirection vers l’accueil
    router.replace('/')
  }

  const handleResendConfirmation = async () => {
    setLoading(true)
    setResendMessage('')
    setError('')

    const { error } = await supabase.auth.resend({ type: 'signup', email })

    if (error) {
      setResendMessage("Erreur lors de l'envoi : " + error.message)
    } else {
      setResendMessage('Email de confirmation renvoyé avec succès.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-zinc-900 p-6 rounded-xl space-y-4">
        <h2 className="text-2xl font-bold text-center">Connexion</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {resendMessage && <p className="text-green-500 text-sm text-center">{resendMessage}</p>}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full p-2 rounded bg-zinc-800"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          required
          className="w-full p-2 rounded bg-zinc-800"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 rounded font-semibold"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        {showResend && (
          <button
            type="button"
            onClick={handleResendConfirmation}
            className="w-full py-2 bg-yellow-600 rounded font-semibold"
          >
            Renvoyer l’email de confirmation
          </button>
        )}

        <p className="text-center text-sm text-gray-400">
          Pas encore inscrit ?{' '}
          <a href="/auth/register" className="text-blue-400 underline">
            Créer un compte
          </a>
        </p>
      </form>
    </div>
  )
}
