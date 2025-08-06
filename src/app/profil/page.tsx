import { Suspense } from 'react'
import ProfilContent from './ProfilContent'

export default function ProfilPage() {
  return (
    <Suspense fallback={<div className="text-white p-4">Chargement du profil...</div>}>
      <ProfilContent />
    </Suspense>
  )
}
