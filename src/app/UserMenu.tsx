'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function UserMenu() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (!user) return null

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      right: 20,
      background: '#111',
      color: 'white',
      padding: '10px 15px',
      borderRadius: 8,
      border: '1px solid #444',
    }}>
      Bonjour, {user.user_metadata?.prenom || user.email}
      <button
        onClick={handleLogout}
        style={{
          marginLeft: 10,
          padding: '4px 8px',
          background: '#e11d48',
          border: 'none',
          borderRadius: 4,
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Déconnexion
      </button>
    </div>
  )
}
