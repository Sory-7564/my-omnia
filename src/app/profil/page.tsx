// app/profil/page.tsx
import { Suspense } from 'react'
import ProfilContent from './ProfilContent'

export default function ProfilPage() {
  return (
    <Suspense fallback={<div>Chargement du profil...</div>}>
      <ProfilContent />
    </Suspense>
  )
}
