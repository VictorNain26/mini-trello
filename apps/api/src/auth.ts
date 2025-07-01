import { ExpressAuth, type ExpressAuthConfig } from '@auth/express';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from '@auth/core/providers/credentials';
import bcrypt from 'bcrypt';
import { prisma } from './db.js';

const SECRET = process.env.AUTH_SECRET;
if (!SECRET || SECRET.length < 32) {
  console.warn(
    '⚠️ AUTH_SECRET manquant ou <32 caractères : fallback DEV appliqué. En prod, définis-en un ≥32 chars.',
  );
}

export const authConfig: ExpressAuthConfig = {
  adapter: PrismaAdapter(prisma),
  secret: SECRET ?? 'dev-secret',
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email',    placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize({ email, password }) {
        try {
          if (typeof email !== 'string' || typeof password !== 'string') return null;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;
          const match = await bcrypt.compare(password, user.hashedPwd);
          if (!match) return null;
          return { id: user.id, email: user.email, name: user.name };
        } catch {
          return null;
        }
      },
    }),
  ],
};

export const auth = ExpressAuth(authConfig);
