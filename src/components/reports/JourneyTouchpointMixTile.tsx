import React, { useMemo } from "react";

type JourneyTouchpointMixItem = {
  id: number;
  label: string;
  responses: number;
  respPct: number;
};

type Props = {
  items: JourneyTouchpointMixItem[];
};

const SEGMENT_COLORS: { bar: string; dot: string }[] = [
  { bar: "bg-tp-pastel-green", dot: "bg-tp-green" },
  { bar: "bg-tp-pastel-blue", dot: "bg-tp-blue-light" },
  { bar: "bg-tp-pastel-purple", dot: "bg-tp-purple" },
  { bar: "bg-tp-pastel-yellow", dot: "bg-tp-yellow" },
  { bar: "bg-tp-pastel-red", dot: "bg-tp-red" },
  { bar: "bg-emerald-100", dot: "bg-emerald-500" },
  { bar: "bg-sky-100", dot: "bg-sky-500" },
  { bar: "bg-indigo-100", dot: "bg-indigo-500" },
  { bar: "bg-amber-100", dot: "bg-amber-500" },
  { bar: "bg-rose-100", dot: "bg-rose-500" },
  { bar: "bg-teal-100", dot: "bg-teal-500" },
  { bar: "bg-violet-100", dot: "bg-violet-500" },
  { bar: "bg-orange-100", dot: "bg-orange-500" },
  { bar: "bg-cyan-100", dot: "bg-cyan-500" },
  { bar: "bg-lime-100", dot: "bg-lime-500" },
];

const getColor = (index: number) => SEGMENT_COLORS[index % SEGMENT_COLORS.length];

export const JourneyTouchpointMixTile: React.FC<Props> = ({ items }) => {
  const totalResponses = useMemo(
    () => items.reduce((sum, item) => sum + item.responses, 0),
    [items]
  );

  // Organize items into columns of 3
  const columns = useMemo(() => {
    const cols: { item: typeof items[0]; index: number; share: number }[][] = [];
    const itemsPerColumn = 3;
    const numColumns = Math.ceil(items.length / itemsPerColumn);

    for (let col = 0; col < numColumns; col++) {
      const columnItems: { item: typeof items[0]; index: number; share: number }[] = [];
      for (let row = 0; row < itemsPerColumn; row++) {
        const itemIndex = col * itemsPerColumn + row;
        if (itemIndex < items.length) {
          const item = items[itemIndex];
          const share = totalResponses > 0
            ? (item.responses / totalResponses) * 100
            : 0;
          columnItems.push({ item, index: itemIndex, share });
        }
      }
      cols.push(columnItems);
    }
    return cols;
  }, [items, totalResponses]);

  if (!items.length || totalResponses <= 0) return null;

  return (
    <section className="rounded-2xl border border-tp-border bg-white p-4 shadow-sm">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold text-tp-grey-dark">
            Touchpoint mix by contribution
          </h2>
          <p className="text-[11px] text-slate-500">
            Share of total responses by touch point.
          </p>
        </div>
      </header>

      {/* Segmented bar */}
      <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
        {items.map((item, index) => {
          const share =
            totalResponses > 0
              ? (item.responses / totalResponses) * 100
              : 0;
          if (share <= 0) return null;
          return (
            <div
              key={item.id}
              className={`${getColor(index).bar} h-full`}
              style={{ width: `${share}%` }}
            />
          );
        })}
      </div>

      {/* Legend - columns of 3, evenly spaced with horizontal scroll on overflow */}
      <div className="mt-4 overflow-hidden">
        <div className="flex justify-between min-w-max gap-4">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-1.5">
              {col.map(({ item, index, share }) => (
                <div
                  key={item.id}
                  className="inline-flex items-center gap-1.5 text-[11px] text-slate-700"
                >
                  <span
                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${getColor(index).dot}`}
                  />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                  <span className="text-slate-500 whitespace-nowrap">· {share.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JourneyTouchpointMixTile;
