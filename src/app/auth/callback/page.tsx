'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleCallback = async () => {
      const code = searchParams.get('code')

      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
        router.replace('/')
      } else {
        router.replace('/auth/login')
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-black">
      Confirmation en cours...
    </div>
  )
}
