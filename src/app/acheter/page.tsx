"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Acheter() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const heure = date.toLocaleTimeString();
  const dateDuJour = date.toLocaleDateString();

  return (
    <main className="w-screen min-h-screen bg-black text-white font-sans p-4">
      {/* Entête */}
      <header className="w-full bg-gray-900 p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Explorer les produits à acheter</h1>
          <p>{dateDuJour} - {heure}</p>
        </div>
      </header>

      {/* Sections de choix */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href="/acheter/restaurant">
          <div className="bg-red-700 hover:bg-red-800 transition p-6 rounded-xl shadow text-center cursor-pointer">
            <h2 className="text-2xl font-semibold">Restaurants</h2>
            <p className="mt-2 text-gray-300">Plats cuisinés proposés</p>
          </div>
        </Link>

        <Link href="/acheter/supermarche">
          <div className="bg-yellow-600 hover:bg-yellow-700 transition p-6 rounded-xl shadow text-center cursor-pointer">
            <h2 className="text-2xl font-semibold">Supermarché</h2>
            <p className="mt-2 text-gray-900">Produits alimentaires et ménagers</p>
          </div>
        </Link>

        <Link href="/acheter/autres">
          <div className="bg-gray-700 hover:bg-gray-800 transition p-6 rounded-xl shadow text-center cursor-pointer">
            <h2 className="text-2xl font-semibold">Autres</h2>
            <p className="mt-2 text-gray-300">Articles divers publiés par les utilisateurs</p>
          </div>
        </Link>
      </section>
    </main>
  );
}