import { Metadata } from 'next';

type Props = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Produit ${params.id}`,
  };
}

export default async function Page({ params }: Props) {
  const { id } = params;

  return (
    <div>
      <h1>Produit ID : {id}</h1>
    </div>
  );
}
