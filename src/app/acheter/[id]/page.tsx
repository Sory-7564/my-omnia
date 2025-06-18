type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  return (
    <div>
      <h1>Produit ID : {params.id}</h1>
    </div>
  );
}
