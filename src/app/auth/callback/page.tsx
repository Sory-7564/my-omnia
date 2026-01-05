'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState(
    "Confirmation de l’email en cours..."
  )

  useEffect(() => {
    const handleAuth = async () => {
      /**
       * Supabase récupère automatiquement le token présent dans l’URL
       * et crée la session
       */
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        console.error('Erreur callback:', error)
        setMessage("Erreur de confirmation. Veuillez vous reconnecter.")
        setTimeout(() => router.replace('/auth/login'), 2000)
        return
      }

      // ✅ Email confirmé + session créée
      router.replace('/')
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-sm text-gray-300">{message}</p>
    </div>
  )
}
