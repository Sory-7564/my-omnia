'use client';

import { useAuth } from '@/context/AuthContext';

export default function LogoutButton() {
  const { logoutUser } = useAuth();

  return (
    <button onClick={logoutUser} className="text-red-500">
      Se déconnecter
    </button>
  );
}
