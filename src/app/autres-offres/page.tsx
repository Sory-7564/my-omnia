// app/autres-offres/page.tsx
import Link from 'next/link';

export default function AutresOffresPage() {
  return (
    <main className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Autres Offres</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/autres-offres/creation-entreprise">
          <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700">
            <h2 className="text-xl font-semibold">Création d'entreprise</h2>
          </div>
        </Link>

        <Link href="/autres-offres/actualites">
          <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700">
            <h2 className="text-xl font-semibold">Actualités</h2>
          </div>
        </Link>

        <Link href="/autres-offres/films">
          <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700">
            <h2 className="text-xl font-semibold">Films</h2>
          </div>
        </Link>

        <Link href="/autres-offres/o-banque">
          <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700">
            <h2 className="text-xl font-semibold">O-Banque</h2>
          </div>
        </Link>
        <Link href="/autres-offres/Jeu">
          <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700">
            <h2 className="text-xl font-semibold">Jeu</h2>
          </div>
        </Link>
        <Link href="/autres-offres/Evenement">
          <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700">
            <h2 className="text-xl font-semibold">Evenement</h2>
          </div>
        </Link>
        <Link href="/autres-offres/Musique">
          <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700">
            <h2 className="text-xl font-semibold">Musique</h2>
          </div>
        </Link>
        <Link href="/autres-offres/Education">
          <div className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700">
            <h2 className="text-xl font-semibold">Education</h2>
          </div>
        </Link>
      </div>
    </main>
  );
}