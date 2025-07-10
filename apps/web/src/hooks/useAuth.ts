import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type User = {
  id: string;
  name?: string;
  email?: string;
};

const SESSION_STORAGE_KEY = 'mini-trello-session';
const SESSION_EXPIRY_KEY = 'mini-trello-session-expiry';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  const isAuthPage = loc.pathname.startsWith('/login') || loc.pathname.startsWith('/signup');

  // Check if session is still valid based on expiry
  const isSessionValid = useCallback(() => {
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    if (!expiry) return false;
    return Date.now() < parseInt(expiry);
  }, []);

  // Load session from localStorage
  const loadStoredSession = useCallback(() => {
    try {
      const storedUser = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedUser && isSessionValid()) {
        const user = JSON.parse(storedUser);
        setUser(user);
        return true;
      }
      // Clear expired session
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
      return false;
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
      return false;
    }
  }, [isSessionValid]);

  // Save session to localStorage
  const saveSession = useCallback((userData: User) => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userData));
      // Set expiry to 24 hours from now
      const expiry = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString());
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, []);

  // Clear session from localStorage
  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  }, []);

  const checkSession = useCallback(
    async (forceRefresh = false) => {
      // First, try to load from localStorage if not forcing refresh
      if (!forceRefresh && loadStoredSession()) {
        setLoading(false);
        setInitialized(true);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api-production-e29c.up.railway.app' : 'http://localhost:4000')}/api/auth/session`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const session = await response.json();
          if (session?.user) {
            const userData = {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
            };
            setUser(userData);
            saveSession(userData);
          } else {
            setUser(null);
            clearSession();
          }
        } else {
          setUser(null);
          clearSession();

          if (response.status === 401 && !isAuthPage) {
            toast.error('Session expirée. Veuillez vous reconnecter.');
            nav('/login');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        // Don't clear session on network error, keep cached version
        if (!loadStoredSession()) {
          setUser(null);
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    },
    [loadStoredSession, saveSession, clearSession, isAuthPage, nav]
  );

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const signIn = async (email: string, password: string) => {
    try {
      const loadingToast = toast.loading('Connexion en cours...');

      // Get CSRF token first
      const csrfResponse = await fetch(
        `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api-production-e29c.up.railway.app' : 'http://localhost:4000')}/api/auth/csrf`,
        {
          credentials: 'include',
        }
      );

      if (!csrfResponse.ok) {
        throw new Error('Failed to get CSRF token');
      }

      const { csrfToken } = await csrfResponse.json();

      // Sign in with credentials
      await fetch(
        `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api-production-e29c.up.railway.app' : 'http://localhost:4000')}/api/auth/callback/credentials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            email,
            password,
            csrfToken,
            callbackUrl: `${window.location.origin}/dashboard`,
          }),
          credentials: 'include',
          redirect: 'manual',
        }
      );

      // Check if sign in was successful by checking session
      await checkSession(true);

      toast.dismiss(loadingToast);

      // Wait a moment for state to update, then check session response directly
      const sessionResponse = await fetch(
        `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api-production-e29c.up.railway.app' : 'http://localhost:4000')}/api/auth/session`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        if (session?.user) {
          toast.success('Connexion réussie !');
          nav('/dashboard');
          return { success: true };
        }
      }

      toast.error('Identifiants incorrects');
      return { success: false };
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Erreur de connexion');
      return { success: false };
    }
  };

  const signOut = async () => {
    try {
      const loadingToast = toast.loading('Déconnexion...');

      // Get CSRF token
      const csrfResponse = await fetch(
        `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api-production-e29c.up.railway.app' : 'http://localhost:4000')}/api/auth/csrf`,
        {
          credentials: 'include',
        }
      );

      if (csrfResponse.ok) {
        const { csrfToken } = await csrfResponse.json();

        // Sign out
        await fetch(
          `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api-production-e29c.up.railway.app' : 'http://localhost:4000')}/api/auth/signout`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              csrfToken,
              callbackUrl: `${window.location.origin}/login`,
            }),
            credentials: 'include',
          }
        );
      }

      setUser(null);
      clearSession();

      toast.dismiss(loadingToast);
      toast.success('Déconnexion réussie');
      nav('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      setUser(null);
      clearSession();
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
    checkSession: () => checkSession(true),
  };
}
