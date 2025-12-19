import React from "react";
import { Link } from "react-router-dom";

type JourneyTouchpointRoas = {
  id: string;
  name: string;
  interval: string;
  channel: string;
  spend: number;
  revenue: number;
  roas: number;
};

type Props = {
  data: JourneyTouchpointRoas[];
};

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const channelPillClass = (channel: string) => {
  if (channel.includes("Postcard") && channel.includes("Email") && channel.includes("Text")) {
    return "bg-amber-50 text-amber-700";
  }
  switch (channel) {
    case "Email":
      return "bg-tp-pastel-green text-emerald-700";
    case "Postcard":
      return "bg-tp-pastel-blue text-sky-700";
    case "Text":
      return "bg-tp-pastel-purple text-indigo-700";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const channelBarClass = (channel: string) => {
  if (channel.includes("Postcard") && channel.includes("Email") && channel.includes("Text")) {
    return "bg-tp-pastel-orange";
  }
  switch (channel) {
    case "Email":
      return "bg-tp-pastel-green";
    case "Postcard":
      return "bg-tp-pastel-blue";
    case "Text":
      return "bg-tp-pastel-purple";
    default:
      return "bg-slate-300";
  }
};

const getChannelLabel = (channel: string) => {
  if (channel.includes("Postcard") && channel.includes("Email") && channel.includes("Text")) {
    return "Mixed";
  }
  return channel;
};

export const RoasCustomerJourneyTile: React.FC<Props> = ({ data }) => {
  const maxRoas = Math.max(...data.map((d) => d.roas), 1);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <header>
        <h2 className="text-[13px] font-semibold text-foreground">ROAS by Customer Journey</h2>
        <p className="text-[11px] text-muted-foreground">
          Relative ROAS, channel and spend for each Customer Journey touch point.
        </p>
      </header>

      <div className="mt-3 space-y-3">
        {data.map((row, index) => (
          <div key={row.id} className="flex items-center gap-3">
            <div className="min-w-0 w-56 shrink-0">
              <Link to="/reports/customer-journey" className="truncate text-[13px] font-semibold text-foreground hover:text-primary hover:underline block">
                {index + 1}. {row.name}
              </Link>
              <div className="mt-0.5 flex flex-wrap items-center gap-1">
                <span className="text-[11px] text-muted-foreground">{row.interval}</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${channelPillClass(row.channel)}`}
                >
                  {getChannelLabel(row.channel)}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col">
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${channelBarClass(row.channel)}`}
                    style={{ width: `${(row.roas / maxRoas) * 100}%` }}
                  />
                </div>
                <div className="w-20 text-right text-[11px] text-muted-foreground">{row.roas.toFixed(1)}x ROAS</div>
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {formatCurrency(row.spend)} spend · {formatCurrency(row.revenue)} revenue
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
