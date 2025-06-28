import { createTRPCReact, httpBatchLink, wsLink, splitLink } from '@trpc/react-query';
import type { AppRouter } from '@mini-trello/server';
import { createWSClient } from '@trpc/client/links/wsLink';

const API_HOST = import.meta.env.VITE_API_HOST ?? 'localhost:4000';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition: op => op.type === 'subscription',
      true:       wsLink({ client: createWSClient({ url: `ws://${API_HOST}` }) }),
      false:      httpBatchLink({ url: `http://${API_HOST}/trpc` })
    })
  ]
});
