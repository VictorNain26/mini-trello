import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PropsWithChildren } from 'react';

export default function RequireAuth({ children }: PropsWithChildren) {
  const { user, loading, initialized, isAuthPage } = useAuth();
  const loc = useLocation();

  // Don't check auth on login/signup pages
  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!initialized) {
    return null;
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  return <>{children}</>;
}
