import { type ExpressAuthConfig } from "@auth/express"
import CredentialsProvider from "@auth/core/providers/credentials"
import bcrypt from "bcrypt"
import { prisma } from "../db.js"

const authSecret = process.env.AUTH_SECRET || "dev-secret-key-that-is-at-least-32-characters-long";

export const authConfig: ExpressAuthConfig = {
  secret: authSecret,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize({ email, password }) {
        if (!email || !password) return null
        
        const user = await prisma.user.findUnique({ where: { email: email as string } })
        if (!user) return null
        
        const ok = await bcrypt.compare(password as string, user.hashedPwd)
        if (!ok) return null
        
        return { 
          id: user.id, 
          email: user.email, 
          name: user.name || user.email 
        }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id
      }
      return token
    },
  },
  trustHost: true,
  basePath: "/api/auth",
}