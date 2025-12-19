import React from "react";

type OilTypeUsageTile = {
  id: string;
  label: string;
  invoices: number;
  usagePct: number;
  bgClass: string;
  textClass: string;
};

const OIL_TYPE_USAGE_TILES: OilTypeUsageTile[] = [
  {
    id: "conventional",
    label: "Conventional",
    invoices: 1320,
    usagePct: 31,
    bgClass: "bg-sky-50",
    textClass: "text-sky-800",
  },
  {
    id: "synBlend",
    label: "Syn Blend",
    invoices: 980,
    usagePct: 22,
    bgClass: "bg-indigo-50",
    textClass: "text-indigo-800",
  },
  {
    id: "fullSyn",
    label: "Full Syn",
    invoices: 1360,
    usagePct: 37,
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-800",
  },
  {
    id: "highMileage",
    label: "High mileage",
    invoices: 620,
    usagePct: 8,
    bgClass: "bg-amber-50",
    textClass: "text-amber-800",
  },
  {
    id: "unclassified",
    label: "Unclassified",
    invoices: 200,
    usagePct: 2,
    bgClass: "bg-rose-50",
    textClass: "text-rose-800",
  },
];

type Props = {
  selectedIds?: string[];
};

const OilTypeUsageKpis: React.FC<Props> = ({ selectedIds }) => {
  const visibleTiles = selectedIds 
    ? OIL_TYPE_USAGE_TILES.filter((tile) => selectedIds.includes(tile.id))
    : OIL_TYPE_USAGE_TILES;

  if (visibleTiles.length === 0) return null;

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {visibleTiles.map((tile) => (
        <div
          key={tile.id}
          className={`rounded-2xl border border-slate-200 p-3 shadow-sm ${tile.bgClass}`}
        >
          <div className="space-y-1">
            {/* Oil type */}
            <div className="text-[11px] font-semibold tracking-wide text-slate-600">
              {tile.label}
            </div>

            {/* Invoice count */}
            <div className="text-[11px] text-slate-500">
              {tile.invoices.toLocaleString()} invoices
            </div>

            {/* STAT = % usage */}
            <div
              className={`mt-1 text-xl font-semibold tracking-tight ${tile.textClass}`}
            >
              {tile.usagePct.toFixed(1)}%
            </div>

            {/* Helper line */}
            <div className="text-[11px] text-slate-500">
              Share of oil invoices
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default OilTypeUsageKpis;
