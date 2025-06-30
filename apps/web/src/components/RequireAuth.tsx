import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PropsWithChildren } from 'react';

export default function RequireAuth({ children }: PropsWithChildren) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null;           /* spinner éventuel */
  if (!user)  return <Navigate to="/login" state={{ from: loc }} replace />;

  return <>{children}</>;
}
