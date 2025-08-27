// src/lib/notifications.ts
// Ce fichier centralise la logique de création de notifications
// (likes, commentaires, etc.) dans la table Supabase "notifications".

import { supabase } from './supabaseClient'

/**
 * Crée une notification lorsqu'un utilisateur aime un produit.
 * @param senderId - L'ID de l'utilisateur qui a aimé
 * @param produitId - L'ID du produit aimé
 */
export async function addLikeNotification(senderId: string, produitId: string) {
  try {
    // Récupérer le produit pour savoir qui est le propriétaire
    const { data: produit, error: produitError } = await supabase
      .from('produits')
      .select('id, user_id')
      .eq('id', produitId)
      .single()

    if (produitError) {
      console.error('❌ Erreur récupération produit pour notif like:', produitError)
      return
    }
    if (!produit) return

    // Ne pas envoyer de notification si l’utilisateur like son propre produit
    if (produit.user_id === senderId) return

    // Insérer la notification
    const { error } = await supabase.from('notifications').insert({
      type: 'like',
      message: 'a aimé votre produit',
      sender_id: senderId,
      receiver_id: produit.user_id,
      produit_id: produitId,
      is_read: false,
      created_at: new Date().toISOString(),
    })

    if (error) console.error('❌ Erreur insertion notification like:', error)
  } catch (err) {
    console.error('❌ Exception création notification like:', err)
  }
}

/**
 * Crée une notification lorsqu'un utilisateur commente un produit.
 * @param senderId - L'ID de l'utilisateur qui commente
 * @param produitId - L'ID du produit commenté
 * @param commentText - Le contenu du commentaire
 */
export async function addCommentNotification(
  senderId: string,
  produitId: string,
  commentText: string
) {
  try {
    // Récupérer le produit pour savoir qui est le propriétaire
    const { data: produit, error: produitError } = await supabase
      .from('produits')
      .select('id, user_id')
      .eq('id', produitId)
      .single()

    if (produitError) {
      console.error('❌ Erreur récupération produit pour notif commentaire:', produitError)
      return
    }
    if (!produit) return

    // Ne pas envoyer de notification si l’utilisateur commente son propre produit
    if (produit.user_id === senderId) return

    // Insérer la notification
    const { error } = await supabase.from('notifications').insert({
      type: 'comment',
      message: `a commenté votre produit : "${commentText}"`,
      sender_id: senderId,
      receiver_id: produit.user_id,
      produit_id: produitId,
      is_read: false,
      created_at: new Date().toISOString(),
    })

    if (error) console.error('❌ Erreur insertion notification commentaire:', error)
  } catch (err) {
    console.error('❌ Exception création notification commentaire:', err)
  }
}
