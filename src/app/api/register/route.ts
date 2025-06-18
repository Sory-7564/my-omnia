import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  const { name, email, password } = await request.json()

  // 1. Vérification de base
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
  }

  // 2. Vérifie si l’utilisateur existe déjà
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (existingUser) {
    return NextResponse.json({ error: 'Cet utilisateur existe déjà.' }, { status: 400 })
  }

  // 3. Hash du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10)

  // 4. Enregistrement dans Supabase
  const { data, error } = await supabase.from('users').insert([
    {
      name,
      email,
      password: hashedPassword
    }
  ])

  if (error) {
    console.error('Erreur Supabase:', error)
    return NextResponse.json({ error: 'Erreur pendant l’inscription.' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Inscription réussie 🎉' }, { status: 200 })
}
