import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials, req) {
        // Exemple simple : à adapter avec ta base de données
        if (credentials?.email === "test@omnia.com" && credentials.password === "123456") {
          return {
            id: "1",
            name: "Sory",
            email: "test@omnia.com"
          }
        }

        return null
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }

