import { AlignLeft, Calendar, Edit3, Save, Tag, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CardModalProps {
  card: {
    id: string;
    title: string;
    description?: string;
    labels?: string[];
    dueDate?: string;
    columnId: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (cardId: string, updates: any) => void;
  onDelete: (cardId: string) => void;
}

const LABEL_COLORS = [
  { name: 'Rouge', color: 'bg-red-500', value: 'red' },
  { name: 'Orange', color: 'bg-orange-500', value: 'orange' },
  { name: 'Jaune', color: 'bg-yellow-500', value: 'yellow' },
  { name: 'Vert', color: 'bg-green-500', value: 'green' },
  { name: 'Bleu', color: 'bg-blue-500', value: 'blue' },
  { name: 'Violet', color: 'bg-purple-500', value: 'purple' },
  { name: 'Rose', color: 'bg-pink-500', value: 'pink' },
  { name: 'Gris', color: 'bg-gray-500', value: 'gray' },
];

export function CardModal({ card, isOpen, onClose, onUpdate, onDelete }: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [labels, setLabels] = useState<string[]>(card.labels || []);
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.split('T')[0] : '');

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || '');
    setLabels(card.labels || []);
    setDueDate(card.dueDate ? card.dueDate.split('T')[0] : '');
  }, [card]);

  const handleSave = async () => {
    // Validation du titre
    if (!title.trim()) {
      toast.error('Le titre de la carte est obligatoire');
      return;
    }

    // Validation de la date (ne doit pas être dans le passé)
    if (dueDate) {
      const selectedDate = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day

      if (selectedDate < today) {
        toast.error("La date d'échéance ne peut pas être dans le passé");
        return;
      }
    }

    try {
      const updates = {
        title: title.trim(),
        description: description.trim(),
        labels,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://api-production-e29c.up.railway.app'}/api/cards/${card.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la mise à jour');
        return;
      }

      onUpdate(card.id, updates);
      toast.success('Carte mise à jour !');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const toggleLabel = (labelValue: string) => {
    setLabels((prev) =>
      prev.includes(labelValue) ? prev.filter((l) => l !== labelValue) : [...prev, labelValue]
    );
  };

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      onDelete(card.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 bg-white">
        <CardHeader className="bg-white border-b border-gray-200 flex flex-row items-center justify-between space-y-0 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Edit3 className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Modifier la carte</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full h-10 w-10 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-8 max-h-[calc(90vh-140px)] overflow-y-auto bg-gray-50">
          {/* Titre */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <Label
              htmlFor="card-title"
              className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4"
            >
              <Edit3 className="h-5 w-5 text-blue-600" />
              <span>Titre</span>
            </Label>
            <Input
              id="card-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold border-2 border-gray-300 focus:border-blue-500 focus:ring-0 h-14 px-4 bg-white transition-all duration-200"
              placeholder="Nom de la tâche..."
            />
          </div>

          {/* Labels */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <Label className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
              <Tag className="h-5 w-5 text-blue-600" />
              <span>Étiquettes</span>
            </Label>

            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {LABEL_COLORS.map((label) => (
                  <button
                    key={label.value}
                    onClick={() => toggleLabel(label.value)}
                    className={`relative px-4 py-3 rounded-lg text-white font-medium text-sm transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                      label.color
                    } ${
                      labels.includes(label.value)
                        ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg scale-105'
                        : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    {labels.includes(label.value) && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                    {label.name}
                  </button>
                ))}
              </div>

              {labels.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2 font-medium">
                    {labels.length} étiquette{labels.length > 1 ? 's' : ''} sélectionnée
                    {labels.length > 1 ? 's' : ''} :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {labels.map((labelValue) => {
                      const label = LABEL_COLORS.find((l) => l.value === labelValue);
                      return label ? (
                        <span
                          key={labelValue}
                          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${label.color}`}
                        >
                          {label.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date d'échéance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <Label
              htmlFor="due-date"
              className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4"
            >
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Date d'échéance</span>
            </Label>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-12 px-4 border-2 border-gray-300 focus:border-blue-500 focus:ring-0 text-base transition-all duration-200"
                />
                <p className="text-sm text-gray-600 flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Sélectionnez une date future pour cette tâche</span>
                </p>
              </div>

              {dueDate && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Échéance programmée</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {new Date(dueDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700 font-medium">
                      Dans{' '}
                      {Math.ceil(
                        (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      )}{' '}
                      jour
                      {Math.ceil(
                        (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      ) !== 1
                        ? 's'
                        : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <Label
              htmlFor="description"
              className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4"
            >
              <AlignLeft className="h-5 w-5 text-blue-600" />
              <span>Description</span>
            </Label>

            <div className="space-y-3">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez cette tâche en détail : objectifs, étapes, ressources nécessaires..."
                className="w-full min-h-[160px] p-4 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-200 text-base leading-relaxed"
              />

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Ajoutez autant de détails que nécessaire</span>
                <span
                  className={`font-medium ${
                    description.length > 500
                      ? 'text-orange-600'
                      : description.length > 0
                        ? 'text-blue-600'
                        : 'text-gray-400'
                  }`}
                >
                  {description.length} caractères
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Actions Bar */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleDelete}
            className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
            <span>Supprimer</span>
          </Button>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-8 py-2 text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-medium"
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
