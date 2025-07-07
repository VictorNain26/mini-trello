import { type ExpressAuthConfig } from "@auth/express"
import CredentialsProvider from "@auth/core/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcrypt"
import { prisma } from "../db.js"

if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
  throw new Error(
    "❌ AUTH_SECRET doit être défini dans l’environnement et contenir ≥ 32 caractères.",
  )
}

export const authConfig: ExpressAuthConfig = {
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize({ email, password }) {
        if (typeof email !== "string" || typeof password !== "string")
          return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null
        const ok = await bcrypt.compare(password, user.hashedPwd)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name ?? undefined }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) session.user = { ...session.user, id: token.sub }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn:  "/login",
    signOut: "/logout",
    error:   "/login",
  },
  trustHost: true,
  basePath: "/api/auth",
}
