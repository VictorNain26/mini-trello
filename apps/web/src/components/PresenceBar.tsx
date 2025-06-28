import { usePresence } from '@/hooks/usePresence';
import { motion, AnimatePresence } from 'framer-motion';

export function PresenceBar({ boardId }: { boardId: string }) {
  const users = usePresence(boardId);

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {users.map(u => (
          <motion.div
            key={u.id}
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-8 h-8 rounded-full grid place-content-center text-xs font-medium text-white shadow"
            style={{ background: u.color }}
            title={u.name}
          >
            {u.name.slice(0,2).toUpperCase()}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
