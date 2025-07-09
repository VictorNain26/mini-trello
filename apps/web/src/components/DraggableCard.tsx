import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlignLeft, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DraggableCardProps {
  id: string;
  title: string;
  description?: string;
  labels?: string[];
  dueDate?: string;
  onDelete?: () => void;
  onClick: () => void;
  isReadOnly?: boolean;
}

const LABEL_COLORS: Record<string, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  gray: 'bg-gray-500',
};

export function DraggableCard({
  id,
  title,
  description,
  labels = [],
  dueDate,
  onDelete,
  onClick,
  isReadOnly = false,
}: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = dueDate && new Date(dueDate) < new Date();
  const isDueSoon =
    dueDate && !isOverdue && new Date(dueDate).getTime() - Date.now() < 24 * 60 * 60 * 1000; // 24h

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!isReadOnly && listeners)}
      className={`bg-white shadow-sm hover:shadow-md transition-all ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} group ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
      onClick={(e) => {
        // Ne pas ouvrir le modal si on clique sur le bouton delete
        if ((e.target as HTMLElement).closest('[data-delete-button]')) {
          return;
        }
        // Ne pas ouvrir le modal en mode lecture seule
        if (!isReadOnly) {
          onClick();
        }
      }}
    >
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Labels */}
          {labels && labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {labels.map((label) => (
                <div
                  key={label}
                  className={`h-2 w-8 rounded-full ${LABEL_COLORS[label] || 'bg-gray-400'}`}
                />
              ))}
            </div>
          )}

          {/* Titre et bouton delete */}
          <div className="flex items-start justify-between">
            <p className="text-sm text-gray-900 flex-1 leading-relaxed font-medium">{title}</p>
            {onDelete && (
              <Button
                data-delete-button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-red-400 hover:text-red-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Description preview */}
          {description && (
            <div className="flex items-center text-xs text-gray-500">
              <AlignLeft className="h-3 w-3 mr-1" />
              <span className="truncate">{description.substring(0, 50)}...</span>
            </div>
          )}

          {/* Date d'échéance */}
          {dueDate && (
            <div
              className={`flex items-center text-xs ${
                isOverdue
                  ? 'text-red-600 bg-red-50'
                  : isDueSoon
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-500'
              } px-2 py-1 rounded`}
            >
              <Calendar className="h-3 w-3 mr-1" />
              <span>
                {new Date(dueDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
              {isOverdue && <span className="ml-1 font-semibold">!</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
