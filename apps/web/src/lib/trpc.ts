import { createTRPCReact, httpBatchLink } from '@trpc/react-query'
import type { AppRouter } from '@api/index'

export const trpc = createTRPCReact<AppRouter>()

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_API_URL ?? ''}/trpc`,
      fetch: (url, opts) => fetch(url, { ...opts, credentials: 'include' })
    })
  ]
})
