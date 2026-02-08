'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterPage() {
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [message, setMessage] = useState('')

const [formData, setFormData] = useState({
nom: '',
prenom: '',
email: '',
password: '',
telephone: '',
ville: '',
quartier: '',
})

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setFormData({ ...formData, [e.target.name]: e.target.value })
}

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault()
setLoading(true)
setError('')
setMessage('')

const { nom, prenom, email, password, telephone, ville, quartier } = formData  

try {  
  // 1️⃣ Création du compte Auth  
  const { data, error: signUpError } = await supabase.auth.signUp({  
    email,  
    password,  
    options: {  
      emailRedirectTo: `${window.location.origin}/auth/callback`,  
    },  
  })  

  if (signUpError) throw signUpError  
  if (!data.user?.id) throw new Error("Impossible de créer l'utilisateur.")  

  // 2️⃣ Insertion dans la table users  
  const { error: insertError } = await supabase  
    .from('users')  
    .insert({  
      id: data.user.id,  
      nom,  
      prenom,  
      email,  
      telephone,  
      ville,  
      quartier,  
    })  

  if (insertError) throw insertError  

  setMessage("Compte créé ! Vérifie ton email pour confirmer ton compte.")  
} catch (err: any) {  
  setError(err.message)  
} finally {  
  setLoading(false)  
}

}

return (
<div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
<form  
onSubmit={handleSubmit}  
className="w-full max-w-md bg-zinc-900 p-6 rounded-xl space-y-4"  
>
<h2 className="text-2xl font-bold text-center">Créer un compte</h2>

{error && <p className="text-red-500 text-sm text-center">{error}</p>}  
    {message && <p className="text-green-500 text-sm text-center">{message}</p>}  

    <div className="grid grid-cols-2 gap-2">  
      <input  
        name="nom"  
        placeholder="Nom"  
        onChange={handleChange}  
        required  
        className="p-2 rounded bg-zinc-800"  
      />  
      <input  
        name="prenom"  
        placeholder="Prénom"  
        onChange={handleChange}  
        required  
        className="p-2 rounded bg-zinc-800"  
      />  
    </div>  

    <input  
      name="email"  
      type="email"  
      placeholder="Email"  
      onChange={handleChange}  
      required  
      className="w-full p-2 rounded bg-zinc-800"  
    />  
    <input  
      name="password"  
      type="password"  
      placeholder="Mot de passe"  
      onChange={handleChange}  
      required  
      className="w-full p-2 rounded bg-zinc-800"  
    />  
    <input  
      name="telephone"  
      placeholder="Téléphone"  
      onChange={handleChange}  
      required  
      className="w-full p-2 rounded bg-zinc-800"  
    />  
    <input  
      name="ville"  
      placeholder="Ville"  
      onChange={handleChange}  
      required  
      className="w-full p-2 rounded bg-zinc-800"  
    />  
    <input  
      name="quartier"  
      placeholder="Quartier"  
      onChange={handleChange}  
      required  
      className="w-full p-2 rounded bg-zinc-800"  
    />  

    <button  
      disabled={loading}  
      className="w-full py-2 bg-blue-600 rounded font-semibold"  
    >  
      {loading ? 'Création...' : 'Créer le compte'}  
    </button>  
  </form>  
</div>

)
}
