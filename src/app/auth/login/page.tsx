'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message.toLowerCase().includes('email not confirmed')) {
        setError("Ton email n’a pas encore été confirmé. Vérifie ta boîte mail.");
      } else {
        setError("Identifiants incorrects. Réessaie.");
      }
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="bg-[#111] p-6 rounded-xl w-full max-w-md shadow-lg">
        <h1 className="text-3xl font-bold text-center text-indigo-500 mb-4">Connexion à Omnia</h1>

        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-[#1a1a1a] border border-gray-700 text-white"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-12 rounded bg-[#1a1a1a] border border-gray-700 text-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-indigo-400 hover:text-indigo-600"
            >
              {showPassword ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded transition"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Pas encore de compte ?{' '}
          <a href="/auth/register" className="text-indigo-500 underline">S’inscrire</a>
        </p>
      </div>
    </div>
  );
}

