import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type User = {
  id: string;
  name?: string;
  email?: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  // Simple function to check if we're on auth pages
  const isAuthPage = loc.pathname.startsWith('/login') || loc.pathname.startsWith('/signup');

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/session', {
        credentials: 'include',
      });

      if (response.ok) {
        const session = await response.json();
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const signIn = async (email: string, password: string) => {
    try {
      const loadingToast = toast.loading('Connexion en cours...');

      const csrfResponse = await fetch('http://localhost:4000/api/auth/csrf', {
        credentials: 'include',
      });

      if (!csrfResponse.ok) {
        toast.dismiss(loadingToast);
        toast.error('Erreur de sécurité');
        return { success: false };
      }

      const { csrfToken } = await csrfResponse.json();

      await fetch('http://localhost:4000/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email,
          password,
          csrfToken,
          callbackUrl: `${window.location.origin}/dashboard`,
        }),
        credentials: 'include',
        redirect: 'manual',
      });

      const sessionResponse = await fetch('http://localhost:4000/api/auth/session', {
        credentials: 'include',
      });

      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
          });

          toast.dismiss(loadingToast);
          toast.success('Connexion réussie !');
          nav('/dashboard');
          return { success: true };
        }
      }

      toast.dismiss(loadingToast);
      toast.error('Identifiants incorrects');
      return { success: false };
    } catch {
      toast.error('Erreur de connexion');
      return { success: false };
    }
  };

  const signOut = async () => {
    try {
      const loadingToast = toast.loading('Déconnexion...');

      const csrfResponse = await fetch('http://localhost:4000/api/auth/csrf', {
        credentials: 'include',
      });

      if (csrfResponse.ok) {
        const { csrfToken } = await csrfResponse.json();

        await fetch('http://localhost:4000/api/auth/signout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            csrfToken,
            callbackUrl: `${window.location.origin}/login`,
          }),
          credentials: 'include',
        });
      }

      setUser(null);

      toast.dismiss(loadingToast);
      toast.success('Déconnexion réussie');
      nav('/login');
    } catch {
      toast.success('Déconnexion réussie');
      nav('/login');
    }
  };

  return {
    user,
    loading,
    initialized,
    isAuthPage,
    signIn,
    signOut,
  };
}
