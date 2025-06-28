import { useEffect } from 'react';
import { createStore } from 'zustand';
import { socket } from '@/lib/socket';

type User = { id: string; name: string; color: string };

const usePresenceStore = createStore<{
  users: User[];
  join: (u: User) => void;
  leave: (id: string) => void;
  setAll: (list: User[]) => void;
}>((set) => ({
  users: [],
  join: (u)  => set(s => ({ users: [...s.users, u] })),
  leave: id  => set(s => ({ users: s.users.filter(u => u.id !== id) })),
  setAll: l  => set({ users: l })
}));

export function usePresence(boardId: string) {
  const { users, join, leave, setAll } = usePresenceStore();
  useEffect(() => {
    socket.connect();
    socket.emit('join-board', boardId);

    // s’identifier (mock)
    socket.emit('presence:join', {
      name: 'User ' + Math.floor(Math.random()*100),
      color: `hsl(${Math.random()*360} 80% 60%)`
    });

    socket.on('presence:list', setAll);
    socket.on('presence:join', join);
    socket.on('presence:leave', leave);

    return () => {
      socket.off('presence:list', setAll);
      socket.off('presence:join', join);
      socket.off('presence:leave', leave);
      socket.disconnect();
    };
  }, [boardId]);

  return users;
}
