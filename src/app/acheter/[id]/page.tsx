import ProduitDetail from './ProduitDetail'

type PageProps = {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  return <ProduitDetail id={params.id} />
}

