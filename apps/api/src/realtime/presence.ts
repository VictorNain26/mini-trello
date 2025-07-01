import type { Server, Socket } from 'socket.io';
import type { RedisClientType } from 'redis';

export type User = { id: string; name: string; color: string; ts: number };

const TTL  = 30;                               // secondes
const KEY  = (b: string) => `presence:${b}`;    // hash boardId → {socket.id: JSON}

export function registerPresence(io: Server, redis?: RedisClientType) {
  io.on('connection', (socket: Socket) => {
    /* JOIN ---------------------------------------------------------------- */
    socket.on(
      'presence:join',
      async (msg: Omit<User, 'id' | 'ts'> & { boardId: string }) => {
        const user: User = { ...msg, id: socket.id, ts: Date.now() };

        socket.join(msg.boardId);

        if (redis) {
          await redis.hSet(KEY(msg.boardId), socket.id, JSON.stringify(user));
        }

        /* nettoie les fantômes (< now - TTL) et renvoie la liste propre */
        let list: User[] = [];
        if (redis) {
          const raw = await redis.hGetAll(KEY(msg.boardId));
          for (const [sid, json] of Object.entries(raw)) {
            const u = JSON.parse(json) as User;
            if (Date.now() - u.ts > TTL * 1_000) {
              await redis.hDel(KEY(msg.boardId), sid); // purge fantôme
            } else {
              list.push(u);
            }
          }
        } else {
          list = [user]; // fallback dev
        }

        io.to(msg.boardId).emit('presence:join', user);
        socket.emit('presence:list', list);
      },
    );

    /* HEARTBEAT ----------------------------------------------------------- */
    socket.on('presence:ping', async (boardId: string) => {
      if (redis) {
        const json = await redis.hGet(KEY(boardId), socket.id);
        if (json) {
          const u = { ...(JSON.parse(json) as User), ts: Date.now() };
          await redis.hSet(KEY(boardId), socket.id, JSON.stringify(u));
        }
      }
    });

    /* DISCONNECT ---------------------------------------------------------- */
    socket.on('disconnect', async () => {
      const rooms = [...socket.rooms].filter((r) => r !== socket.id);
      for (const boardId of rooms) {
        if (redis) await redis.hDel(KEY(boardId), socket.id);
        io.to(boardId).emit('presence:leave', socket.id);
      }
    });
  });
}
