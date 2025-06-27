export type Card = { id: string; title: string };
export type Column = { id: string; title: string; cards: Card[] };
export type Board = { id: string; title: string; columns: Column[] };

export const boards: Record<string, Board> = {
  demo: {
    id: 'demo',
    title: 'Demo Board',
    columns: [
      { id: 'todo',  title: 'To Do',  cards: [{ id: 'c1', title: 'Hello world' }] },
      { id: 'doing', title: 'Doing',  cards: [] },
      { id: 'done',  title: 'Done',   cards: [] }
    ]
  }
};
