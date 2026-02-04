// src/db/seed.ts
import 'dotenv/config' // IMPORTANT pour les scripts Node (charge .env)
import { createClient, PostgrestError } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'

// Vérification des variables d'environnement
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies dans les variables d\'environnement.')
  process.exit(1)
}

// 🔐 Client Supabase BACKEND (service role)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface Produit {
  nom: string
  description: string
  prix: number
  categorie: string
  user_id?: string
}

interface ImageProduit {
  produit_id: string
  url: string
  type: 'image' | 'video'
}

async function seed(): Promise<void> {
  try {
    // TODO: remplace ce userId par un vrai user existant dans auth.users
    const userId = '00000000-0000-0000-0000-000000000000'
    // ⚠️ IMPORTANT : ce user doit exister dans auth.users
    if (!userId || userId === '00000000-0000-0000-0000-000000000000') {
      console.error('❌ userId est un placeholder. Remplace-le par un id d\'utilisateur réel dans auth.users.')
      process.exit(1)
    }

    // Si l'API admin est disponible sur le client, vérifie que l'utilisateur existe
    // (supabase.auth.admin.getUserById est disponible quand on utilise une clé service-role)
    if (typeof (supabase.auth as any)?.admin?.getUserById === 'function') {
      const admin = (supabase.auth as any).admin
      const { data: userData, error: userError } = await admin.getUserById(userId)
      if (userError) {
        console.error('❌ Erreur lors de la vérification de l\'utilisateur:', userError)
        process.exit(1)
      }
      if (!userData) {
        console.error(`❌ Utilisateur introuvable: ${userId}. Créez d'abord cet utilisateur dans auth.users ou utilisez un autre userId.`)
        process.exit(1)
      }
    } else {
      console.warn('⚠️ Vérification automatique de l\'utilisateur non disponible. Assurez-vous que le user existe dans auth.users.')
    }

    const categories = [
      'Électronique', 'Vêtements', 'Maison', 'Auto', 'Gaming', 'Sport',
      'Jouets', 'Beauté', 'Santé', 'Bricolage'
    ]

    // Création d'un tableau de produits factices
    const produits: Produit[] = Array.from({ length: 20 }).map(() => ({
      nom: faker.commerce.productName(),
      description: faker.lorem.sentences(2),
      prix: Number(faker.commerce.price({ min: 5, max: 999 })),
      categorie: faker.helpers.arrayElement(categories),
      user_id: userId
    }))

    // Insertion des produits
    const { data: insertedProduits, error: produitsError } = await supabase
      .from('produits')
      .insert(produits)
      .select()

    if (produitsError) throw produitsError
    if (!insertedProduits || insertedProduits.length === 0) {
      console.warn('⚠️ Aucun produit inséré')
    } else {
      console.log(`✅ ${insertedProduits.length} produits insérés`)
    }

    // Pour chaque produit inséré, crée quelques images factices et insère-les
    for (const produit of insertedProduits || []) {
      const nbImages = faker.number.int ? faker.number.int({ min: 1, max: 3 }) : Math.floor(Math.random() * 3) + 1

      const images: ImageProduit[] = Array.from({ length: nbImages }, () => ({
        produit_id: produit.id,
        url: `https://placehold.co/600x400?text=${encodeURIComponent(produit.nom)}`,
        type: 'image'
      }))

      const { error: imagesError } = await supabase
        .from('images')
        .insert(images)

      if (imagesError) {
        console.warn(`⚠️ Erreur en ajoutant les images pour le produit ${produit.id}:`, imagesError)
        // Ne pas forcément arrêter tout le seeding pour une erreur d'image, continuez
      }
    }

    console.log('✅ Images associées ajoutées')
    console.log('🎉 Seeding terminé avec succès')
  } catch (err) {
    const error = err as PostgrestError | any
    console.error('❌ Erreur lors du seeding:', error?.message ?? error)
    process.exit(1)
  }
}

// Exécute le seed si on lance directement ce fichier
seed().catch((e) => {
  console.error('❌ Erreur non gérée lors du seed:', e)
  process.exit(1)
})
