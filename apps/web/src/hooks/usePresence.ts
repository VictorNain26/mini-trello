import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { useSocket } from '@/providers/SocketProvider';
import { useAuth } from './useAuth';

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
  const socket   = useSocket();
  const authUser = useAuth();

  const join   = usePresenceStore((s) => s.join);
  const leave  = usePresenceStore((s) => s.leave);
  const setAll = usePresenceStore((s) => s.setAll);

  /* fallback si pas connecté */
  const fallbackName  = authUser?.email ?? 'Guest';
  const fallbackColor = authUser?.color ?? 'hsl(200 80% 60%)';

  const sentJoin = useRef(false);

  useEffect(() => {
    const sendIdentity = () => {
      if (sentJoin.current) return;
      socket.emit('join-board', boardId);
      socket.emit('presence:join', {
        boardId,
        name:  authUser?.name  ?? fallbackName,
        color: fallbackColor,
      });
      sentJoin.current = true;
    };

    sendIdentity();
    socket.on('connect',        sendIdentity);
    socket.on('presence:list',  setAll);
    socket.on('presence:join',  join);
    socket.on('presence:leave', leave);

    const hb = setInterval(() => socket.emit('presence:ping', boardId), 15_000);

    return () => {
      socket.off('connect',        sendIdentity);
      socket.off('presence:list',  setAll);
      socket.off('presence:join',  join);
      socket.off('presence:leave', leave);
      clearInterval(hb);
    };
  }, [boardId, authUser, fallbackName, fallbackColor, join, leave, setAll, socket]);

  /* selector */
  return usePresenceStore((s) => s.users);
}
