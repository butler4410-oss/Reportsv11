import React from "react";
import InlineLegend from "@/components/common/InlineLegend";

type StoreAddressQuality = {
  storeName: string;
  validPct: number;
  badPct: number;
  blankPct: number;
};

type Props = {
  rows: StoreAddressQuality[];
};

export const AddressQualityByStoreTile: React.FC<Props> = ({ rows }) => {
  return (
    <section className="rounded-2xl border border-tp-border bg-white p-4 shadow-sm">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-semibold text-tp-blue-dark">
          Address quality by store
        </h2>
        <p className="text-[11px] text-tp-grey-dark">
          Valid vs bad vs blank
        </p>
      </header>

      {/* Bars */}
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div
            key={row.storeName}
            className="flex items-center gap-3"
          >
            {/* Store label */}
            <div className="w-40 text-[11px] text-tp-grey-dark">
              {row.storeName}
            </div>

            {/* Segmented pastel bar */}
            <div className="flex-1">
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-tp-pastel-blue">
                {/* Valid */}
                <div
                  className="h-full bg-tp-pastel-green"
                  style={{ width: `${row.validPct}%` }}
                />
                {/* Bad */}
                <div
                  className="h-full bg-tp-pastel-yellow"
                  style={{ width: `${row.badPct}%` }}
                />
                {/* Blank */}
                <div
                  className="h-full bg-tp-pastel-red"
                  style={{ width: `${row.blankPct}%` }}
                />
              </div>
            </div>

            {/* Right-side label */}
            <div className="w-24 text-right text-[11px] text-tp-grey-dark">
              {row.validPct.toFixed(1)}% valid
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <InlineLegend
        items={[
          { label: "Valid", colorClass: "bg-tp-green" },
          { label: "Bad", colorClass: "bg-tp-yellow" },
          { label: "Blank", colorClass: "bg-tp-red" },
        ]}
      />
    </section>
  );
};

export default AddressQualityByStoreTile;
