import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@mini-trello/server';

const HOST =
  import.meta.env.VITE_API_HOST ??
  (import.meta.env.DEV ? 'localhost:4000' : window.location.host);

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `http://${HOST}/trpc`,
      headers: () => ({ /* auth headers ici si besoin */ }),
    }),
  ],
});
