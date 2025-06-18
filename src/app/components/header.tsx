'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [connecte, setConnecte] = useState(false);

  useEffect(() => {
    const utilisateur = localStorage.getItem('utilisateurConnecte');
    setConnecte(!!utilisateur);
  }, []);

  const deconnecter = () => {
    localStorage.removeItem('utilisateurConnecte');
    router.push('/connexion');
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-gray-100 shadow-md">
      <h1 className="text-xl font-bold">Omnia</h1>
      {connecte && (
        <button onClick={deconnecter} className="text-red-500 border px-3 py-1 rounded">
          Déconnexion
        </button>
      )}
    </header>
  );
}
