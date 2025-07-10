import { Columns3, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [boards, setBoards] = useState<{ owned: any[]; shared: any[] }>({ owned: [], shared: [] });
  const [loading, setLoading] = useState(false);
  const [boardsLoaded, setBoardsLoaded] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();

  const loadBoards = async () => {
    if (boardsLoaded) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api-production-e29c.up.railway.app' : 'http://localhost:4000')}/api/boards`,
        {
          credentials: 'include',
        }
      );
      if (response.ok) {
        const data = await response.json();
        // Handle both old format (array) and new format (object)
        if (Array.isArray(data)) {
          setBoards({ owned: data, shared: [] });
        } else {
          setBoards(data);
        }
        setBoardsLoaded(true);
      } else {
        console.error('Boards load failed:', response.status, response.statusText);
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          signOut();
        }
      }
    } catch (error) {
      console.error('Load boards error:', error);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadBoards();
    }
  }, [user, authLoading]);

  const createBoard = async (title: string) => {
    if (!title.trim()) return;

    // Check for duplicate board names
    const existingBoard = boards.owned.find(
      (board) => board.title.toLowerCase() === title.trim().toLowerCase()
    );
    if (existingBoard) {
      toast.error('Un tableau avec ce nom existe déjà');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api-production-e29c.up.railway.app' : 'http://localhost:4000')}/api/boards`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim() }),
          credentials: 'include',
        }
      );

      if (response.ok) {
        const newBoard = await response.json();
        setBoards((prev) => ({
          ...prev,
          owned: [...prev.owned, { ...newBoard, isOwner: true }],
        }));
        setNewBoardTitle('');
        setShowCreateBoard(false);
        toast.success('Tableau créé !');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la création');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBoard(newBoardTitle);
  };

  const deleteBoard = async (boardId: string, boardTitle: string) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer le tableau "${boardTitle}" ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api-production-e29c.up.railway.app' : 'http://localhost:4000')}/api/boards/${boardId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        setBoards((prev) => ({
          ...prev,
          owned: prev.owned.filter((board) => board.id !== boardId),
        }));
        toast.success('Tableau supprimé !');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Mini Trello</h1>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{user?.name || user?.email}</span>
              </div>

              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {user?.name || 'utilisateur'} !
          </h2>
          <p className="text-gray-600">
            Gérez vos projets et organisez vos tâches avec vos tableaux.
          </p>
        </div>

        {/* Create Board Section - Only show if boards exist */}
        {(boards.owned.length > 0 || boards.shared.length > 0) && (
          <div className="mb-8">
            {!showCreateBoard ? (
              <Button
                onClick={() => setShowCreateBoard(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                <span>Créer un nouveau tableau</span>
              </Button>
            ) : (
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle className="text-lg">Nouveau tableau</CardTitle>
                  <CardDescription>
                    Créez un nouveau tableau pour organiser vos tâches.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateBoard} className="space-y-4">
                    <div>
                      <Label htmlFor="boardTitle">Titre du tableau</Label>
                      <Input
                        id="boardTitle"
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        placeholder="Ex: Projet Web, Marketing..."
                        required
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {loading ? 'Création...' : 'Créer'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateBoard(false);
                          setNewBoardTitle('');
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* My Boards Section */}
        {boards.owned.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Mes tableaux</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.owned.map((board) => (
                <div key={board.id} className="relative group">
                  <Link to={`/board/${board.id}`} className="block">
                    <Card className="h-full bg-white hover:shadow-lg transition-shadow duration-200 group-hover:scale-105 transform transition-transform">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                          {board.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          Créé le {new Date(board.createdAt).toLocaleDateString('fr-FR')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>Propriétaire</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Columns3 className="h-4 w-4" />
                            <span>
                              {board._count?.columns || 0} colonne
                              {(board._count?.columns || 0) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteBoard(board.id, board.title);
                    }}
                    className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared Boards Section */}
        {boards.shared.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tableaux partagés</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.shared.map((board) => (
                <Link key={board.id} to={`/board/${board.id}`} className="block group">
                  <Card className="h-full bg-white hover:shadow-lg transition-shadow duration-200 group-hover:scale-105 transform transition-transform border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                        {board.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        Créé par {board.owner?.name || board.owner?.email} le{' '}
                        {new Date(board.createdAt).toLocaleDateString('fr-FR')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>Partagé</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Columns3 className="h-4 w-4" />
                          <span>
                            {board._count?.columns || 0} colonne
                            {(board._count?.columns || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {boardsLoaded &&
          boards.owned.length === 0 &&
          boards.shared.length === 0 &&
          !showCreateBoard && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun tableau pour le moment
              </h3>
              <p className="text-gray-600 mb-4">
                Créez votre premier tableau pour commencer à organiser vos tâches.
              </p>
              <Button
                onClick={() => setShowCreateBoard(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Créer mon premier tableau
              </Button>
            </div>
          )}

        {/* Create Board Form for Empty State */}
        {boardsLoaded &&
          boards.owned.length === 0 &&
          boards.shared.length === 0 &&
          showCreateBoard && (
            <div className="flex justify-center">
              <Card className="max-w-md w-full">
                <CardHeader>
                  <CardTitle className="text-lg">Votre premier tableau</CardTitle>
                  <CardDescription>
                    Créez votre premier tableau pour organiser vos tâches.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateBoard} className="space-y-4">
                    <div>
                      <Label htmlFor="boardTitle">Titre du tableau</Label>
                      <Input
                        id="boardTitle"
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        placeholder="Ex: Projet Web, Marketing..."
                        required
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {loading ? 'Création...' : 'Créer'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateBoard(false);
                          setNewBoardTitle('');
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
      </main>
    </div>
  );
}
