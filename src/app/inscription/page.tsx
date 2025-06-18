'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InscriptionPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');

  const inscrire = () => {
    if (!email || !motDePasse) {
      setErreur('Tous les champs sont obligatoires.');
      return;
    }

    // Vérifier si l'utilisateur existe déjà
    const utilisateurs = JSON.parse(localStorage.getItem('utilisateurs') || '[]');
    if (utilisateurs.find((u: any) => u.email === email)) {
      setErreur('Cet email est déjà utilisé.');
      return;
    }

    utilisateurs.push({ email, motDePasse });
    localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
    router.push('/connexion');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Inscription</h1>
      <input className="w-full mb-2 p-2 border" type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input className="w-full mb-2 p-2 border" type="password" placeholder="Mot de passe" onChange={e => setMotDePasse(e.target.value)} />
      {erreur && <p className="text-red-500">{erreur}</p>}
      <button className="w-full bg-blue-500 text-white py-2 mt-4" onClick={inscrire}>S'inscrire</button>
    </div>
  );
}
