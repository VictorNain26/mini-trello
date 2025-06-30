import { trpc } from '@/lib/trpc';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export function useAuth() {
  const { data, isLoading } = trpc.user.queryUser.useQuery(
    undefined,
    { retry: false },
  );

  const nav  = useNavigate();
  const loc  = useLocation();

  useEffect(() => {
    if (!isLoading && !data && !loc.pathname.startsWith('/login')) {
      nav('/login');
    }
  }, [isLoading, data, loc.pathname, nav]);

  return { user: data, loading: isLoading };
}
