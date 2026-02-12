'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ClientCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        if (code) {
          // Échange le code pour créer la session
          await supabase.auth.exchangeCodeForSession(code)
          router.replace('/') // redirige vers la page d'accueil
        } else {
          router.replace('/auth/login') // si pas de code, retourne login
        }
      } catch (err) {
        console.error('Erreur lors du callback Supabase:', err)
        router.replace('/auth/login')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-black">
      Confirmation en cours...
    </div>
  )
}
