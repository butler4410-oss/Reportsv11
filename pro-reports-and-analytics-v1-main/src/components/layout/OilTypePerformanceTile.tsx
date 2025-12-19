import React, { useMemo } from "react";

type OilTypeRow = {
  oilType: string;
  invoices: number;
  revenue: number;
  avgTicket: number;
};

const OIL_TYPES: OilTypeRow[] = [
  { oilType: "Conventional", invoices: 1320, revenue: 101200, avgTicket: 76 },
  { oilType: "High Mileage", invoices: 620, revenue: 61200, avgTicket: 99 },
  { oilType: "Synthetic Blend", invoices: 980, revenue: 95600, avgTicket: 98 },
  { oilType: "Full Synthetic", invoices: 1360, revenue: 134400, avgTicket: 99 },
];

const getShareColorClass = (pct: number): string => {
  if (pct >= 35) return "text-emerald-600";
  if (pct >= 25) return "text-sky-600";
  return "text-slate-800";
};

export const OilTypePerformanceTile: React.FC = () => {
  const totalRevenue = useMemo(
    () => OIL_TYPES.reduce((sum, row) => sum + row.revenue, 0),
    []
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">
            Revenue mix by oil type
          </h2>
          <p className="text-[11px] text-slate-500">
            Relative revenue and invoice mix by oil type.
          </p>
        </div>
      </header>

      {/* Single overview list – details table removed for now */}
      <div className="mt-4 divide-y divide-slate-100">
        {OIL_TYPES.map((row) => {
          const sharePct =
            totalRevenue > 0 ? (row.revenue / totalRevenue) * 100 : 0;

          return (
            <div key={row.oilType} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-4">
                {/* Left: oil type + basic stats */}
                <div className="min-w-0 flex-1">
                  {/* Match One-Off Campaign Tracker title styling */}
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {row.oilType}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {row.invoices.toLocaleString()} invoices · Avg ticket{" "}
                    <span className="font-medium">
                      $
                      {row.avgTicket.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>

                {/* Right: revenue + share, aligned + consistent width */}
                <div className="text-right shrink-0 min-w-[140px]">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Revenue
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {row.revenue.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  <div
                    className={`mt-0.5 text-[11px] font-medium ${getShareColorClass(
                      sharePct
                    )}`}
                  >
                    {sharePct.toFixed(1)}% of oil revenue
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OilTypePerformanceTile;
