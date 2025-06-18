// app/autres-offres/creation-entreprise/page.tsx
export default function CreationEntreprisePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-4 text-center text-yellow-400">Création d’entreprise</h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          Lancez facilement votre projet grâce à nos conseils, outils et accompagnements personnalisés.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-yellow-500/40 transition">
            <h2 className="text-xl font-bold mb-2">1. Idée & étude de marché</h2>
            <p className="text-gray-400">Transformez une idée en opportunité rentable grâce à une étude efficace.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-yellow-500/40 transition">
            <h2 className="text-xl font-bold mb-2">2. Statut juridique</h2>
            <p className="text-gray-400">Choisissez la forme qui correspond à vos objectifs : SARL, SAS, Auto-entrepreneur, etc.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-yellow-500/40 transition">
            <h2 className="text-xl font-bold mb-2">3. Business Plan</h2>
            <p className="text-gray-400">Préparez un dossier solide pour convaincre partenaires et investisseurs.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-yellow-500/40 transition">
            <h2 className="text-xl font-bold mb-2">4. Financement</h2>
            <p className="text-gray-400">Explorez les financements disponibles : subventions, crédits, investisseurs, etc.</p>
          </div>
        </div>
      </div>
    </main>
  );
}