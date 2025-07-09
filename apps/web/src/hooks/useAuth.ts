import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { isAuthError } from '../utils/auth';

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

  // Simple function to check if we're on auth pages
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/session`,
          {
            credentials: 'include',
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

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
          // Handle auth errors (401, etc.)
          if (isAuthError({ status: response.status })) {
            if (!isAuthPage) {
              toast.error('Session expirée. Veuillez vous reconnecter.');
              nav('/login');
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('Session check timed out');
        } else {
          console.error('Session check failed:', error);
        }
        // Don't clear session on network error, keep cached version
        if (!loadStoredSession()) {
          setUser(null);
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    },
    [loadStoredSession, saveSession, clearSession]
  );

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Refresh session periodically (every 30 minutes)
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (user && !isAuthPage) {
          checkSession(true);
        }
      },
      30 * 60 * 1000
    ); // 30 minutes

    return () => clearInterval(interval);
  }, [user, isAuthPage, checkSession]);

  const signIn = async (email: string, password: string) => {
    try {
      const loadingToast = toast.loading('Connexion en cours...');

      const csrfResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/csrf`,
        {
          credentials: 'include',
        }
      );

      if (!csrfResponse.ok) {
        toast.dismiss(loadingToast);
        toast.error('Erreur de sécurité');
        return { success: false };
      }

      const { csrfToken } = await csrfResponse.json();

      await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/callback/credentials`,
        {
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
        }
      );

      const sessionResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/session`,
        {
          credentials: 'include',
        }
      );

      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        if (session?.user) {
          const userData = {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
          };
          setUser(userData);
          saveSession(userData);

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

      const csrfResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/csrf`,
        {
          credentials: 'include',
        }
      );

      if (csrfResponse.ok) {
        const { csrfToken } = await csrfResponse.json();

        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/signout`, {
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
      clearSession();

      toast.dismiss(loadingToast);
      toast.success('Déconnexion réussie');
      nav('/login');
    } catch {
      setUser(null);
      clearSession();
      toast.success('Déconnexion réussie');
      nav('/login');
    }
  };

  // Expose auth error handler for use in other hooks/components
  const handleAuthError = useCallback(
    (error: any) => {
      if (isAuthError(error)) {
        clearSession();
        setUser(null);
        if (!isAuthPage) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          nav('/login');
        }
      }
    },
    [clearSession, isAuthPage, nav]
  );

  return {
    user,
    loading,
    initialized,
    isAuthPage,
    signIn,
    signOut,
    checkSession: () => checkSession(true),
    handleAuthError,
  };
}
