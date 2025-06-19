import { Metadata } from 'next'

export default function Head({ params }: { params: { id: string } }): Metadata {
  return {
    title: `Produit ${params.id}`,
  }
}
