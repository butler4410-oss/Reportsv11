import React from "react";

export type CaptureByLocationRow = {
  id: string;
  name: string;
  capturePct: number;
  captureMomPct: number;
  blankPct: number;
  blankMomPct: number;
  enrichedPct: number;
};

type CaptureByLocationTileProps = {
  title: string;
  channelLabel: string;
  rows: CaptureByLocationRow[];
};

const formatSignedPercent = (value: number) => {
  if (!value) return "0.0%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

export const CaptureByLocationTile: React.FC<CaptureByLocationTileProps> = ({
  title,
  channelLabel,
  rows,
}) => {
  const lower = channelLabel.toLowerCase();

  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <header>
        <div className="text-[13px] font-semibold text-slate-900">{title}</div>
        <div className="text-[11px] text-slate-500">
          {channelLabel} capture mix, blanks and MoM trends by store. Data enrichment shows % of {lower} addresses corrected or updated by Throttle.
        </div>
      </header>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-[11px]">
          <thead className="border-b border-slate-100 text-slate-500">
            <tr>
              <th className="py-2 pr-3 text-left font-medium">Store</th>
              <th className="py-2 pl-3 pr-1 text-right font-medium">
                <div className="flex justify-end gap-6">
                  <div className="w-16 text-right">{channelLabel} capture</div>
                  <div className="w-24 text-right">No {lower} (blank)</div>
                  <div className="w-24 text-right">Data enrichment</div>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="py-2 pr-3 text-slate-800 whitespace-nowrap">{row.name}</td>

                <td className="py-2 pl-3 pr-1 text-right">
                  <div className="flex justify-end gap-6 text-right">
                    {/* Capture % + MoM */}
                    <div className="w-16 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{row.capturePct.toFixed(0)}%</div>
                      <div className={
                        row.captureMomPct > 0
                          ? "text-emerald-600 font-semibold"
                          : row.captureMomPct < 0
                          ? "text-red-500 font-semibold"
                          : "text-slate-500"
                      }>
                        MoM {formatSignedPercent(row.captureMomPct)}
                      </div>
                    </div>

                    {/* Blank % + MoM (up = red, down = green) */}
                    <div className="w-24 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{row.blankPct.toFixed(0)}%</div>
                      <div className={
                        row.blankMomPct > 0
                          ? "text-red-500 font-semibold"
                          : row.blankMomPct < 0
                          ? "text-emerald-600 font-semibold"
                          : "text-slate-500"
                      }>
                        MoM {formatSignedPercent(row.blankMomPct)}
                      </div>
                    </div>

                    {/* Data enrichment */}
                    <div className="w-24 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{row.enrichedPct.toFixed(1)}%</div>
                      <div className="text-slate-500">Corrected by Throttle</div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CaptureByLocationTile;
