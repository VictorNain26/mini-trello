/**
 * Idempotent seed :
 * • crée / met à jour un user demo (email: demo@demo.com, mdp: demo)
 * • crée / met à jour le board “Demo Board” rattaché à cet user
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  /* ---------- user demo ---------- */
  const hashed = await bcrypt.hash('demo', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@demo.com' },
    update: { hashedPwd: hashed },
    create: {
      email: 'demo@demo.com',
      hashedPwd: hashed,
      name: 'Demo',
      color: 'hsl(200 80% 60%)',
    },
  });

  /* ---------- board demo ---------- */
  await prisma.board.upsert({
    where: { id: 'demo' },
    update: {},
    create: {
      id: 'demo',
      title: 'Demo Board',
      ownerId: user.id,

      columns: {
        create: [
          {
            id: 'todo',
            title: 'To Do',
            order: 0,
            cards: {
              create: [
                { id: 'c1', title: 'Hello world', order: 0 },
                { id: 'c2', title: 'Drag me', order: 1 },
                { id: 'c3', title: 'Drop me', order: 2 },
              ],
            },
          },
          { id: 'doing', title: 'Doing', order: 1 },
          { id: 'done', title: 'Done', order: 2 },
        ],
      },
    },
  });

  console.log('🌱 Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
