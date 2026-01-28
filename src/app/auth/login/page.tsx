'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const confirmed = searchParams.get('confirmed')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showResend, setShowResend] = useState(false)

  useEffect(() => {
    if (confirmed) {
      setMessage("Email confirmé avec succès ! Tu peux te connecter.")
    }
  }, [confirmed])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShowResend(false)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data.user?.email_confirmed_at) {
      setError("Veuillez confirmer votre email.")
      setShowResend(true)
      setLoading(false)
      return
    }

    router.replace('/')
  }

  const resendConfirmation = async () => {
    setLoading(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage("Email de confirmation renvoyé.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-zinc-900 p-6 rounded-xl space-y-4">
        <h2 className="text-2xl font-bold text-center">Connexion</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {message && <p className="text-green-500 text-sm text-center">{message}</p>}

        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full p-2 rounded bg-zinc-800" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" required className="w-full p-2 rounded bg-zinc-800" />

        <button disabled={loading} className="w-full py-2 bg-blue-600 rounded font-semibold">
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        {showResend && (
          <button type="button" onClick={resendConfirmation} className="w-full py-2 bg-yellow-600 rounded font-semibold">
            Renvoyer l’email de confirmation
          </button>
        )}
      </form>
    </div>
  )
}
