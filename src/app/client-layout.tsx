'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideNavbar = pathname.startsWith('/auth')

  return (
    <div className="min-h-screen pb-24">
      {children}

      {!hideNavbar && (
        <nav className="fixed bottom-0 w-full bg-zinc-900 border-t border-zinc-800 text-white flex justify-around py-2 z-50">
          <Link href="/" className="text-xl">🏠</Link>
          <Link href="/livraison" className="text-xl">🛵</Link>
          <Link href="/publier" className="text-3xl">➕</Link>
          <Link href="/messages" className="text-xl">💬</Link>
          <Link href="/profil" className="text-xl">👤</Link>
        </nav>
      )}
    </div>
  )
}
