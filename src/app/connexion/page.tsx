'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');

  const connecter = () => {
    const utilisateurs = JSON.parse(localStorage.getItem('utilisateurs') || '[]');
    const utilisateur = utilisateurs.find((u: any) => u.email === email && u.motDePasse === motDePasse);

    if (utilisateur) {
      localStorage.setItem('utilisateurConnecte', JSON.stringify(utilisateur));
      router.push('/');
    } else {
      setErreur('Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Connexion</h1>
      <input className="w-full mb-2 p-2 border" type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input className="w-full mb-2 p-2 border" type="password" placeholder="Mot de passe" onChange={e => setMotDePasse(e.target.value)} />
      {erreur && <p className="text-red-500">{erreur}</p>}
      <button className="w-full bg-green-500 text-white py-2 mt-4" onClick={connecter}>Se connecter</button>
    </div>
  );
}
