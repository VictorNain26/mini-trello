export type Card   = { id: string; title: string; order: number; columnId: string };
export type Column = { id: string; title: string; order: number; boardId: string; cards: Card[] };
export type Board  = { id: string; title: string; ownerId: string; createdAt: Date; columns: Column[] };
