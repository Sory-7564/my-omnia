'use client';

import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logoutUser } = useAuth();

  return (
    <header className="w-full flex justify-between items-center p-4 border-b border-gray-200">
      <h1 className="text-xl font-bold">Omnia</h1>

      {user && (
        <button
          onClick={logoutUser}
          className="text-red-600 font-semibold"
        >
          Se déconnecter
        </button>
      )}
    </header>
  );
}
