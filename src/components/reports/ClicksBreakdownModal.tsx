import React from "react";

export type ClickTypeRow = {
  id: string;
  label: string;
  clicks: number;
  clickRate: number; // 0–1
};

export type ClicksBreakdownData = {
  id: string;
  name: string;
  subtitle?: string;
  totalClicks: number;
  clickTypes: ClickTypeRow[];
};

type ClicksBreakdownModalProps = {
  open: boolean;
  data: ClicksBreakdownData | null;
  onClose: () => void;
};

const formatPercent1 = (value: number) => `${(value * 100).toFixed(1)}%`;

const ClicksBreakdownModal: React.FC<ClicksBreakdownModalProps> = ({
  open,
  data,
  onClose,
}) => {
  if (!open || !data) return null;

  const { name, subtitle, totalClicks, clickTypes } = data;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="mt-6 w-full max-w-3xl rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header – no dividing line */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3">
          <div>
            <div className="text-[13px] font-semibold text-slate-900">
              {name}
            </div>
            <div className="text-[11px] text-slate-500">
              {subtitle ?? "Click activity for this email touch point."}
            </div>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Table only */}
        <div className="px-5 py-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="py-2 pr-3 text-left font-medium">Click type</th>
                  <th className="py-2 pr-3 text-right font-medium">Clicks</th>
                  <th className="py-2 text-right font-medium">% of total clicks</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {clickTypes.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2 pr-3 text-slate-800">{row.label}</td>
                    <td className="py-2 pr-3 text-right text-slate-900">
                      {row.clicks.toLocaleString("en-US")}
                    </td>
                    <td className="py-2 text-right text-slate-900">
                      {formatPercent1(row.clickRate)}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t border-slate-100">
                  <td className="py-2 pr-3 text-left font-semibold text-slate-700">
                    TOTAL CLICKS
                  </td>
                  <td className="py-2 pr-3 text-right font-semibold text-slate-900">
                    {totalClicks.toLocaleString("en-US")}
                  </td>
                  <td className="py-2 text-right text-slate-500">100.0%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClicksBreakdownModal;
