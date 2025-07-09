// Type definitions for API router
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// TODO: Import actual router type from API
export type AppRouter = {
  board: {
    getBoards: any;
    getBoard: any;
    createBoard: any;
    updateBoard: any;
    deleteBoard: any;
  };
  column: {
    createColumn: any;
    updateColumn: any;
    deleteColumn: any;
    reorderColumns: any;
  };
  card: {
    createCard: any;
    updateCard: any;
    deleteCard: any;
    moveCard: any;
  };
  member: {
    getMembers: any;
    inviteMember: any;
    removeMember: any;
  };
};

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
