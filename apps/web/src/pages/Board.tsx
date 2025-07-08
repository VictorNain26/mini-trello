import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, ArrowLeft, UserPlus } from 'lucide-react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin
} from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { DraggableColumn } from '@/components/DraggableColumn';
import { CardModal } from '@/components/CardModal';
import { InviteModal } from '@/components/InviteModal';

interface CardItem {
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
  cards: CardItem[];
}

interface Board {
  id: string;
  title: string;
  columns: Column[];
}

export default function Board() {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewColumn, setShowNewColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showNewCard, setShowNewCard] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [activeCard, setActiveCard] = useState<CardItem | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { user, signOut } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Custom collision detection algorithm to better handle column and card dragging
  const collisionDetectionStrategy = useCallback((args: any) => {
    const { active, droppableContainers } = args;
    const activeId = active.id as string;
    
    if (activeId.startsWith('column-')) {
      // For columns, use closestCenter to find the nearest column
      return closestCenter({
        ...args,
        droppableContainers: droppableContainers.filter((container: any) => 
          container.id.startsWith('column-')
        )
      });
    }
    
    // For cards, use pointerWithin for better precision
    return pointerWithin(args);
  }, []);

  const loadBoard = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/boards/${id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Ensure cards have columnId
        const processedData = {
          ...data,
          columns: data.columns.map((col: any) => ({
            ...col,
            cards: col.cards.map((card: any) => ({
              ...card,
              columnId: col.id
            }))
          }))
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
  }, [id]);

  useEffect(() => {
    if (id) {
      loadBoard();
    }
  }, [id, loadBoard]);

  const createColumn = async (title: string) => {
    if (!title.trim() || !board) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/boards/${board.id}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
        credentials: 'include'
      });

      if (response.ok) {
        const newColumn = await response.json();
        setBoard(prev => prev ? {
          ...prev,
          columns: [...prev.columns, { ...newColumn, cards: [] }]
        } : null);
        setNewColumnTitle('');
        setShowNewColumn(false);
        toast.success('Colonne créée !');
      } else {
        toast.error('Erreur lors de la création');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const deleteColumn = async (columnId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette colonne ?')) return;

    try {
      const response = await fetch(`http://localhost:4000/api/columns/${columnId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setBoard(prev => prev ? {
          ...prev,
          columns: prev.columns.filter(col => col.id !== columnId)
        } : null);
        toast.success('Colonne supprimée !');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const createCard = async (columnId: string, title: string) => {
    if (!title.trim()) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/columns/${columnId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
        credentials: 'include'
      });

      if (response.ok) {
        const newCard = await response.json();
        setBoard(prev => prev ? {
          ...prev,
          columns: prev.columns.map(col => 
            col.id === columnId 
              ? { ...col, cards: [...col.cards, { ...newCard, columnId }] }
              : col
          )
        } : null);
        setNewCardTitle('');
        setShowNewCard(null);
        toast.success('Carte créée !');
      } else {
        toast.error('Erreur lors de la création');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return;

    try {
      const response = await fetch(`http://localhost:4000/api/cards/${cardId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setBoard(prev => prev ? {
          ...prev,
          columns: prev.columns.map(col => ({
            ...col,
            cards: col.cards.filter(card => card.id !== cardId)
          }))
        } : null);
        toast.success('Carte supprimée !');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
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
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Skip if dragging a column - columns handle their own sorting
    if (activeId.startsWith('column-')) return;

    // Find the active card and over container
    const activeCard = findCardById(activeId);
    const overCard = findCardById(overId);
    
    if (!activeCard) return;

    const activeColumn = findColumnByCardId(activeId);
    
    // Determine over column - if hovering over a card, get its column
    // If hovering over a column directly, use that column
    let overColumn = null;
    if (overCard) {
      overColumn = findColumnByCardId(overId);
    } else if (overId.startsWith('column-')) {
      overColumn = findColumnById(overId.replace('column-', ''));
    } else {
      overColumn = findColumnById(overId);
    }

    if (!activeColumn || !overColumn) return;

    // If dropping on the same column, do nothing here
    if (activeColumn.id === overColumn.id) return;

    // Move card to different column
    setBoard(prev => {
      if (!prev) return prev;

      const overCards = overColumn.cards;

      // Find the indexes
      const overIndex = overCard ? overCards.findIndex(card => card.id === overId) : overCards.length;

      return {
        ...prev,
        columns: prev.columns.map(col => {
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
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    setActiveColumn(null);

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle column drag & drop
    if (activeId.startsWith('column-')) {
      const activeColumnId = activeId.replace('column-', '');
      
      // Determine the target column ID
      let overColumnId = null;
      if (overId.startsWith('column-')) {
        overColumnId = overId.replace('column-', '');
      } else {
        // If dropping on a card or column content, find the column that contains it
        const overCard = findCardById(overId);
        if (overCard) {
          const overColumn = findColumnByCardId(overId);
          overColumnId = overColumn?.id;
        } else {
          // Try to find column by direct ID
          const overColumn = findColumnById(overId);
          overColumnId = overColumn?.id;
        }
      }
      
      if (activeColumnId && overColumnId && activeColumnId !== overColumnId) {
        const activeIndex = board.columns.findIndex(col => col.id === activeColumnId);
        const overIndex = board.columns.findIndex(col => col.id === overColumnId);
        
        if (activeIndex !== -1 && overIndex !== -1) {
          setBoard(prev => {
            if (!prev) return prev;
            
            return {
              ...prev,
              columns: arrayMove(prev.columns, activeIndex, overIndex)
            };
          });

          // Update column order on server
          try {
            await fetch(`http://localhost:4000/api/columns/${activeColumnId}/move`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order: overIndex }),
              credentials: 'include'
            });
            toast.success('Colonne déplacée !');
          } catch {
            toast.error('Erreur lors du déplacement');
            loadBoard();
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
        setBoard(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            columns: prev.columns.map(col => {
              if (col.id === activeColumn.id) {
                return {
                  ...col,
                  cards: arrayMove(col.cards, activeIndex, overIndex)
                };
              }
              return col;
            })
          };
        });

        // Update order on server
        try {
          const newOrder = overIndex;
          await fetch(`http://localhost:4000/api/cards/${activeId}/move`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              columnId: activeColumn.id, 
              order: newOrder 
            }),
            credentials: 'include'
          });
        } catch {
          toast.error('Erreur lors du déplacement');
          loadBoard();
        }
      }
    } else {
      // Moving to different column - already handled in handleDragOver
      try {
        const overIndex = overCard ? 
          overColumn.cards.findIndex(card => card.id === overId) : 
          overColumn.cards.length;

        await fetch(`http://localhost:4000/api/cards/${activeId}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            columnId: overColumn.id, 
            order: overIndex 
          }),
          credentials: 'include'
        });
        
        toast.success('Carte déplacée !');
      } catch {
        toast.error('Erreur lors du déplacement');
        loadBoard();
      }
    }
  };

  const findCardById = (id: string): CardItem | null => {
    if (!board) return null;
    
    for (const column of board.columns) {
      const card = column.cards.find(card => card.id === id);
      if (card) return card;
    }
    return null;
  };

  const findColumnByCardId = (cardId: string): Column | null => {
    if (!board) return null;
    
    return board.columns.find(col => 
      col.cards.some(card => card.id === cardId)
    ) || null;
  };

  const findColumnById = (id: string): Column | null => {
    if (!board) return null;
    
    return board.columns.find(col => col.id === id) || null;
  };

  const updateColumnTitle = async (columnId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/columns/${columnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
        credentials: 'include'
      });

      if (response.ok) {
        setBoard(prev => prev ? {
          ...prev,
          columns: prev.columns.map(col => 
            col.id === columnId ? { ...col, title: newTitle.trim() } : col
          )
        } : null);
        toast.success('Colonne mise à jour !');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const handleCardClick = (card: CardItem) => {
    setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleCardUpdate = (cardId: string, updates: any) => {
    setBoard(prev => prev ? {
      ...prev,
      columns: prev.columns.map(col => ({
        ...col,
        cards: col.cards.map(card => 
          card.id === cardId ? { ...card, ...updates } : card
        )
      }))
    } : null);
    
    // Update selectedCard if it's the same card
    if (selectedCard?.id === cardId) {
      setSelectedCard(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleCardDelete = async (cardId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/cards/${cardId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setBoard(prev => prev ? {
          ...prev,
          columns: prev.columns.map(col => ({
            ...col,
            cards: col.cards.filter(card => card.id !== cardId)
          }))
        } : null);
        toast.success('Carte supprimée !');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tableau non trouvé</h2>
          <Link to="/dashboard">
            <Button>Retour au dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Inviter</span>
                </Button>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">
                    {user?.name || user?.email}
                  </span>
                </div>
                
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Board Content */}
        <main className="p-6">
          <div className="flex space-x-6 overflow-x-auto pb-6">
            {/* Columns with SortableContext */}
            <SortableContext 
              items={board.columns.map(col => `column-${col.id}`)} 
              strategy={horizontalListSortingStrategy}
            >
                  {board.columns.map((column) => (
                  <DraggableColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    cards={column.cards}
                    showNewCard={showNewCard === column.id}
                    newCardTitle={newCardTitle}
                    onNewCardTitleChange={setNewCardTitle}
                    onCreateCard={(title) => createCard(column.id, title)}
                    onCancelNewCard={() => {
                      setShowNewCard(null);
                      setNewCardTitle('');
                    }}
                    onShowNewCard={() => setShowNewCard(column.id)}
                    onDeleteColumn={() => deleteColumn(column.id)}
                    onEditColumn={(newTitle) => updateColumnTitle(column.id, newTitle)}
                    onDeleteCard={deleteCard}
                    onCardClick={handleCardClick}
                  />
                ))}
            </SortableContext>

            {/* Add Column */}
            {showNewColumn ? (
              <div className="bg-gray-50 rounded-xl p-4 w-80 flex-shrink-0 border border-gray-200 shadow-sm">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createColumn(newColumnTitle);
                  }} 
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="columnTitle">Titre de la colonne</Label>
                    <Input
                      id="columnTitle"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      placeholder="Ex: À faire, En cours..."
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Créer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNewColumn(false);
                        setNewColumnTitle('');
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="w-80 flex-shrink-0">
                <Button
                  onClick={() => setShowNewColumn(true)}
                  className="w-full h-12 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-gray-400"
                  variant="ghost"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter une colonne
                </Button>
              </div>
            )}
          </div>
        </main>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard ? (
            <Card className="bg-white shadow-xl rotate-3 ring-2 ring-blue-500 ring-opacity-50">
              <CardContent className="p-3">
                <p className="text-sm text-gray-900">{activeCard.title}</p>
              </CardContent>
            </Card>
          ) : null}
          {activeColumn ? (
            <div className="bg-gray-50 rounded-xl p-4 w-80 border border-gray-200 shadow-xl rotate-3 ring-2 ring-blue-500 ring-opacity-50">
              <h3 className="font-semibold text-gray-900 mb-2">{activeColumn.title}</h3>
              <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full inline-block">
                {activeColumn.cards.length} cartes
              </div>
            </div>
          ) : null}
        </DragOverlay>

        {/* Card Modal */}
        {selectedCard && (
          <CardModal
            card={selectedCard}
            isOpen={showCardModal}
            onClose={() => {
              setShowCardModal(false);
              setSelectedCard(null);
            }}
            onUpdate={handleCardUpdate}
            onDelete={handleCardDelete}
          />
        )}

        {/* Invite Modal */}
        <InviteModal
          boardId={id!}
          boardTitle={board.title}
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInviteSuccess={() => {
            // Optionally reload board data to show new members
            loadBoard();
          }}
        />
      </div>
    </DndContext>
  );
}