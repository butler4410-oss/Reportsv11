import React, { useEffect, useMemo, useState } from "react";

type DraggableKpi = {
  id: string;
  element: React.ReactNode;
};

type DraggableKpiRowProps = {
  reportKey: string;
  tiles: DraggableKpi[];
};

export const DraggableKpiRow: React.FC<DraggableKpiRowProps> = ({
  reportKey,
  tiles,
}) => {
  const [order, setOrder] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const tilesById = useMemo(() => {
    const map: Record<string, DraggableKpi> = {};
    tiles.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [tiles]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `kpiOrder:${reportKey}`;
    const stored = window.localStorage.getItem(key);
    const tileIds = tiles.map((t) => t.id);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        // Filter to only include IDs that exist in current tiles
        const filtered = parsed.filter((id) => tilesById[id]);
        // Add any new tile IDs that aren't in the stored order
        const newIds = tileIds.filter((id) => !filtered.includes(id));
        const combined = [...filtered, ...newIds];
        if (combined.length) {
          setOrder(combined);
          return;
        }
      } catch {
        // ignore
      }
    }
    setOrder(tileIds);
  }, [reportKey, tiles, tilesById]);

  useEffect(() => {
    if (typeof window === "undefined" || !order.length) return;
    const key = `kpiOrder:${reportKey}`;
    window.localStorage.setItem(key, JSON.stringify(order));
  }, [order, reportKey]);

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();

    if (!draggingId || draggingId === targetId) return;

    setOrder((prev) => {
      const currentIndex = prev.indexOf(draggingId);
      const targetIndex = prev.indexOf(targetId);
      if (currentIndex === -1 || targetIndex === -1) return prev.slice();

      const next = prev.slice();
      next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, draggingId);
      return next;
    });
  };

  const handleDrop = () => {
    setDraggingId(null);
  };

  const wrapperBase =
    "cursor-move transition-shadow rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-300";
  const draggingClass = "ring-2 ring-sky-300 shadow-md";

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {order.map((id) => {
        const tile = tilesById[id];
        if (!tile) return null;

        return (
          <div
            key={id}
            draggable
            onDragStart={() => handleDragStart(id)}
            onDragOver={(e) => handleDragOver(e, id)}
            onDrop={handleDrop}
            onDragEnd={handleDrop}
            className={
              draggingId === id
                ? `${wrapperBase} ${draggingClass}`
                : wrapperBase
            }
          >
            {tile.element}
          </div>
        );
      })}
    </div>
  );
};

export default DraggableKpiRow;
