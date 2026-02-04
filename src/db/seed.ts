import { createClient, PostgrestError } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
import 'dotenv/config' // IMPORTANT pour les scripts Node

// 🔐 Client Supabase BACKEND (service role)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Produit {
  nom: string
  description: string
  prix: string
  categorie: string
  user_id: string
  created_at: string
}

interface ImageProduit {
  produit_id: string
  url: string
  type: 'image' | 'video'
}

async function seed(): Promise<void> {
  try {
    const userId = '00000000-0000-0000-0000-000000000000' 
    // ⚠️ IMPORTANT : ce user doit exister dans auth.users

    const categories = [
      'Électronique', 'Vêtements', 'Maison', 'Auto', 'Gaming', 'Sport',
      'Cuisine', 'Livres', 'Outils', 'Nourriture', 'Bijoux', 'Bricolage',
      'Animaux', 'Voitures', 'Autres'
    ]

    const produits: Produit[] = Array.from({ length: 10 }, () => ({
      nom: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      prix: faker.commerce.price({ min: 5, max: 1500, dec: 0 }),
      categorie: faker.helpers.arrayElement(categories),
      user_id: userId,
      created_at: new Date().toISOString()
    }))

    const { data: insertedProduits, error: produitsError } = await supabase
      .from('produits')
      .insert(produits)
      .select()

    if (produitsError) throw produitsError

    console.log(`✅ ${insertedProduits.length} produits insérés`)

    for (const produit of insertedProduits) {
      const nbImages = faker.number.int({ min: 1, max: 3 })

      const images: ImageProduit[] = Array.from({ length: nbImages }, () => ({
        produit_id: produit.id,
        url: `https://placehold.co/600x400?text=${encodeURIComponent(produit.nom)}`,
        type: 'image'
      }))

      const { error: imagesError } = await supabase
        .from('images_produits')
        .insert(images)

      if (imagesError) throw imagesError
    }

    console.log('✅ Images associées ajoutées')
    console.log('🎉 Seeding terminé avec succès')
  } catch (err) {
    const error = err as PostgrestError
    console.error('❌ Erreur lors du seeding:', error.message)
  }
}

seed()
