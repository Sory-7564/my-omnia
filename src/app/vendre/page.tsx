'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Vendre() {
  const [mode, setMode] = useState<'choix' | 'produit' | 'boutique'>('choix');

  // État produit
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [categorie, setCategorie] = useState('');

  // État boutique
  const [nomBoutique, setNomBoutique] = useState('');
  const [logo, setLogo] = useState('');
  const [categorieBoutique, setCategorieBoutique] = useState('');
  const [descriptionBoutique, setDescriptionBoutique] = useState('');

  // Soumettre un produit
  const handleSubmitProduit = (e: React.FormEvent) => {
    e.preventDefault();

    const boutiqueActuelle = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('ma-boutique') || 'null')
      : null;

    const nouveauProduit = {
      id: uuidv4(),
      nom,
      prix,
      description,
      photo,
      categorie,
      date: new Date().toISOString(),
      boutiqueId: boutiqueActuelle?.id || null,
      vendeurId: boutiqueActuelle?.id || 'demo-vendeur', // ✅ Ajouté ici
    };

    const produitsExistants = JSON.parse(localStorage.getItem('produits') || '[]');
    produitsExistants.push(nouveauProduit);
    localStorage.setItem('produits', JSON.stringify(produitsExistants));

    setNom('');
    setPrix('');
    setDescription('');
    setPhoto('');
    setCategorie('');
    alert('Produit publié !');
    setMode('choix');
  };

  // Soumettre une boutique
  const handleSubmitBoutique = (e: React.FormEvent) => {
    e.preventDefault();

    const nouvelleBoutique = {
      id: uuidv4(),
      nom: nomBoutique,
      logo,
      categorie: categorieBoutique,
      description: descriptionBoutique,
      date: new Date().toISOString(),
    };

    localStorage.setItem('ma-boutique', JSON.stringify(nouvelleBoutique));
    alert('Boutique créée avec succès !');
    setMode('choix');
  };

  // Choix de création
  if (mode === 'choix') {
    return (
      <main className="min-h-screen bg-black text-white p-6 font-sans flex flex-col items-center justify-center gap-6">
        <h1 className="text-2xl font-bold text-center">Que souhaitez-vous faire ?</h1>
        <button
          onClick={() => setMode('produit')}
          className="bg-green-700 p-4 rounded text-white font-bold w-full max-w-md hover:bg-green-600"
        >
          Publier juste un produit à vendre
        </button>
        <button
          onClick={() => setMode('boutique')}
          className="bg-blue-700 p-4 rounded text-white font-bold w-full max-w-md hover:bg-blue-600"
        >
          Ouvrir une boutique
        </button>
      </main>
    );
  }

  // Formulaire produit
  if (mode === 'produit') {
    return (
      <main className="min-h-screen bg-black text-white p-6 font-sans">
        <h1 className="text-2xl font-bold mb-4">Publier un produit à vendre</h1>
        <form onSubmit={handleSubmitProduit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom du produit"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="block w-full p-2 rounded bg-gray-800"
            required
          />
          <input
            type="text"
            placeholder="Prix"
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
            className="block w-full p-2 rounded bg-gray-800"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full p-2 rounded bg-gray-800"
            required
          />
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="block w-full p-2 rounded bg-gray-800"
            required
          >
            <option value="">Choisir une catégorie</option>
            <option value="vêtements">Vêtements</option>
            <option value="téléphones">Téléphones</option>
            <option value="alimentation">Alimentation</option>
            <option value="accessoires">Accessoires</option>
            <option value="meubles">Meubles</option>
            <option value="électroménager">Électroménager</option>
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setPhoto(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="block w-full p-2 rounded bg-gray-800"
            required
          />
          {photo && (
            <img src={photo} alt="Aperçu" className="mt-2 w-32 h-32 object-cover rounded" />
          )}
          <button
            type="submit"
            className="w-full bg-green-700 p-3 rounded text-white font-bold hover:bg-green-600"
          >
            Publier
          </button>
        </form>
      </main>
    );
  }

  // Formulaire boutique
  if (mode === 'boutique') {
    return (
      <main className="min-h-screen bg-black text-white p-6 font-sans">
        <h1 className="text-2xl font-bold mb-4">Créer votre boutique</h1>
        <form onSubmit={handleSubmitBoutique} className="space-y-4">
          <input
            type="text"
            placeholder="Nom de la boutique"
            value={nomBoutique}
            onChange={(e) => setNomBoutique(e.target.value)}
            className="block w-full p-2 rounded bg-gray-800"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setLogo(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="block w-full p-2 rounded bg-gray-800"
            required
          />
          <select
            value={categorieBoutique}
            onChange={(e) => setCategorieBoutique(e.target.value)}
            className="block w-full p-2 rounded bg-gray-800"
            required
          >
            <option value="">Choisir une catégorie</option>
            <option value="vêtements">Vêtements</option>
            <option value="électronique">Électronique</option>
            <option value="alimentation">Alimentation</option>
            <option value="autre">Autre</option>
          </select>
          <textarea
            placeholder="Description de la boutique"
            value={descriptionBoutique}
            onChange={(e) => setDescriptionBoutique(e.target.value)}
            className="block w-full p-2 rounded bg-gray-800"
            required
          />
          {logo && (
            <img src={logo} alt="Logo" className="mt-2 w-24 h-24 object-cover rounded" />
          )}
          <button
            type="submit"
            className="w-full bg-blue-700 p-3 rounded text-white font-bold hover:bg-blue-600"
          >
            Créer la boutique
          </button>
        </form>
      </main>
    );
  }
}
