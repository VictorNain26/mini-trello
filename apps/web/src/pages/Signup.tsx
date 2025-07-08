import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trello, AlertCircle, CheckCircle } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const nav = useNavigate();
  const { user, loading } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      nav('/dashboard', { replace: true });
    }
  }, [loading, user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation client
    if (!email || !password) {
      toast.error('Champs requis', {
        description: 'Email et mot de passe sont obligatoires'
      });
      return;
    }

    if (password.length < 6) {
      toast.error('Mot de passe trop court', {
        description: 'Le mot de passe doit contenir au moins 6 caractères'
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    // Show loading toast
    const loadingToast = toast.loading('Création du compte...', {
      description: 'Préparation de votre espace de travail'
    });

    try {
      // Create user account via direct API call (simpler)
      const response = await fetch('http://localhost:4000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      setSubmitting(false);
      toast.dismiss(loadingToast);

      if (response.ok) {
        setSuccess(true);
        toast.success('Compte créé avec succès !', {
          description: 'Redirection vers la page de connexion...'
        });
        setTimeout(() => nav('/login'), 2000);
      } else {
        const result = await response.json().catch(() => ({}));
        const errorMsg = result.error || 'Erreur lors de la création du compte';
        setError(errorMsg);
        toast.error('Erreur de création', {
          description: errorMsg
        });
      }
    } catch {
      setSubmitting(false);
      toast.dismiss(loadingToast);
      const errorMsg = 'Erreur de connexion au serveur';
      setError(errorMsg);
      toast.error('Erreur réseau', {
        description: 'Vérifiez votre connexion internet'
      });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 p-4 overflow-hidden">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo et titre */}
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-600 rounded-xl shadow-lg">
              <Trello className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Mini Trello</h1>
          </div>
          <p className="text-lg text-gray-600 font-medium">Créez votre compte et commencez à organiser</p>
        </div>

        <Card className="shadow-2xl border border-gray-200/80 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-2 pb-8">
            <CardTitle className="text-3xl text-center font-bold text-gray-800">Créer un compte</CardTitle>
            <CardDescription className="text-center text-lg text-gray-600">
              Rejoignez-nous et organisez vos projets efficacement
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={submit}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-semibold text-gray-700">Nom (optionnel)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom"
                  value={name}
                  onChange={(e) => setName(e.target.value.trim())}
                  className="h-12 text-base border-2 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  required
                  className="h-12 text-base border-2 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-semibold text-gray-700">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base border-2 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
                <p className="text-sm text-gray-600 font-medium">
                  Le mot de passe doit contenir au moins 6 caractères
                </p>
              </div>

              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-base text-red-700 font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-base text-green-700 font-medium">Compte créé avec succès ! Redirection...</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-6 px-8 pb-8">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all shadow-lg" 
                disabled={submitting || success}
              >
                {submitting ? 'Création en cours...' : success ? 'Compte créé !' : 'Créer le compte'}
              </Button>
              
              <div className="text-center text-base text-gray-600">
                Déjà un compte ?{' '}
                <Link 
                  to="/login" 
                  className="text-emerald-600 hover:text-emerald-700 hover:underline font-semibold transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Avantages */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-blue-700 space-y-2">
              <p className="font-medium">✨ Avec Mini Trello, vous pouvez :</p>
              <ul className="text-xs space-y-1">
                <li>📋 Créer des tableaux personnalisés</li>
                <li>🎯 Organiser vos tâches par colonnes</li>
                <li>🚀 Collaborer en temps réel</li>
                <li>💡 Suivre l'avancement de vos projets</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
