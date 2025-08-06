'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function ParametresPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) router.push('/auth/login')
      else setUser(session.user)
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <div className="space-y-4">
        <button
          onClick={() => router.push('/parametres/profil')}
          className="w-full p-4 bg-zinc-800 rounded hover:bg-zinc-700 text-left"
        >
          ✏️ Modifier le profil
        </button>

        <button
          onClick={() => router.push('/parametres/theme')}
          className="w-full p-4 bg-zinc-800 rounded hover:bg-zinc-700 text-left"
        >
          🎨 Choisir un thème
        </button>

        <button
          onClick={() => router.push('/parametres/historique')}
          className="w-full p-4 bg-zinc-800 rounded hover:bg-zinc-700 text-left"
        >
          📜 Historique d'activité
        </button>

        <button
          onClick={handleLogout}
          className="w-full p-4 bg-red-600 rounded hover:bg-red-500 text-left"
        >
          🔓 Se déconnecter
        </button>
      </div>
    </main>
  )
}
