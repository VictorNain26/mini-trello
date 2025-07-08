import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DroppableColumn } from './DroppableColumn';
import { DraggableCard } from './DraggableCard';

interface DraggableColumnProps {
  id: string;
  title: string;
  cards: Array<{
    id: string;
    title: string;
    description?: string;
    labels?: string[];
    dueDate?: string;
    columnId: string;
  }>;
  showNewCard: boolean;
  newCardTitle: string;
  onNewCardTitleChange: (title: string) => void;
  onCreateCard: (title: string) => void;
  onCancelNewCard: () => void;
  onShowNewCard: () => void;
  onDeleteColumn: () => void;
  onEditColumn: (newTitle: string) => void;
  onDeleteCard: (cardId: string) => void;
  onCardClick: (card: any) => void;
  isReadOnly?: boolean;
}

export function DraggableColumn({
  id,
  title,
  cards,
  showNewCard,
  newCardTitle,
  onNewCardTitleChange,
  onCreateCard,
  onCancelNewCard,
  onShowNewCard,
  onDeleteColumn,
  onEditColumn,
  onDeleteCard,
  onCardClick,
  isReadOnly = false,
}: DraggableColumnProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `column-${id}`,
    data: {
      type: 'column',
      id,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEditTitle = async () => {
    if (editTitle.trim() && editTitle.trim() !== title) {
      await onEditColumn(editTitle.trim());
    }
    setEditingTitle(false);
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`bg-gray-50 rounded-xl p-4 min-w-[250px] sm:min-w-[280px] w-auto flex-shrink-0 border border-gray-200 shadow-sm self-start ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      {/* Column Header avec drag handle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center flex-1 space-x-2">
          {/* Drag Handle pour la colonne */}
          {!isReadOnly && (
            <div
              {...attributes}
              {...listeners}
              className="p-1 rounded cursor-grab active:cursor-grabbing hover:bg-gray-200 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          )}

          <div className="flex-1">
            {editingTitle ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleEditTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEditTitle();
                  }
                  if (e.key === 'Escape') {
                    setEditTitle(title);
                    setEditingTitle(false);
                  }
                }}
                className="text-sm font-semibold"
                autoFocus
              />
            ) : (
              <div className="flex items-center space-x-2">
                <h3 
                  className="font-semibold text-gray-900 cursor-pointer hover:text-gray-700"
                  onClick={() => {
                    setEditTitle(title);
                    setEditingTitle(true);
                  }}
                >
                  {title}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  {cards.length}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {!isReadOnly && (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setEditTitle(title);
                setEditingTitle(true);
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
              onClick={onDeleteColumn}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Cards */}
      <DroppableColumn 
        id={id} 
        items={cards.map(card => card.id)}
      >
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            id={card.id}
            title={card.title}
            {...(card.description && { description: card.description })}
            {...(card.labels && { labels: card.labels })}
            {...(card.dueDate && { dueDate: card.dueDate })}
            {...(!isReadOnly && { onDelete: () => onDeleteCard(card.id) })}
            onClick={() => onCardClick(card)}
            isReadOnly={isReadOnly}
          />
        ))}
      </DroppableColumn>

      {/* Add Card */}
      {!isReadOnly && showNewCard ? (
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onCreateCard(newCardTitle);
          }} 
          className="space-y-3"
        >
          <Input
            value={newCardTitle}
            onChange={(e) => onNewCardTitleChange(e.target.value)}
            placeholder="Titre de la carte"
            className="text-sm"
            autoFocus
          />
          <div className="flex space-x-2">
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
              Ajouter
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancelNewCard}
            >
              Annuler
            </Button>
          </div>
        </form>
      ) : !isReadOnly ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowNewCard}
          className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une carte
        </Button>
      ) : null}
    </div>
  );
}