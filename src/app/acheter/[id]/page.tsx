import ProduitDetail from './ProduitDetail'
import { Metadata } from 'next'

export const generateMetadata = ({ params }: { params: { id: string } }): Metadata => {
  return {
    title: `Produit ${params.id}`,
  }
}

export default function Page({ params }: { params: { id: string } }) {
  return <ProduitDetail id={params.id} />
}


