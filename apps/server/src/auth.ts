import { ExpressAuth, type ExpressAuthConfig } from '@auth/express';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from '@auth/core/providers/credentials';
import bcrypt from 'bcrypt';
import { prisma } from './db.js';        //  ← .js

export const authConfig: ExpressAuthConfig = {
  adapter: PrismaAdapter(prisma),
  secret:  process.env.AUTH_SECRET ?? 'dev-secret',
  session: { strategy: 'jwt' as const },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize({ email, password }: Record<string, unknown>) {
        if (typeof email !== 'string' || typeof password !== 'string') return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        return (await bcrypt.compare(password, user.hashedPwd))
          ? { id: user.id, email: user.email, name: user.name }
          : null;
      },
    }),
  ],
};

export const auth = ExpressAuth(authConfig);
