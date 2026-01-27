'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Confirmation en cours...')

  useEffect(() => {
    const confirmEmail = async () => {
      const access_token = searchParams.get('access_token')
      const refresh_token = searchParams.get('refresh_token')

      if (!access_token || !refresh_token) {
        setMessage("Impossible de confirmer l'e-mail. Lien invalide.")
        return
      }

      // On met la session pour que Supabase confirme l'utilisateur
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token
      })

      if (error) {
        setMessage("Erreur lors de la confirmation : " + error.message)
        return
      }

      setMessage("Email confirmé avec succès ! Redirection...")
      // Laisser l'utilisateur voir le message 2s puis rediriger
      setTimeout(() => {
        router.replace('/auth/login?confirmed=1')
      }, 2000)
    }

    confirmEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <p className="text-center text-lg">{message}</p>
    </div>
  )
}
