type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  return (
    <div>
      <h1>ID du produit : {params.id}</h1>
    </div>
  );
}
