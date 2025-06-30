import PresenceBar from './components/PresenceBar';
import { Board } from './features/Board';

export default function App() {
  const boardId = 'demo';

  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 border-b flex items-center justify-between">
        <h1 className="text-lg font-bold">Mini-Trello</h1>
        <PresenceBar boardId={boardId} />
      </header>
      <main className="flex-1 overflow-hidden">
        <Board boardId={boardId} />
      </main>
    </div>
  );
}
