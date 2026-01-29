'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      // 🔑 Récupère la session depuis l’URL
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
        router.replace('/auth/login')
        return
      }

      if (data.session) {
        // ✅ Email confirmé + session active
        router.replace('/auth/login?confirmed=true')
      } else {
        // ❌ Pas de session → login
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
