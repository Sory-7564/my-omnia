'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const confirm = async () => {
      const { error } =
        await supabase.auth.exchangeCodeForSession(window.location.href)

      if (!error) {
        router.replace('/')
      } else {
        router.replace('/login')
      }
    }

    confirm()
  }, [router])

  return <p>Confirmation de l’email en cours...</p>
}
