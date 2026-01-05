// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Récupérer les paramètres de l'URL
  const { searchParams } = new URL(request.url)
  
  // Supabase gère automatiquement l'email confirmation, donc pas besoin d'exchangeCodeForSession pour email/password
  // Juste rediriger vers login avec un param pour afficher le message
  return NextResponse.redirect(new URL('/auth/login?confirmed=1', request.url))
}
