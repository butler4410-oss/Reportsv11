import React from "react";

/**
 * Shared grid layout for campaign cards.
 * Use this for One-Off Campaign Tracker and any other campaign-style tiles.
 */

export type CampaignDropRow = {
  id: string;
  label: string;          // "DROP 1", "CAMPAIGN TOTALS"
  date?: string;          // "Apr 10, 2024" (blank for totals)
  sent: number;
  opened: number;
  respPct: number;        // 0–100
  roas: number;           // e.g. 9.7
  revenue: number;        // $
  channels: ("Postcard" | "Email" | "Text")[];
  isTotal?: boolean;
};

export type CampaignCardProps = {
  name: string;
  subtitle: string;
  drops: CampaignDropRow[];
  campaignId?: string;
  onViewProof?: () => void;
  onOpenClicks?: (campaignId: string) => void;
};

const formatCurrency0 = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const formatPercent1 = (value: number) => `${value.toFixed(1)}%`;

// Shared grid definition for all campaign rows
const CAMPAIGN_GRID_CLASSES = "grid grid-cols-[minmax(0,1.7fr)_repeat(6,minmax(0,1fr))] gap-4";

const channelPillClass = (channel: "Postcard" | "Email" | "Text") => {
  switch (channel) {
    case "Postcard":
      return "bg-tp-pastel-blue text-sky-700";
    case "Email":
      return "bg-tp-pastel-green text-emerald-700";
    case "Text":
      return "bg-tp-pastel-purple text-indigo-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const CampaignCard: React.FC<CampaignCardProps> = ({
  name,
  subtitle,
  drops,
  campaignId,
  onViewProof,
  onOpenClicks,
}) => {
  // Check if campaign has any Email drops
  const hasEmail = drops.some((d) => d.channels.includes("Email"));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Campaign header */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold text-slate-900">
            {name}
          </div>
          <div className="text-[11px] text-slate-500">{subtitle}</div>
        </div>

        <div className="flex items-center gap-2">
          {hasEmail && onOpenClicks && campaignId && (
            <button
              type="button"
              onClick={() => onOpenClicks(campaignId)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              Clicks
            </button>
          )}

          <button
            type="button"
            onClick={onViewProof}
            className="rounded-full border border-slate-200 px-4 py-1.5 text-[11px] font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          >
            View proof
          </button>
        </div>
      </header>

      {/* Column headers – SAME grid on every tile */}
      <div className={`mt-3 ${CAMPAIGN_GRID_CLASSES} text-[11px] text-slate-500`}>
        <div>Drop &amp; channels</div>
        <div className="text-right">Date</div>
        <div className="text-right">Sent</div>
        <div className="text-right">Opened</div>
        <div className="text-right">Resp %</div>
        <div className="text-right">ROAS</div>
        <div className="text-right">Revenue</div>
      </div>

      {/* Drops */}
      <div className="mt-1 space-y-1">
        {drops.map((drop) => (
          <div
            key={drop.id}
            className={`
              ${CAMPAIGN_GRID_CLASSES}
              items-center rounded-xl px-1 py-1.5 text-[11px]
              ${drop.isTotal ? "mt-2 border-t border-slate-100 pt-3 font-semibold" : ""}
            `}
          >
            {/* Drop label + channel pills (left) */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                {drop.isTotal ? "Campaign Totals" : drop.label}
              </span>

              {!drop.isTotal && drop.channels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {drop.channels.map((ch) => (
                    <span
                      key={ch}
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${channelPillClass(ch)}`}
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div className="text-right text-slate-700">
              {drop.date ?? ""}
            </div>

            {/* Sent */}
            <div className="text-right text-slate-900">
              {drop.sent.toLocaleString("en-US")}
            </div>

            {/* Opened */}
            <div className="text-right text-slate-900">
              {drop.opened.toLocaleString("en-US")}
            </div>

            {/* Resp % */}
            <div className="text-right text-emerald-600 font-semibold">
              {formatPercent1(drop.respPct)}
            </div>

            {/* ROAS */}
            <div className="text-right text-slate-900">
              {drop.roas.toFixed(1)}×
            </div>

            {/* Revenue */}
            <div className="text-right text-slate-900">
              {formatCurrency0(drop.revenue)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CampaignCard;
