import { ExpressAuth, type ExpressAuthConfig } from '@auth/express';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from '@auth/core/providers/credentials';
import bcrypt from 'bcrypt';
import { prisma } from './db.js';

/* ---------- Secret ---------- */
const SECRET = process.env.AUTH_SECRET;
if (!SECRET || SECRET.length < 32) {
  console.warn(
    '⚠️  AUTH_SECRET manquant ou trop court ! Générez-en un de 32 caractères mini ' +
    "(openssl rand -hex 32) – l'appli démarre quand même en mode DEV.",
  );
}

/* ─────────────  Auth.js config  ───────────── */
export const authConfig: ExpressAuthConfig = {
  adapter: PrismaAdapter(prisma),
  secret:  SECRET ?? 'dev-secret',          // ← fallback seulement en dev
  session: { strategy: 'jwt' as const },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize({ email, password }: Record<string, unknown>) {
        if (typeof email !== 'string' || typeof password !== 'string')
          return null;

        /* -- récupère l'utilisateur -- */
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        /* -- compare le hash bcrypt -- */
        const ok = await bcrypt.compare(password, user.hashedPwd);

        /* -- renvoie les infos publiques ou null -- */
        return ok
          ? { id: user.id, email: user.email, name: user.name }
          : null;
      },
    }),
  ],
};

export const auth = ExpressAuth(authConfig);
