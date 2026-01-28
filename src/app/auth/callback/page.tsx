'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const confirm = async () => {
      const { error } = await supabase.auth.getSession()

      if (error) {
        console.error('Callback error:', error.message)
        router.replace('/auth/login')
        return
      }

      router.replace('/auth/login?confirmed=1')
    }

    confirm()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Confirmation de l’email en cours...
    </div>
  )
}
