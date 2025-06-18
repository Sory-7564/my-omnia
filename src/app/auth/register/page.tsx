'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    password: '',
    confirmPassword: '',
    ville: '',
    quartier: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // ✅ Alerte pour confirmer l'adresse email
    if (data?.user) {
      alert("Inscription réussie ! Vérifie ta boîte mail et clique sur le lien de confirmation avant de te connecter.");
    }

    // Ajouter les infos dans la table 'users'
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: data.user?.id,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        email: formData.email,
        ville: formData.ville,
        quartier: formData.quartier,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push('/auth/login');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-neutral-900 p-6 rounded-xl shadow-md space-y-4"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Inscription à Omnia</h2>

        {['nom', 'prenom', 'telephone', 'email', 'ville', 'quartier'].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={(formData as any)[field]}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-neutral-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}

        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-3 rounded-lg bg-neutral-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="Confirmer le mot de passe"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full p-3 rounded-lg bg-neutral-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              onChange={() => setShowPassword(!showPassword)}
              className="form-checkbox"
            />
            Afficher les mots de passe
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg font-semibold"
        >
          {loading ? 'Chargement...' : "S'inscrire"}
        </button>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <p className="text-center text-sm mt-4">
          Déjà inscrit ?{' '}
          <Link href="/auth/login" className="text-blue-400 underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}

