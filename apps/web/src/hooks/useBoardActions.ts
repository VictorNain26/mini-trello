import { useCallback } from 'react';
import { toast } from 'sonner';

interface UseBoardActionsProps {
  boardId: string;
  userRole: string | null;
  onUpdate: () => void;
}

export function useBoardActions({ boardId, userRole, onUpdate }: UseBoardActionsProps) {
  const createColumn = useCallback(
    async (title: string) => {
      if (!title.trim() || userRole === 'reader') return null;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://api-production-e29c.up.railway.app'}/api/boards/${boardId}/columns`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title.trim() }),
            credentials: 'include',
          }
        );

        if (response.ok) {
          const newColumn = await response.json();
          toast.success('Colonne créée !');
          onUpdate();
          return newColumn;
        } else {
          const error = await response.json();
          toast.error(error.error || 'Erreur lors de la création');
          return null;
        }
      } catch {
        toast.error('Erreur réseau');
        return null;
      }
    },
    [boardId, userRole, onUpdate]
  );

  const updateColumn = useCallback(
    async (columnId: string, title: string) => {
      if (!title.trim() || userRole === 'reader') return false;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://api-production-e29c.up.railway.app'}/api/columns/${columnId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title.trim() }),
            credentials: 'include',
          }
        );

        if (response.ok) {
          toast.success('Colonne mise à jour !');
          onUpdate();
          return true;
        } else {
          const error = await response.json();
          toast.error(error.error || 'Erreur lors de la mise à jour');
          return false;
        }
      } catch {
        toast.error('Erreur réseau');
        return false;
      }
    },
    [userRole, onUpdate]
  );

  const deleteColumn = useCallback(
    async (columnId: string) => {
      if (userRole === 'reader') return false;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://api-production-e29c.up.railway.app'}/api/columns/${columnId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          }
        );

        if (response.ok) {
          toast.success('Colonne supprimée !');
          onUpdate();
          return true;
        } else {
          const error = await response.json();
          toast.error(error.error || 'Erreur lors de la suppression');
          return false;
        }
      } catch {
        toast.error('Erreur réseau');
        return false;
      }
    },
    [userRole, onUpdate]
  );

  const createCard = useCallback(
    async (columnId: string, title: string) => {
      if (!title.trim() || userRole === 'reader') return null;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://api-production-e29c.up.railway.app'}/api/columns/${columnId}/cards`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title.trim() }),
            credentials: 'include',
          }
        );

        if (response.ok) {
          const newCard = await response.json();
          toast.success('Carte créée !');
          onUpdate();
          return newCard;
        } else {
          const error = await response.json();
          toast.error(error.error || 'Erreur lors de la création');
          return null;
        }
      } catch {
        toast.error('Erreur réseau');
        return null;
      }
    },
    [userRole, onUpdate]
  );

  const updateCard = useCallback(
    async (cardId: string, updates: any) => {
      if (userRole === 'reader') return false;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://api-production-e29c.up.railway.app'}/api/cards/${cardId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
            credentials: 'include',
          }
        );

        if (response.ok) {
          onUpdate();
          return true;
        } else {
          const error = await response.json();
          toast.error(error.error || 'Erreur lors de la mise à jour');
          return false;
        }
      } catch {
        toast.error('Erreur réseau');
        return false;
      }
    },
    [userRole, onUpdate]
  );

  const deleteCard = useCallback(
    async (cardId: string) => {
      if (userRole === 'reader') return false;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://api-production-e29c.up.railway.app'}/api/cards/${cardId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          }
        );

        if (response.ok) {
          toast.success('Carte supprimée !');
          onUpdate();
          return true;
        } else {
          const error = await response.json();
          toast.error(error.error || 'Erreur lors de la suppression');
          return false;
        }
      } catch {
        toast.error('Erreur réseau');
        return false;
      }
    },
    [userRole, onUpdate]
  );

  const moveCard = useCallback(
    async (cardId: string, columnId: string, order: number) => {
      if (userRole === 'reader') return false;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://api-production-e29c.up.railway.app'}/api/cards/${cardId}/move`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ columnId, order }),
            credentials: 'include',
          }
        );

        return response.ok;
      } catch {
        return false;
      }
    },
    [userRole]
  );

  const moveColumn = useCallback(
    async (columnId: string, order: number) => {
      if (userRole === 'reader') return false;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://api-production-e29c.up.railway.app'}/api/columns/${columnId}/move`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order }),
            credentials: 'include',
          }
        );

        return response.ok;
      } catch {
        return false;
      }
    },
    [userRole]
  );

  return {
    createColumn,
    updateColumn,
    deleteColumn,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    moveColumn,
  };
}
