import React, { useMemo } from "react";
import { InlineLegend } from "@/components/common/InlineLegend";

type CouponRow = {
  code: string;
  redemptions: number;
};

type Props = {
  rows: CouponRow[];
};

const COUPON_COLORS: Record<string, { bar: string; dot: string }> = {
  OIL10: { bar: "bg-tp-pastel-green", dot: "bg-tp-green" },
  SYN20: { bar: "bg-tp-pastel-blue", dot: "bg-tp-blue-light" },
  WEB15: { bar: "bg-tp-pastel-purple", dot: "bg-tp-purple" },
  VIP25: { bar: "bg-tp-pastel-yellow", dot: "bg-tp-yellow" },
  WELCOME5: { bar: "bg-tp-pastel-red", dot: "bg-tp-red" },
};

const getColor = (code: string) =>
  COUPON_COLORS[code] || { bar: "bg-slate-200", dot: "bg-slate-400" };

export const CouponMixTile: React.FC<Props> = ({ rows }) => {
  const totalRedemptions = useMemo(
    () => rows.reduce((sum, row) => sum + row.redemptions, 0),
    [rows]
  );

  // Sort rows by contribution (highest to lowest)
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => b.redemptions - a.redemptions);
  }, [rows]);

  const legendItems = useMemo(
    () =>
      sortedRows.map((row) => {
        const share =
          totalRedemptions > 0
            ? ((row.redemptions / totalRedemptions) * 100).toFixed(1)
            : "0.0";
        return {
          label: `${row.code} · ${share}%`,
          colorClass: getColor(row.code).dot,
        };
      }),
    [sortedRows, totalRedemptions]
  );

  if (!rows.length || totalRedemptions <= 0) return null;

  return (
    <section className="rounded-2xl border border-tp-border bg-white p-4 shadow-sm">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold text-tp-grey-dark">
            Coupon mix by contribution
          </h2>
          <p className="text-[11px] text-slate-500">
            Share of redemptions by coupon code.
          </p>
        </div>
      </header>

      {/* Segmented bar */}
      <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
        {sortedRows.map((row) => {
          const share =
            totalRedemptions > 0
              ? (row.redemptions / totalRedemptions) * 100
              : 0;
          if (share <= 0) return null;
          return (
            <div
              key={row.code}
              className={`${getColor(row.code).bar} h-full`}
              style={{ width: `${share}%` }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3">
        <InlineLegend items={legendItems} />
      </div>
    </section>
  );
};

export default CouponMixTile;
