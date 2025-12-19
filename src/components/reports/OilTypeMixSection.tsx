import React from "react";

type MixSegment = {
  label: string;
  pct: number;
  colorClass: string;
};

const MIX_BY_VOLUME: MixSegment[] = [
  { label: "Conventional", pct: 31, colorClass: "bg-tp-pastel-blue" },
  { label: "Syn blend", pct: 22, colorClass: "bg-tp-pastel-purple" },
  { label: "Full syn", pct: 37, colorClass: "bg-tp-pastel-green" },
  { label: "High mileage", pct: 8, colorClass: "bg-tp-pastel-yellow" },
  { label: "Unclassified", pct: 2, colorClass: "bg-tp-pastel-orange" },
];

const MIX_BY_REVENUE: MixSegment[] = [
  { label: "Conventional", pct: 18, colorClass: "bg-tp-pastel-blue" },
  { label: "Syn blend", pct: 24, colorClass: "bg-tp-pastel-purple" },
  { label: "Full syn", pct: 41, colorClass: "bg-tp-pastel-green" },
  { label: "High mileage", pct: 16, colorClass: "bg-tp-pastel-yellow" },
  { label: "Unclassified", pct: 1, colorClass: "bg-tp-pastel-orange" },
];

const Bar: React.FC<{ segments: MixSegment[] }> = ({ segments }) => (
  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
    <div className="flex h-full w-full">
      {segments.map((seg) => (
        <div
          key={seg.label}
          className={`${seg.colorClass} h-full`}
          style={{ width: `${seg.pct}%` }}
        />
      ))}
    </div>
  </div>
);

const Legend: React.FC<{ segments: MixSegment[] }> = ({ segments }) => (
  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">
    {segments.map((seg) => (
      <div key={seg.label} className="inline-flex items-center gap-1">
        <span
          className={`h-2 w-2 rounded-full ${seg.colorClass}`}
          aria-hidden="true"
        />
        <span>
          {seg.label} · {seg.pct}%
        </span>
      </div>
    ))}
  </div>
);

const OilTypeMixSection: React.FC = () => {
  return (
    <section className="space-y-4">
      {/* Mix by volume */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-semibold text-slate-900">
              Mix by volume
            </h2>
            <p className="text-[11px] text-slate-500">
              % of oil invoices by type
            </p>
          </div>
        </div>

        <Bar segments={MIX_BY_VOLUME} />
        <Legend segments={MIX_BY_VOLUME} />
      </div>

      {/* Mix by revenue */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-semibold text-slate-900">
              Mix by revenue
            </h2>
            <p className="text-[11px] text-slate-500">
              Share of oil revenue by type
            </p>
          </div>
        </div>

        <Bar segments={MIX_BY_REVENUE} />
        <Legend segments={MIX_BY_REVENUE} />
      </div>
    </section>
  );
};

export default OilTypeMixSection;
