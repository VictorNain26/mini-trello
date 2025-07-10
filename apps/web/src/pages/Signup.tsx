import { AlertCircle, CheckCircle, Trello } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

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
        description: 'Email et mot de passe sont obligatoires',
      });
      return;
    }

    if (password.length < 6) {
      toast.error('Mot de passe trop court', {
        description: 'Le mot de passe doit contenir au moins 6 caractères',
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    // Show loading toast
    const loadingToast = toast.loading('Création du compte...', {
      description: 'Préparation de votre espace de travail',
    });

    try {
      // Create user account via direct API call (simpler)
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api-production-e29c.up.railway.app' : 'http://localhost:4000')}/api/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        }
      );

      setSubmitting(false);
      toast.dismiss(loadingToast);

      if (response.ok) {
        setSuccess(true);
        toast.success('Compte créé avec succès !', {
          description: 'Redirection vers la page de connexion...',
        });
        setTimeout(() => nav('/login'), 2000);
      } else {
        const result = await response.json().catch(() => ({}));
        const errorMsg = result.error || 'Erreur lors de la création du compte';
        setError(errorMsg);
        toast.error('Erreur de création', {
          description: errorMsg,
        });
      }
    } catch {
      setSubmitting(false);
      toast.dismiss(loadingToast);
      const errorMsg = 'Erreur de connexion au serveur';
      setError(errorMsg);
      toast.error('Erreur réseau', {
        description: 'Vérifiez votre connexion internet',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 overflow-y-auto">
      <div className="flex min-h-screen">
        {/* Section gauche - Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 xl:p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center space-y-8 max-w-md">
            <div className="flex justify-center">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-2xl">
                <Trello className="h-16 w-16 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Rejoignez Mini Trello
              </h1>
              <p className="text-xl text-emerald-100 leading-relaxed">
                Commencez à organiser vos projets dès aujourd'hui
              </p>
            </div>
            <div className="space-y-3 text-emerald-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Création de compte gratuite</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Accès immédiat à tous les outils</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Collaboration sans limites</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="w-full lg:w-1/2 xl:w-3/5 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Header mobile */}
            <div className="lg:hidden text-center space-y-3 mb-8">
              <div className="flex justify-center">
                <div className="p-3 bg-emerald-600 rounded-xl shadow-lg">
                  <Trello className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Mini Trello</h1>
            </div>

            <Card className="shadow-xl border border-gray-200/80 backdrop-blur-sm bg-white/95">
              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="text-2xl lg:text-3xl text-center font-bold text-gray-800">
                  Créer un compte
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Rejoignez notre communauté
                </CardDescription>
              </CardHeader>

              <form onSubmit={submit}>
                <CardContent className="space-y-4 px-6 lg:px-8">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      Nom (optionnel)
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Votre nom"
                      value={name}
                      onChange={(e) => setName(e.target.value.trim())}
                      className="h-11 text-sm border-2 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      required
                      className="h-11 text-sm border-2 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Mot de passe
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 text-sm border-2 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    />
                    <p className="text-xs text-gray-600">
                      Le mot de passe doit contenir au moins 6 caractères
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-green-700 font-medium">
                        Compte créé avec succès ! Redirection...
                      </p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 px-6 lg:px-8 pb-6">
                  <Button
                    type="submit"
                    className="w-full h-11 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all shadow-lg"
                    disabled={submitting || success}
                  >
                    {submitting
                      ? 'Création en cours...'
                      : success
                        ? 'Compte créé !'
                        : 'Créer le compte'}
                  </Button>

                  <div className="text-center text-sm text-gray-600">
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
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-md">
              <CardContent className="p-4 lg:p-6">
                <div className="text-center text-sm text-blue-700 space-y-2">
                  <p className="font-medium">✨ Avec Mini Trello, vous pouvez :</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <span>📋</span>
                      <span>Tableaux personnalisés</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>🎯</span>
                      <span>Organisation par colonnes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>🚀</span>
                      <span>Collaboration temps réel</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>💡</span>
                      <span>Suivi des projets</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
