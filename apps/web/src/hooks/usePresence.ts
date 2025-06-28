import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { socket } from '@/lib/socket';

export type UserPresence = { id: string; name: string; color: string };

interface PresenceState {
  users: UserPresence[];
  join: (u: UserPresence) => void;
  leave: (id: string) => void;
  setAll: (l: UserPresence[]) => void;
}

const usePresenceStore = create<PresenceState>()((set) => ({
  users: [],
  join: (u) =>
    set((s) =>
      s.users.some((x) => x.id === u.id) ? s : { users: [...s.users, u] },
    ),
  leave: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
  setAll: (l) => set({ users: l }),
}));

export function usePresence(boardId: string): UserPresence[] {
  /* Injection des actions via le hook */
  const join   = usePresenceStore((s) => s.join);
  const leave  = usePresenceStore((s) => s.leave);
  const setAll = usePresenceStore((s) => s.setAll);

  const sentJoin = useRef(false);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const sendIdentity = () => {
      if (sentJoin.current) return;
      socket.emit('join-board', boardId);
      socket.emit('presence:join', {
        name: `User ${Math.floor(Math.random() * 100)}`,
        color: `hsl(${Math.random() * 360} 80% 60%)`,
      });
      sentJoin.current = true;
    };

    socket.on('connect', sendIdentity);
    socket.on('presence:list', setAll);
    socket.on('presence:join', join);
    socket.on('presence:leave', leave);

    return () => {
      socket.off('connect', sendIdentity);
      socket.off('presence:list', setAll);
      socket.off('presence:join', join);
      socket.off('presence:leave', leave);
      /* on NE ferme PAS le socket ici → évite les erreurs strict-mode */
    };
  }, [boardId, join, leave, setAll]);

  /* renvoie un sélecteur pour ne re-rendre que si la liste change */
  return usePresenceStore((s) => s.users);
}
