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
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 overflow-hidden">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo et titre */}
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Trello className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Mini Trello</h1>
          </div>
          <p className="text-lg text-gray-600 font-medium">Bienvenue ! Connectez-vous à votre espace</p>
        </div>

        <Card className="shadow-2xl border border-gray-200/80 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-2 pb-8">
            <CardTitle className="text-3xl text-center font-bold text-gray-800">Connexion</CardTitle>
            <CardDescription className="text-center text-lg text-gray-600">
              Entrez vos identifiants pour accéder à vos tableaux
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="demo@demo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-semibold text-gray-700">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="demo"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-base text-red-700 font-medium">{error}</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-6 px-8 pb-8">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-lg" 
                disabled={submitting}
              >
                {submitting ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
              
              <div className="text-center text-base text-gray-600">
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
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <p className="font-bold text-lg text-blue-800">🚀 Compte de démonstration</p>
              <div className="space-y-2">
                <p className="text-blue-700">
                  Email: <code className="bg-blue-200 px-2 py-1 rounded-md font-mono text-blue-900">demo@demo.com</code>
                </p>
                <p className="text-blue-700">
                  Mot de passe: <code className="bg-blue-200 px-2 py-1 rounded-md font-mono text-blue-900">demo</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
