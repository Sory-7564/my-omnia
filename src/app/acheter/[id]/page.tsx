import ProduitDetail from './ProduitDetail'
import type { Metadata } from 'next'

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  return {
    title: `Produit ${params.id}`,
  }
}

export default function Page({ params }: { params: { id: string } }) {
  return <ProduitDetail id={params.id} />
}
