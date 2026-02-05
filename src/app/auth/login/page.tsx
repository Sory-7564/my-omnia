'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  // ✅ Bloque /login si déjà connecté + écoute confirmation email
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.replace('/')
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
        session
      ) {
        router.replace('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.replace('/')
      return
    }

    setLoading(false)
  }

  // ✅ Mot de passe oublié
  const handleResetPassword = async () => {
    if (!email) {
      setError('Entre ton email pour réinitialiser le mot de passe.')
      return
    }

    setLoading(true)
    setError('')
    setInfo('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setInfo('Email de réinitialisation envoyé 📩')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-zinc-900 p-6 rounded-xl space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Connexion</h2>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        {info && (
          <p className="text-green-500 text-sm text-center">{info}</p>
        )}

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full p-2 rounded bg-zinc-800"
        />

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mot de passe"
          required
          className="w-full p-2 rounded bg-zinc-800"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 rounded font-semibold disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        {/* 🔐 Mot de passe oublié */}
        <button
          type="button"
          onClick={handleResetPassword}
          className="w-full text-sm text-blue-500 hover:underline"
        >
          Mot de passe oublié ?
        </button>

        {/* 🆕 Inscription */}
        <div className="pt-2 border-t border-zinc-800">
          <p className="text-sm text-center text-zinc-400">
            Pas encore de compte ?{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="text-blue-500 font-medium hover:underline"
            >
              S’inscrire
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
