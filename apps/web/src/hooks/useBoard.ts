import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Card {
  id: string;
  title: string;
  description?: string;
  labels?: string[];
  dueDate?: string;
  order: number;
  columnId: string;
}

interface Column {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

interface BoardMember {
  id: string;
  name: string;
  email: string;
  color: string;
  role: 'owner' | 'editor' | 'reader';
  joinedAt: string;
}

interface Board {
  id: string;
  title: string;
  columns: Column[];
  members?: BoardMember[];
}

export function useBoard(boardId: string | undefined) {
  const [board, setBoard] = useState<Board | null>(null);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'reader' | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBoard = useCallback(async () => {
    if (!boardId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://api-production-e29c.up.railway.app'}/api/boards/${boardId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Ensure cards have columnId
        const processedData = {
          ...data,
          columns: data.columns.map((col: any) => ({
            ...col,
            cards: col.cards.map((card: any) => ({
              ...card,
              columnId: col.id,
            })),
          })),
        };
        setBoard(processedData);
      } else {
        toast.error('Tableau non trouvé');
      }
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  const loadMembers = useCallback(async () => {
    if (!boardId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://api-production-e29c.up.railway.app'}/api/boards/${boardId}/members`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMembers(data);

        // Get current user email from another API call or context
        // For now, we'll determine role from the members list
        // This should ideally come from a user context
      }
    } catch {
      console.error('Erreur chargement membres');
    }
  }, [boardId]);

  useEffect(() => {
    if (boardId) {
      loadBoard();
      loadMembers();
    }
  }, [boardId, loadBoard, loadMembers]);

  const updateBoard = (updates: Partial<Board>) => {
    setBoard((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const updateColumn = (columnId: string, updates: Partial<Column>) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.map((col) =>
              col.id === columnId ? { ...col, ...updates } : col
            ),
          }
        : null
    );
  };

  const updateCard = (cardId: string, updates: Partial<Card>) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.map((col) => ({
              ...col,
              cards: col.cards.map((card) => (card.id === cardId ? { ...card, ...updates } : card)),
            })),
          }
        : null
    );
  };

  const addColumn = (column: Column) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: [...prev.columns, column],
          }
        : null
    );
  };

  const removeColumn = (columnId: string) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.filter((col) => col.id !== columnId),
          }
        : null
    );
  };

  const addCard = (columnId: string, card: Card) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.map((col) =>
              col.id === columnId ? { ...col, cards: [...col.cards, card] } : col
            ),
          }
        : null
    );
  };

  const removeCard = (cardId: string) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.map((col) => ({
              ...col,
              cards: col.cards.filter((card) => card.id !== cardId),
            })),
          }
        : null
    );
  };

  return {
    board,
    members,
    userRole,
    loading,
    setBoard,
    setMembers,
    setUserRole,
    loadBoard,
    loadMembers,
    updateBoard,
    updateColumn,
    updateCard,
    addColumn,
    removeColumn,
    addCard,
    removeCard,
  };
}
