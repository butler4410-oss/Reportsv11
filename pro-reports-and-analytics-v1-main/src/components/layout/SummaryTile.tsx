import React from "react";

interface SummaryTileProps {
  label: string;
  value: string;
}

const SummaryTile: React.FC<SummaryTileProps> = ({ label, value }) => (
  <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
    <div className="text-slate-400">{label}</div>
    <div className="mt-0.5 text-base font-semibold">{value}</div>
  </div>
);

export default SummaryTile;
