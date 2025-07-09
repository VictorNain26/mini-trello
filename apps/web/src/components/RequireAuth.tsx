import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function RequireAuth({ children }: PropsWithChildren) {
  const { user, loading, initialized, isAuthPage } = useAuth();
  const loc = useLocation();

  // Don't check auth on login/signup pages
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Show loading state immediately without waiting for full initialization
  if (loading || !initialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  return <>{children}</>;
}
