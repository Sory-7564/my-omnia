"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 👁️ state pour afficher/cacher mot de passe
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { username, email, password } = formData

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // créer profil utilisateur
    if (data.user) {
      await supabase.from("users").insert({
        id: data.user.id,
        username
      })
    }

    setLoading(false)
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleRegister}
        className="bg-zinc-900 p-6 rounded-xl w-[350px] flex flex-col gap-4"
      >
        <h1 className="text-xl font-bold text-center">Créer un compte</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Nom d'utilisateur"
          className="p-2 rounded bg-zinc-800 text-white"
          required
        />

        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="p-2 rounded bg-zinc-800 text-white"
          required
        />

        {/* 👁️ mot de passe avec bouton */}
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Mot de passe"
            className="w-full p-2 pr-10 rounded bg-zinc-800 text-white"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-gray-400"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black p-2 rounded font-semibold"
        >
          {loading ? "Création..." : "S'inscrire"}
        </button>
      </form>
    </div>
  )
}
