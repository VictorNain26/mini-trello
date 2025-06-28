import { io, type Socket } from 'socket.io-client';

const API_HOST = import.meta.env.VITE_API_HOST ?? 'localhost:4000';
export const socket: Socket = io(`ws://${API_HOST}`, {
  autoConnect: false
});
