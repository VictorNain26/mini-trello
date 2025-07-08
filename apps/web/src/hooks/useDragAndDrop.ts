import { useCallback, useState } from 'react';
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

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

interface Board {
  id: string;
  title: string;
  columns: Column[];
}

interface UseDragAndDropProps {
  board: Board | null;
  userRole: string | null;
  onBoardUpdate: (board: Board) => void;
  onMoveCard: (cardId: string, columnId: string, order: number) => Promise<boolean>;
  onMoveColumn: (columnId: string, order: number) => Promise<boolean>;
  onReloadBoard: () => void;
}

export function useDragAndDrop({
  board,
  userRole,
  onBoardUpdate,
  onMoveCard,
  onMoveColumn,
  onReloadBoard
}: UseDragAndDropProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const findCardById = useCallback((id: string): Card | null => {
    if (!board) return null;
    
    for (const column of board.columns) {
      const card = column.cards.find(card => card.id === id);
      if (card) return card;
    }
    return null;
  }, [board]);

  const findColumnByCardId = useCallback((cardId: string): Column | null => {
    if (!board) return null;
    
    return board.columns.find(col => 
      col.cards.some(card => card.id === cardId)
    ) || null;
  }, [board]);

  const findColumnById = useCallback((id: string): Column | null => {
    if (!board) return null;
    
    return board.columns.find(col => col.id === id) || null;
  }, [board]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (userRole === 'reader') return;
    
    const { active } = event;
    const activeId = active.id as string;
    
    if (activeId.startsWith('column-')) {
      const columnId = activeId.replace('column-', '');
      const column = findColumnById(columnId);
      setActiveColumn(column);
    } else {
      const card = findCardById(activeId);
      setActiveCard(card);
    }
  }, [userRole, findCardById, findColumnById]);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    if (userRole === 'reader') return;
    // No updates here to avoid lag - everything handled in handleDragEnd
  }, [userRole]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    setActiveColumn(null);

    if (userRole === 'reader' || !over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle column drag & drop
    if (activeId.startsWith('column-')) {
      const activeColumnId = activeId.replace('column-', '');
      
      let overColumnId = null;
      if (overId.startsWith('column-')) {
        overColumnId = overId.replace('column-', '');
      } else {
        const overCard = findCardById(overId);
        if (overCard) {
          const overColumn = findColumnByCardId(overId);
          overColumnId = overColumn?.id;
        } else {
          const overColumn = findColumnById(overId);
          overColumnId = overColumn?.id;
        }
      }
      
      if (activeColumnId && overColumnId && activeColumnId !== overColumnId) {
        const activeIndex = board.columns.findIndex(col => col.id === activeColumnId);
        const overIndex = board.columns.findIndex(col => col.id === overColumnId);
        
        if (activeIndex !== -1 && overIndex !== -1) {
          // Optimistic update
          const newBoard = {
            ...board,
            columns: arrayMove(board.columns, activeIndex, overIndex)
          };
          onBoardUpdate(newBoard);

          // API call in background
          const success = await onMoveColumn(activeColumnId, overIndex);
          if (!success) {
            onReloadBoard();
          }
        }
      }
      return;
    }

    // Handle card drag & drop
    const activeCard = findCardById(activeId);
    if (!activeCard) return;

    const activeColumn = findColumnByCardId(activeId);
    const overCard = findCardById(overId);
    const overColumn = overCard ? findColumnByCardId(overId) : findColumnById(overId);

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id === overColumn.id) {
      // Reordering within the same column
      const activeIndex = activeColumn.cards.findIndex(card => card.id === activeId);
      const overIndex = activeColumn.cards.findIndex(card => card.id === overId);

      if (activeIndex !== overIndex) {
        // Optimistic update
        const newBoard = {
          ...board,
          columns: board.columns.map(col => {
            if (col.id === activeColumn.id) {
              return {
                ...col,
                cards: arrayMove(col.cards, activeIndex, overIndex)
              };
            }
            return col;
          })
        };
        onBoardUpdate(newBoard);

        // API call in background
        const success = await onMoveCard(activeId, activeColumn.id, overIndex);
        if (!success) {
          onReloadBoard();
        }
      }
    } else {
      // Moving to different column
      const overIndex = overCard ? 
        overColumn.cards.findIndex(card => card.id === overId) : 
        overColumn.cards.length;

      // Optimistic update
      const newBoard = {
        ...board,
        columns: board.columns.map(col => {
          if (col.id === activeColumn.id) {
            return {
              ...col,
              cards: col.cards.filter(card => card.id !== activeId)
            };
          }
          if (col.id === overColumn.id) {
            const newCards = [...col.cards];
            newCards.splice(overIndex, 0, { ...activeCard, columnId: overColumn.id });
            return {
              ...col,
              cards: newCards
            };
          }
          return col;
        })
      };
      onBoardUpdate(newBoard);

      // API call in background
      const success = await onMoveCard(activeId, overColumn.id, overIndex);
      if (!success) {
        onReloadBoard();
      }
    }
  }, [userRole, board, findCardById, findColumnByCardId, findColumnById, onBoardUpdate, onMoveCard, onMoveColumn, onReloadBoard]);

  return {
    activeCard,
    activeColumn,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    findCardById,
    findColumnByCardId,
    findColumnById
  };
}