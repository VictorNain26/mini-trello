import { trpc } from '@/lib/trpc';

export function useAuth() {
  const { data } = trpc.user.queryUser.useQuery(undefined, { retry: false });
  return data; // { id, email, name, color } | null
}
