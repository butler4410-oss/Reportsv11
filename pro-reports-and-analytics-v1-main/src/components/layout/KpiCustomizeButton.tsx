import React, { useEffect, useRef, useState, useMemo } from "react";
import { KpiOption } from "@/hooks/useKpiPreferences";
import { GripVertical } from "lucide-react";

interface KpiCustomizeButtonProps {
  reportId: string;
  options: KpiOption[];
  selectedIds: string[];
  onChangeSelected: (next: string[]) => void;
  title?: string;
}

const KpiCustomizeButton: React.FC<KpiCustomizeButtonProps> = ({
  reportId,
  options,
  selectedIds,
  onChangeSelected,
  title = "KPI tiles",
}) => {
  const [open, setOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const allIds = options.map((o) => o.id);
  const allSelected = selectedIds.length === allIds.length;

  // Order: selected items first (in selectedIds order), then unselected
  const orderedOptions = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    const selectedOrdered = selectedIds
      .map((id) => options.find((o) => o.id === id))
      .filter((o): o is KpiOption => o !== undefined);
    const unselected = options.filter((o) => !selectedSet.has(o.id));
    return [...selectedOrdered, ...unselected];
  }, [options, selectedIds]);

  const toggleId = (id: string) => {
    if (selectedIds.includes(id)) {
      onChangeSelected(selectedIds.filter((x) => x !== id));
    } else {
      onChangeSelected([...selectedIds, id]);
    }
  };

  // Reorder selectedIds when a selected KPI is dragged onto another selected KPI
  const reorderSelected = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    const sourceIndex = selectedIds.indexOf(sourceId);
    const targetIndex = selectedIds.indexOf(targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const next = [...selectedIds];
    next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, sourceId);
    onChangeSelected(next);
  };

  const handleDragStart = (id: string, e: React.DragEvent<HTMLDivElement>) => {
    if (!selectedIds.includes(id)) return;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (targetId: string, e: React.DragEvent<HTMLDivElement>) => {
    if (!draggingId) return;
    if (!selectedIds.includes(draggingId)) return;
    if (!selectedIds.includes(targetId)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (targetId: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggingId) return;
    reorderSelected(draggingId, targetId);
    setDraggingId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleToggleAll = () => {
    if (allSelected) {
      onChangeSelected([]);
    } else {
      onChangeSelected(allIds);
    }
  };

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm hover:bg-slate-50 whitespace-nowrap shrink-0"
      >
        <span className="text-sky-500">✨</span>
        <span>Customize KPIs</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-lg z-20">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                {title}
              </span>
              <span className="text-[10px] text-slate-400">
                Drag to reorder
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleAll}
              className="text-[11px] font-medium text-sky-600 hover:text-sky-700"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto py-2 px-2">
            {orderedOptions.map((opt) => {
              const isSelected = selectedIds.includes(opt.id);
              const isDragging = draggingId === opt.id;

              return (
                <div
                  key={opt.id}
                  draggable={isSelected}
                  onDragStart={(e) => handleDragStart(opt.id, e)}
                  onDragOver={(e) => handleDragOver(opt.id, e)}
                  onDrop={(e) => handleDrop(opt.id, e)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md ${
                    isDragging
                      ? "bg-sky-50 border border-sky-200"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleId(opt.id)}
                    className="flex flex-1 items-center gap-2 text-xs text-left"
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        isSelected
                          ? "border-sky-500 bg-sky-500"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <span className="text-[10px] leading-none text-white">
                          ✓
                        </span>
                      )}
                    </span>
                    <span className="text-slate-700">{opt.label}</span>
                  </button>

                  {/* Drag handle */}
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-md ${
                      isSelected
                        ? "cursor-grab text-slate-400 hover:text-slate-600"
                        : "cursor-not-allowed text-slate-200"
                    }`}
                    title={isSelected ? "Drag to reorder" : "Select to reorder"}
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 px-4 py-2 text-right">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KpiCustomizeButton;
