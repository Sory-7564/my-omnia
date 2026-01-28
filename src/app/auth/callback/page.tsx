'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      )

      if (error) {
        console.error(error.message)
        router.replace('/auth/login')
        return
      }

      router.replace('/auth/login?confirmed=1')
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Confirmation de l’email en cours...
    </div>
  )
}
