import { io, type Socket } from 'socket.io-client';

const HOST =
  import.meta.env.VITE_API_HOST ??
  (import.meta.env.DEV ? 'localhost:4000' : window.location.host);

export const socket: Socket = io(`http://${HOST}`, {
  path: '/socket.io',
  autoConnect: false,
  withCredentials: true,
});
