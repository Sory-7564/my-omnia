"use client"
import { useEffect, useState } from "react"

type Produit = {
  id: string
  nom: string
  categorie: string
  description?: string
  prix?: number
  photo?: string
}

export default function Autres() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [search, setSearch] = useState("")
  const [categorieFiltre, setCategorieFiltre] = useState("")

  useEffect(() => {
    const produitsEnregistres: Produit[] = JSON.parse(localStorage.getItem("produits") || "[]")
    setProduits(produitsEnregistres)
  }, [])

  const categoriesDisponibles = [...new Set(produits.map((p) => p.categorie))]

  const produitsFiltres = produits.filter((p) => {
    const correspondRecherche = p.nom.toLowerCase().includes(search.toLowerCase())
    const correspondCategorie = categorieFiltre ? p.categorie === categorieFiltre : true
    return correspondRecherche && correspondCategorie
  })

  return (
    <main className="p-4 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Rechercher un produit</h1>

      <input
        type="text"
        placeholder="Nom du produit..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
      />

      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setCategorieFiltre("")}
          className={`px-4 py-2 rounded ${
            categorieFiltre === "" ? "bg-blue-700" : "bg-gray-800"
          } hover:bg-gray-700`}
        >
          Toutes les catégories
        </button>
        {categoriesDisponibles.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategorieFiltre(cat)}
            className={`px-4 py-2 rounded ${
              categorieFiltre === cat ? "bg-blue-700" : "bg-gray-800"
            } hover:bg-gray-700`}
          >
            {cat}
          </button>
        ))}
      </div>

      {produitsFiltres.length === 0 && (
        <p className="text-gray-400">Aucun produit trouvé.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {produitsFiltres.map((prod, index) => (
          <div key={prod.id || index} className="bg-gray-900 p-4 rounded">
            <img
              src={prod.photo}
              alt={prod.nom}
              className="w-full h-48 object-cover rounded mb-2"
            />
            <h2 className="text-lg font-semibold">{prod.nom}</h2>
            <p className="text-gray-400">{prod.description}</p>
            <p className="text-green-500 font-bold">{prod.prix} FCFA</p>
            <p className="text-sm text-gray-400">Catégorie : {prod.categorie}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
