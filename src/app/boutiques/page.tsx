'use client';

import { useEffect, useState } from 'react';

type Boutique = {
  id: string;
  nom: string;
  logo: string;
  categorie: string;
  description: string;
  date: string;
};

export default function BoutiquesPage() {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('boutiques');
    if (data) {
      setBoutiques(JSON.parse(data));
    }
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">Les boutiques</h1>

      {boutiques.length === 0 ? (
        <p>Aucune boutique trouvée.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {boutiques.map((boutique) => (
            <div key={boutique.id} className="bg-gray-900 p-4 rounded-lg shadow-lg">
              <img
                src={boutique.logo}
                alt={boutique.nom}
                className="w-full h-40 object-cover rounded mb-4"
              />
              <h2 className="text-xl font-bold mb-2">{boutique.nom}</h2>
              <p className="text-sm text-gray-300 mb-1">
                <strong>Catégorie:</strong> {boutique.categorie}
              </p>
              <p className="text-gray-400 text-sm">{boutique.description}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}