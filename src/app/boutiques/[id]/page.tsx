'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type Produit = {
  id: string;
  nom: string;
  prix: string;
  description: string;
  photo: string;
  categorie: string;
  boutiqueId: string | null;
};

type Boutique = {
  id: string;
  nom: string;
  logo: string;
  categorie: string;
  description: string;
};

export default function BoutiquePage() {
  const { id } = useParams();

  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [panier, setPanier] = useState<Produit[]>([]);

  useEffect(() => {
    // Ne s'exécute que côté client (navigateur)
    if (typeof window === 'undefined') return;

    // Charger la boutique depuis le localStorage
    const boutiqueStorage = localStorage.getItem('ma-boutique');
    if (boutiqueStorage) {
      const boutiqueData: Boutique = JSON.parse(boutiqueStorage);
      if (boutiqueData.id === id) {
        setBoutique(boutiqueData);
      } else {
        setBoutique(null);
      }
    } else {
      setBoutique(null);
    }

    // Charger les produits de la boutique
    const produitsStorage = localStorage.getItem('produits');
    if (produitsStorage) {
      const produitsData: Produit[] = JSON.parse(produitsStorage);
      const produitsBoutique = produitsData.filter(p => p.boutiqueId === id);
      setProduits(produitsBoutique);
    } else {
      setProduits([]);
    }

    // Charger le panier
    const panierStorage = localStorage.getItem('panier');
    if (panierStorage) {
      setPanier(JSON.parse(panierStorage));
    } else {
      setPanier([]);
    }
  }, [id]);

  // Ajouter produit au panier en évitant les doublons
  const ajouterAuPanier = (produit: Produit) => {
    if (panier.find(p => p.id === produit.id)) {
      alert(`Le produit "${produit.nom}" est déjà dans le panier.`);
      return;
    }
    const nouveauPanier = [...panier, produit];
    setPanier(nouveauPanier);
    localStorage.setItem('panier', JSON.stringify(nouveauPanier));
    alert(`Produit "${produit.nom}" ajouté au panier !`);
  };

  if (!boutique) {
    return (
      <main className="min-h-screen bg-black text-white p-6 font-sans flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Boutique non trouvée</h1>
        <p>Cette boutique n'existe pas ou n'a pas encore été créée.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 font-sans">
      <section className="mb-8 flex items-center gap-6">
        {boutique.logo && (
          <img
            src={boutique.logo}
            alt={`Logo de ${boutique.nom}`}
            className="w-24 h-24 rounded object-cover"
          />
        )}
        <div>
          <h1 className="text-4xl font-bold">{boutique.nom}</h1>
          <p className="italic text-gray-400">{boutique.categorie}</p>
          <p className="mt-2 max-w-lg">{boutique.description}</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Produits disponibles</h2>
        {produits.length === 0 && (
          <p>Aucun produit disponible pour cette boutique.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {produits.map((produit) => (
            <div
              key={produit.id}
              className="bg-gray-900 p-4 rounded shadow-md flex flex-col"
            >
              <img
                src={produit.photo}
                alt={produit.nom}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h3 className="text-xl font-semibold">{produit.nom}</h3>
              <p className="text-green-400 font-bold mb-2">{produit.prix} €</p>
              <p className="flex-grow">{produit.description}</p>
              <button
                onClick={() => ajouterAuPanier(produit)}
                className="mt-4 bg-green-700 hover:bg-green-600 text-white py-2 rounded font-bold"
              >
                Ajouter au panier
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
