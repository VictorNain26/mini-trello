import { useState } from 'react';
import { X, Mail, UserPlus, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InviteModalProps {
  boardId: string;
  boardTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess: () => void;
}

export function InviteModal({ boardId, boardTitle, isOpen, onClose, onInviteSuccess }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Veuillez entrer un email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Veuillez entrer un email valide');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/boards/${boardId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Invitation envoyée !');
        setEmail('');
        onInviteSuccess();
        onClose();
      } else if (data.requiresSignup) {
        toast.error(
          `L'utilisateur ${data.email} doit créer un compte avant de pouvoir rejoindre le board`,
          { duration: 5000 }
        );
      } else {
        toast.error(data.error || 'Erreur lors de l\'invitation');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border border-gray-200 bg-white">
        <CardHeader className="bg-white border-b border-gray-200 flex flex-row items-center justify-between space-y-0 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Inviter un membre</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Board : {boardTitle}</p>
            </div>
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
        
        <CardContent className="p-6">
          <form onSubmit={handleInvite} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="invite-email" className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>Adresse email</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                className="h-12 px-4 border-2 border-gray-300 focus:border-blue-500 focus:ring-0 text-base"
                autoFocus
                disabled={loading}
              />
              <p className="text-sm text-gray-600 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>La personne invitée doit avoir un compte pour rejoindre le board. Si elle n'en a pas, elle devra s'inscrire d'abord.</span>
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
                disabled={loading}
                className="px-6 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={loading || !email.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 flex items-center space-x-2 shadow-lg transition-all duration-200"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Envoi...' : 'Envoyer l\'invitation'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}