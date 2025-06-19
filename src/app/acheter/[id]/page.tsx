import ProduitDetail from './ProduitDetail'

export default function Page({ params }: { params: { id: string } }) {
  return <ProduitDetail id={params.id} />
}

// Ceci est essentiel pour les pages dynamiques
export async function generateStaticParams() {
  return []
}
