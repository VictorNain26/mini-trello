export function Board({ boardId }: { boardId: string }) {
  const { data: board } = trpc.board.get.useQuery({ boardId });
  const move = trpc.board.moveCard.useMutation();
  const io   = useSocket();               // encapsule socket.io-client

  // Ecoute temps-réel
  useEffect(() => {
    io.emit('join', boardId);
    io.on('board:update', data => queryClient.invalidateQueries({queryKey:['board', boardId]}));
    return () => io.off('board:update');
  }, [boardId]);

  const sensors = useSensors(useSensor(PointerSensor));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    move.mutate({ boardId, cardId: active.id, from: active.data.from,
                  to: over?.data?.to ?? active.data.from, pos: over?.data?.index ?? 0 });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      {/* Columns & Cards */}
    </DndContext>
  );
}
