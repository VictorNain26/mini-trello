import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

await prisma.board.create({
  data: {
    id:    'demo',
    title: 'Demo Board',
    columns: {
      create: [
        {
          id:    'todo',
          title: 'To Do',
          order: 0,
          cards: { create: [
            { id: 'c1', title: 'Hello world', order: 0 },
            { id: 'c2', title: 'Hello world2', order: 0 },
            { id: 'c3', title: 'Hello world3', order: 0 },
          ] },
        },
        { id: 'doing', title: 'Doing', order: 1 },
        { id: 'done',  title: 'Done',  order: 2 },
      ],
    },
  },
});

await prisma.$disconnect();
console.log('🌱  Seed complete');
