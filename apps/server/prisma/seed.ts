import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

await prisma.board.create({
  data: {
    title: 'Demo Board',
    columns: {
      create: [
        {
          title: 'To Do',
          order: 0,
          cards: { create: { title: 'Hello world', order: 0 } },
        },
        { title: 'Doing', order: 1 },
        { title: 'Done',  order: 2 },
      ],
    },
  },
});

await prisma.$disconnect();
console.log('🌱  Seed complete');
