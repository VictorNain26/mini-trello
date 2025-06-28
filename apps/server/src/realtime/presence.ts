import type { Server, Socket } from 'socket.io';

type User = { id: string; name: string; color: string };
const users = new Map<string, User>();

export function registerPresence(io: Server) {
  io.on('connection', (socket: Socket) => {
    socket.on('presence:join', (user: Omit<User, 'id'>) => {
      const u: User = { ...user, id: socket.id };
      users.set(socket.id, u);

      // 1) informer tout le monde
      io.emit('presence:join', u);
      // 2) envoyer la liste courante au nouveau
      socket.emit('presence:list', Array.from(users.values()));
    });

    socket.on('disconnect', () => {
      const u = users.get(socket.id);
      users.delete(socket.id);
      if (u) io.emit('presence:leave', u.id);
    });
  });
}
