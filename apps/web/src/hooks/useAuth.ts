import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type User = {
  id: string;
  name?: string;
  email?: string;
  color?: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    async function checkSession() {
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
      }
    }

    checkSession();
  }, []);

  useEffect(() => {
    if (!loading && !user && !loc.pathname.startsWith('/login') && !loc.pathname.startsWith('/signup')) {
      nav('/login');
    }
  }, [loading, user, loc.pathname, nav]);

  const signIn = async (email: string, password: string) => {
    try {
      // First get CSRF token with cookies
      const csrfResponse = await fetch('http://localhost:4000/api/auth/csrf', {
        credentials: 'include',
      });
      
      if (!csrfResponse.ok) {
        return { success: false, error: 'Failed to get CSRF token' };
      }
      
      const { csrfToken } = await csrfResponse.json();
      
      // Get cookies from the CSRF response
      const cookies = csrfResponse.headers.get('set-cookie');
      
      // Then sign in with proper cookies
      const response = await fetch('http://localhost:4000/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email,
          password,
          csrfToken,
          callbackUrl: window.location.origin,
          json: 'true',
        }),
        credentials: 'include',
      });
      
      // Handle redirect responses (302)
      if (response.status === 302) {
        const location = response.headers.get('location');
        if (location?.includes('error=')) {
          const errorParam = new URL(location).searchParams.get('error');
          return { success: false, error: errorParam || 'Authentication failed' };
        }
        
        // If no error in redirect, check session
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
            return { success: true };
          }
        }
      }
      
      if (response.ok) {
        const result = await response.json();
        if (!result.error) {
          // Check session after successful login
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
              return { success: true };
            }
          }
        } else {
          return { success: false, error: result.error };
        }
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const signOut = async () => {
    await fetch('http://localhost:4000/api/auth/signout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    nav('/login');
  };

  return { 
    user, 
    loading, 
    signIn, 
    signOut 
  };
}
