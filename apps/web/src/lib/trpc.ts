import { createTRPCReact } from '@trpc/react-query';
import {
  createWSClient,
  httpBatchLink,
  wsLink,
  splitLink,
} from '@trpc/client';
import type { AppRouter } from '@mini-trello/server';

const API_HOST =
  import.meta.env.VITE_API_HOST ??
  (import.meta.env.DEV ? 'localhost:4000' : window.location.host);

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: wsLink({
        client: createWSClient({ url: `ws://${API_HOST}` }),
      }),
      false: httpBatchLink({ url: `http://${API_HOST}/trpc` }),
    }),
  ],
});
