import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trello, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const { signIn, user, loading } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [loading, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation client
    if (!email || !password) {
      toast.error('Champs requis', {
        description: 'Veuillez remplir tous les champs'
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError('Échec de la connexion');
      }
    } catch {
      setError('Échec de la connexion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-y-auto">
      <div className="flex min-h-screen">
        {/* Section gauche - Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 xl:p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center space-y-8 max-w-md">
            <div className="flex justify-center">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-2xl">
                <Trello className="h-16 w-16 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Mini Trello
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Organisez vos projets avec simplicité et efficacité
              </p>
            </div>
            <div className="space-y-3 text-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Tableaux collaboratifs en temps réel</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Gestion intuitive des tâches</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Interface moderne et responsive</span>
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
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <Trello className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Mini Trello</h1>
            </div>

            <Card className="shadow-xl border border-gray-200/80 backdrop-blur-sm bg-white/95">
              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="text-2xl lg:text-3xl text-center font-bold text-gray-800">
                  Connexion
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Accédez à votre espace de travail
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 px-6 lg:px-8">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="demo@demo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="h-11 text-sm border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="demo"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="h-11 text-sm border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4 px-6 lg:px-8 pb-6">
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-sm font-semibold bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-lg" 
                    disabled={submitting}
                  >
                    {submitting ? 'Connexion en cours...' : 'Se connecter'}
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    Pas encore de compte ?{' '}
                    <Link 
                      to="/signup" 
                      className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors"
                    >
                      Créer un compte
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>

            {/* Info demo */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-md">
              <CardContent className="p-4 lg:p-6">
                <div className="text-center space-y-2">
                  <p className="font-bold text-base text-blue-800">🚀 Compte de démonstration</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-700">
                      Email: <code className="bg-blue-200 px-2 py-1 rounded-md font-mono text-blue-900 text-xs">demo@demo.com</code>
                    </p>
                    <p className="text-blue-700">
                      Mot de passe: <code className="bg-blue-200 px-2 py-1 rounded-md font-mono text-blue-900 text-xs">demo</code>
                    </p>
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
