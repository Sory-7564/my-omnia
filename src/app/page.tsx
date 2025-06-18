'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [date, setDate] = useState<Date | null>(null);
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const heure = date?.toLocaleTimeString();
  const dateDuJour = date?.toLocaleDateString();

  const toggleMenu = () => {
    setMenuOuvert(!menuOuvert);
  };

  const handleDeconnexion = () => {
    signOut({ callbackUrl: "/auth/login" }); // Redirige vers la page de connexion
  };

  return (
    <main className="w-screen min-h-screen font-sans bg-black text-white flex flex-col items-center p-6 gap-5">
      {/* Entête */}
      <header className="w-full bg-gray-900 p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between items-start sm:items-center relative">
        <div>
          <h1 className="text-xl font-bold">Bienvenue sur Omnia</h1>
          <h2 className="text-lg font-semibold">
            Bonjour {session?.user?.email || "Invité"}
          </h2>
          {date && <p>{dateDuJour} - {heure}</p>}
        </div>

        {/* Icône ⚙ + menu déroulant */}
        <div className="relative mt-4 sm:mt-0">
          <button onClick={toggleMenu} className="text-white text-2xl">⚙</button>
          {menuOuvert && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-md z-10">
              <button
                className="block px-4 py-2 w-full text-left hover:bg-gray-200"
                onClick={() => alert("Profil à venir")}
              >
                👤 Mon profil
              </button>
              <button
                className="block px-4 py-2 w-full text-left hover:bg-gray-200"
                onClick={() => alert("Paramètres à venir")}
              >
                ⚙ Paramètres
              </button>
            </div>
          )}
        </div>

        {/* ✅ Bouton Déconnexion si session active */}
        {status === "authenticated" && (
          <button
            onClick={handleDeconnexion}
            className="absolute top-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white z-20"
          >
            🔓 Se déconnecter
          </button>
        )}
      </header>

      {/* Section Pub */}
      <section className="w-full">
        <div className="rounded-xl overflow-hidden text-white p-4">
          <h3 className="text-lg font-semibold mb-2">PUB</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Link
                key={i}
                href="https://wa.me/22370581725?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20ton%20offre%20sur%20Omnia"
                target="_blank"
              >
                <div className="cursor-pointer">
                  <video
                    className="w-full h-32 sm:h-40 rounded-lg shadow border border-white p-1"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src="/videos/pub.mp4" type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Question principale */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Que désirez-vous aujourd’hui ?</h2>
      </div>

      {/* Options */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-24 w-full max-w-xl">
        <Link href="/acheter">
          <div className="bg-blue-800 p-6 rounded-xl shadow hover:shadow-lg cursor-pointer text-center">
            <h2 className="text-2xl font-semibold text-white">Acheter</h2>
            <p className="mt-2 text-gray-300">Explorer les produits à acheter</p>
          </div>
        </Link>
        <Link href="/vendre">
          <div className="bg-green-800 p-6 rounded-xl shadow hover:shadow-lg cursor-pointer text-center">
            <h2 className="text-2xl font-semibold text-white">Vendre</h2>
            <p className="mt-2 text-gray-300">Publier un produit à vendre</p>
          </div>
        </Link>
        <Link href="/reservation">
          <div className="bg-yellow-800 p-6 rounded-xl shadow hover:shadow-lg cursor-pointer text-center">
            <h2 className="text-2xl font-semibold text-white">Réservation</h2>
            <p className="mt-2 text-gray-300">Réserver un Appartement ou Hôtel</p>
          </div>
        </Link>
      </section>

      {/* Menu bas */}
      <footer className="bg-gray-800 text-white p-4 rounded-t-lg flex justify-around fixed bottom-0 left-0 right-0">
        <Link href="/">
          <div className="text-center cursor-pointer">
            <p>🏠</p>
            <p className="text-sm">Accueil</p>
          </div>
        </Link>
        <Link href="/notifications">
          <div className="text-center cursor-pointer">
            <p>🔔</p>
            <p className="text-sm">Notifications</p>
          </div>
        </Link>
        <Link href="/conversations">
          <div className="text-center cursor-pointer">
            <p>📥</p>
            <p className="text-sm">Conversations</p>
          </div>
        </Link>
        <Link href="/boutiques">
          <div className="text-center cursor-pointer">
            <p>🏬</p>
            <p className="text-sm">Boutiques</p>
          </div>
        </Link>
      </footer>
    </main>
  );
}
