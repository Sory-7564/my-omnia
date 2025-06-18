'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  token: string;
};

const AuthContext = createContext<{
  user: User | null;
  loginUser: (token: string) => void;
  logoutUser: () => void;
} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setUser({ token });
  }, []);

  const loginUser = (token: string) => {
    localStorage.setItem('token', token);
    setUser({ token });
    router.push('/'); // redirection vers la page d’accueil ou dashboard
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
