import { Metadata } from 'next'
import ProduitDetail from './ProduitDetail'

type PageProps = {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Produit ${params.id}`,
  }
}

export default async function Page({ params }: PageProps) {
  return <ProduitDetail id={params.id} />
}

