import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShellLayout, MetricTile, AIInsightsTile, KpiCustomizeButton, DraggableKpiRow, ReportPageLayout } from "@/components/layout";
import { useKpiPreferences, KpiOption } from "@/hooks/useKpiPreferences";
import { RoasCustomerJourneyTile } from "@/components/reports/RoasCustomerJourneyTile";
import { JOURNEY_TOUCH_POINTS } from "@/data/customerJourney";

// ----------------- types -----------------
type ChannelRoas = {
  id: string;
  channel: "Email" | "Postcard" | "Text" | "Mixed";
  spend: number;
  revenue: number;
  roas: number;
};

type CampaignRoas = {
  id: string;
  name: string;
  audience: string;
  channels: ("Email" | "Postcard" | "Mixed")[];
  sent: number;
  spend: number;
  revenue: number;
  vehicles: number;
  roas: number;
};

// ----------------- mock data -----------------
const channelRoasData: ChannelRoas[] = [
  { id: "email", channel: "Email", spend: 2040, revenue: 39450, roas: 19.3 },
  { id: "postcard", channel: "Postcard", spend: 1760, revenue: 26900, roas: 15.3 },
  { id: "text", channel: "Text", spend: 1620, revenue: 25100, roas: 15.5 },
  { id: "mixed", channel: "Mixed", spend: 1400, revenue: 23800, roas: 17.0 },
];

const campaignRoasData: CampaignRoas[] = [
  {
    id: "spring",
    name: "Spring Has Sprung",
    audience: "12–24 month inactive",
    channels: ["Email"],
    sent: 1500,
    spend: 520,
    revenue: 8350,
    vehicles: 62,
    roas: 16.1,
  },
  {
    id: "tax",
    name: "Tax Time Tune-Up",
    audience: "High LTV, due in 30 days",
    channels: ["Mixed"],
    sent: 1200,
    spend: 1400,
    revenue: 24600,
    vehicles: 110,
    roas: 17.6,
  },
  {
    id: "syn-upgrade",
    name: "Synthetic Upgrade Push",
    audience: "Conventional users",
    channels: ["Postcard"],
    sent: 900,
    spend: 980,
    revenue: 17800,
    vehicles: 76,
    roas: 18.2,
  },
  {
    id: "reactivation",
    name: "Reactivation 18–24 months",
    audience: "Lapsed",
    channels: ["Email"],
    sent: 1400,
    spend: 420,
    revenue: 9390,
    vehicles: 55,
    roas: 22.4,
  },
  {
    id: "new-mover",
    name: "New Mover Welcome",
    audience: "New households",
    channels: ["Postcard"],
    sent: 700,
    spend: 780,
    revenue: 9100,
    vehicles: 48,
    roas: 11.7,
  },
  {
    id: "holiday",
    name: "Holiday Thank You",
    audience: "Top 25% LTV",
    channels: ["Email"],
    sent: 600,
    spend: 100,
    revenue: 2450,
    vehicles: 19,
    roas: 24.5,
  },
];

// Derive CJ ROAS data from shared JOURNEY_TOUCH_POINTS with mock spend/revenue
const journeyTouchpointRoasData = JOURNEY_TOUCH_POINTS.map((tp) => {
  // Generate mock spend based on channel type and vehicles
  const baseSpend = tp.channel.includes("Postcard") ? 0.85 : 0.15;
  const spend = Math.round(tp.vehicles * baseSpend * (1 + Math.random() * 0.3));
  const revenue = Math.round(spend * tp.roas);

  return {
    id: tp.id,
    name: tp.name,
    interval: tp.interval,
    channel: tp.channel,
    spend,
    revenue,
    roas: tp.roas,
  };
});

// ----------------- helpers -----------------
const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const channelPillClass = (channel: string) => {
  switch (channel) {
    case "Email":
      return "bg-tp-pastel-green text-emerald-700";
    case "Postcard":
      return "bg-tp-pastel-blue text-sky-700";
    case "Text":
      return "bg-tp-pastel-purple text-indigo-700";
    case "Mixed":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-muted text-muted-foreground";
  }
};

// ----------------- tiles -----------------

const channelBarClass = (channel: string) => {
  switch (channel) {
    case "Email":
      return "bg-tp-pastel-green";
    case "Postcard":
      return "bg-tp-pastel-blue";
    case "Text":
      return "bg-tp-pastel-purple";
    case "Mixed":
      return "bg-tp-pastel-orange";
    default:
      return "bg-slate-300";
  }
};

const RoasByChannelTile: React.FC<{ data: ChannelRoas[] }> = ({ data }) => {
  const maxRoas = Math.max(...data.map((d) => d.roas), 1);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-[13px] font-semibold text-foreground">ROAS by Communication Channel</h2>
          <p className="text-[11px] text-muted-foreground">Relative ROAS and spend by primary communication channel.</p>
        </div>
      </header>

      <div className="mt-3 space-y-3">
        {data.map((row) => (
          <div key={row.id} className="flex items-center gap-3">
            <div className="shrink-0 w-20">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${channelPillClass(
                  row.channel,
                )}`}
              >
                {row.channel}
              </span>
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

const RoasByCampaignTile: React.FC<{ data: CampaignRoas[] }> = ({ data }) => {
  const maxRoas = Math.max(...data.map((d) => d.roas), 1);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <header>
        <h2 className="text-[13px] font-semibold text-foreground">ROAS by One-off Campaign</h2>
        <p className="text-[11px] text-muted-foreground">Relative ROAS, channel and spend for each one-off campaign.</p>
      </header>

      <div className="mt-3 space-y-3">
        {data.map((row) => (
          <div key={row.id} className="flex items-center gap-3">
            <div className="min-w-0 w-56 shrink-0">
              <Link to="/reports/one-off-campaign-tracker" className="truncate text-[13px] font-semibold text-foreground hover:text-primary hover:underline block">
                {row.name}
              </Link>
              <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                <span className="truncate">{row.audience}</span>
                {row.channels.map((ch) => (
                  <span
                    key={ch}
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${channelPillClass(ch)}`}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col">
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${channelBarClass(row.channels[0] || "Mixed")}`}
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

// ----------------- KPI options -----------------
const KPI_OPTIONS: KpiOption[] = [
  { id: "totalSpend", label: "Total spend" },
  { id: "totalRevenue", label: "Total revenue" },
  { id: "overallRoas", label: "Overall ROAS" },
  { id: "vehiclesCampaigns", label: "Vehicles from campaigns" },
];

// ----------------- main page -----------------
const RoasPage: React.FC = () => {
  const [insights, setInsights] = useState<string[]>([
    "Mixed-channel campaigns drive the strongest ROAS but have higher spend per send.",
    "Postcard-only campaigns produce solid revenue but could be boosted with email follow-ups.",
    "Some email-only campaigns are extremely efficient on a ROAS basis and are ideal for frequent use.",
  ]);

  const totalSpend = useMemo(() => channelRoasData.reduce((s, c) => s + c.spend, 0), []);
  const totalRevenue = useMemo(() => channelRoasData.reduce((s, c) => s + c.revenue, 0), []);
  const overallRoas = useMemo(() => totalRevenue / (totalSpend || 1), [totalSpend, totalRevenue]);
  const vehiclesFromCampaigns = useMemo(() => campaignRoasData.reduce((s, c) => s + c.vehicles, 0), []);

  const { selectedIds, setSelectedIds } = useKpiPreferences("roas", KPI_OPTIONS);

  const renderKpiTile = (id: string) => {
    switch (id) {
      case "totalSpend":
        return (
          <MetricTile
            key={id}
            label="Total spend"
            value={formatCurrency(totalSpend)}
            helpText="Total marketing spend across all campaigns during the selected period. This includes all channel costs such as postage, email platform fees, and SMS charges."
          />
        );
      case "totalRevenue":
        return (
          <MetricTile
            key={id}
            label="Total revenue"
            value={formatCurrency(totalRevenue)}
            helpText="Total revenue attributed to marketing campaigns during the selected period. Attribution is based on customer response within the campaign window."
          />
        );
      case "overallRoas":
        return (
          <MetricTile
            key={id}
            label="Overall ROAS"
            value={`${overallRoas.toFixed(1)}x`}
            helper={`${campaignRoasData.length} campaigns`}
            helpText="Overall return on ad spend calculated as total revenue divided by total spend. A ROAS above 5x is typically considered strong for automotive marketing."
          />
        );
      case "vehiclesCampaigns":
        return (
          <MetricTile
            key={id}
            label="Vehicles from campaigns"
            value={vehiclesFromCampaigns.toLocaleString()}
            helpText="Number of unique vehicles that responded to marketing campaigns. Each vehicle represents a customer who took action after receiving a campaign message."
          />
        );
      default:
        return null;
    }
  };

  const regenerateInsights = () => {
    const bestCampaign = campaignRoasData.reduce((best, c) => (!best || c.roas > best.roas ? c : best));

    setInsights([
      `Overall ROAS is ${overallRoas.toFixed(1)}x, with best performance from "${bestCampaign.name}".`,
      "Mixed-channel campaigns are ideal for key periods (tax time, holidays) where you want maximum reach and impact.",
      "Email-only campaigns deliver high ROAS at low cost; keep them running year-round for maintenance and SS follow-ups.",
    ]);
  };

  return (
    <ShellLayout
      breadcrumb={[{ label: "Home", to: "/" }, { label: "Reports & Insights", to: "/" }, { label: "ROAS" }]}
      rightInfo={
        <>
          <span>
            Store group: <span className="font-medium">All Stores</span>
          </span>
          <span>
            Period: <span className="font-medium">Last 90 days</span>
          </span>
        </>
      }
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">ROAS (Return on Ad Spend)</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Evaluate campaigns and channels on spend, vehicles, revenue and ROAS.
          </p>
        </div>
        <KpiCustomizeButton
          reportId="roas"
          options={KPI_OPTIONS}
          selectedIds={selectedIds}
          onChangeSelected={setSelectedIds}
        />
      </div>

      {/* Main content using ReportPageLayout */}
      <ReportPageLayout
        kpis={
          selectedIds.length > 0 ? (
            <DraggableKpiRow
              reportKey="roas"
              tiles={
                selectedIds
                  .map((id) => {
                    const tile = renderKpiTile(id);
                    return tile ? { id, element: tile } : null;
                  })
                  .filter(Boolean) as { id: string; element: React.ReactNode }[]
              }
            />
          ) : null
        }
        ai={
          <AIInsightsTile
            title="AI Insights"
            subtitle="Based on recent campaign performance"
            bullets={insights}
            onRefresh={regenerateInsights}
          />
        }
      >
        {/* ROAS by channel – full width */}
        <RoasByChannelTile data={channelRoasData} />

        {/* ROAS by campaign bar tile */}
        <RoasByCampaignTile data={campaignRoasData} />

        {/* ROAS by Customer Journey */}
        <RoasCustomerJourneyTile data={journeyTouchpointRoasData} />
      </ReportPageLayout>
    </ShellLayout>
  );
};

export default RoasPage;
