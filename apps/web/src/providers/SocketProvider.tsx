import {
  createContext,
  useContext,
  useEffect,
  useRef,
  PropsWithChildren,
} from 'react';
import { io, type Socket } from 'socket.io-client';

const HOST =
  import.meta.env.VITE_API_HOST ??
  (import.meta.env.DEV ? 'localhost:4000' : window.location.host);

/* ───── context & factory ───── */
const SocketContext = createContext<Socket | null>(null);

function makeSocket(): Socket {
  return io(`http://${HOST}`, {
    path: '/socket.io',
    autoConnect: false,
    withCredentials: true,
  });
}

/* ───── provider ───── */
export function SocketProvider({ children }: PropsWithChildren) {
  const socketRef = useRef<Socket>(makeSocket());

  useEffect(() => {
    const s = socketRef.current;
    if (!s.connected) s.connect();
    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

/* ───── hook ───── */
export const useSocket = () => {
  const s = useContext(SocketContext);
  if (!s) throw new Error('useSocket must be used inside <SocketProvider>');
  return s;
};
