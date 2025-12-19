import React, { useMemo, useState } from "react";
import {
  ShellLayout,
  MetricTile,
  AIInsightsTile,
  KpiCustomizeButton,
  DraggableKpiRow,
  ReportPageLayout,
} from "@/components/layout";
import { useKpiPreferences, KpiOption } from "@/hooks/useKpiPreferences";
import { parseChannels, CHANNEL_LABELS } from "@/styles/channelColors";
import { JourneyTouchpointMixTile } from "@/components/reports/JourneyTouchpointMixTile";
import { ShareReportModal, ShareReportButton } from "@/components/layout/ShareReportModal";
import ClicksBreakdownModal, { ClicksBreakdownData, ClickTypeRow } from "@/components/reports/ClicksBreakdownModal";
type ChannelType = "postcard" | "email" | "text";

type JourneyTouchPoint = {
  id: number;
  name: string;
  offsetLabel: string;
  channel: string;
  respPct: number;
  roas: number;
  sends: number;
  revenue: number;
  daysSinceLastSend?: number; // For response maturity calculation
  // Per-channel breakdowns for multi-channel touch points
  channelBreakdown?: {
    channel: ChannelType;
    sends: number;
    opened: number;
    responses: number;
    respPct: number;
    roas: number;
    revenue: number;
    daysSinceLastSend?: number;
  }[];
};

// Response maturity types and helpers
type ResponseMaturityLevel = "early" | "maturing" | "mature" | "unknown";

type ResponseMaturityInfo = {
  level: ResponseMaturityLevel;
  label: string;
  ratio: number | null;
  windowDays: number | null;
  daysSince: number | null;
};

const RESPONSE_WINDOWS: Record<ChannelType, number> = {
  postcard: 60,
  email: 10,
  text: 10,
};

const getResponseMaturity = (
  channel: ChannelType,
  daysSinceLastSend: number | null | undefined
): ResponseMaturityInfo => {
  const windowDays = RESPONSE_WINDOWS[channel];
  if (!windowDays || daysSinceLastSend == null) {
    return {
      level: "unknown",
      label: "Unknown",
      ratio: null,
      windowDays: null,
      daysSince: null,
    };
  }

  const clampedDays = Math.max(0, daysSinceLastSend);
  const ratio = Math.min(1, clampedDays / windowDays);

  let level: ResponseMaturityLevel;
  let label: string;

  // New thresholds: red < 50%, orange 50-80%, green >= 80%
  if (ratio < 0.5) {
    level = "early";
    label = `${Math.round(ratio * 100)}%`;
  } else if (ratio < 0.8) {
    level = "maturing";
    label = `${Math.round(ratio * 100)}%`;
  } else {
    level = "mature";
    label = `${Math.round(ratio * 100)}%`;
  }

  return { level, label, ratio, windowDays, daysSince: clampedDays };
};

// Get color classes for maturity level (used by both pill and response rate)
const getMaturityColorClasses = (level: ResponseMaturityLevel) => {
  switch (level) {
    case "early":
      return {
        bg: "bg-rose-50",
        border: "border-rose-100",
        text: "text-rose-700",
        dot: "bg-rose-400",
      };
    case "maturing":
      return {
        bg: "bg-amber-50",
        border: "border-amber-100",
        text: "text-amber-700",
        dot: "bg-amber-400",
      };
    case "mature":
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        text: "text-emerald-700",
        dot: "bg-emerald-400",
      };
    default:
      return {
        bg: "bg-slate-50",
        border: "border-slate-100",
        text: "text-slate-700",
        dot: "bg-slate-400",
      };
  }
};

// Response Maturity Pill component
const ResponseMaturityPill: React.FC<{ info: ResponseMaturityInfo; channel: ChannelType }> = ({
  info,
  channel,
}) => {
  if (info.level === "unknown") return null;

  const base =
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium";

  const colors = getMaturityColorClasses(info.level);

  return (
    <div className={`${base} ${colors.bg} ${colors.border} ${colors.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      <span>Maturity {info.label}</span>
    </div>
  );
};

const journeySummary = {
  vehicles: 3343,
  avgRoas: 10.1,
  avgRespPct: 16.0,
  totalComms: 20520,
  // New KPI data
  validMailingAddresses: 2856,
  validEmailAddresses: 2934,
  validCellNumbers: 2412,
  avgInvoice: 87.50,
  emailReminders: 8420,
  textReminders: 3960,
  pcReminders: 3960,
};

const TOUCH_POINTS: JourneyTouchPoint[] = [
  {
    id: 1,
    name: "Thank You",
    offsetLabel: "1 day after service",
    channel: "Text",
    respPct: 22.7,
    roas: 9.5,
    sends: 1850,
    revenue: 22400,
    daysSinceLastSend: 3,
  },
  {
    id: 2,
    name: "Thank You",
    offsetLabel: "1 day after service",
    channel: "Email",
    respPct: 22.7,
    roas: 9.5,
    sends: 1850,
    revenue: 22400,
    daysSinceLastSend: 3,
  },
  {
    id: 3,
    name: "Suggested Services",
    offsetLabel: "1 week after service",
    channel: "Email",
    respPct: 17.6,
    roas: 12.1,
    sends: 1760,
    revenue: 21300,
    daysSinceLastSend: 7,
  },
  {
    id: 4,
    name: "2nd Vehicle Invitation",
    offsetLabel: "10 days after service",
    channel: "Email",
    respPct: 16.7,
    roas: 10.3,
    sends: 900,
    revenue: 9270,
    daysSinceLastSend: 12,
  },
  {
    id: 5,
    name: "Suggested Services",
    offsetLabel: "1 month after service",
    channel: "Email",
    respPct: 14.6,
    roas: 11.2,
    sends: 1640,
    revenue: 18400,
    daysSinceLastSend: 15,
  },
  {
    id: 6,
    name: "Suggested Services",
    offsetLabel: "3 months after service",
    channel: "Email",
    respPct: 15.1,
    roas: 10.9,
    sends: 1520,
    revenue: 16600,
    daysSinceLastSend: 14,
  },
  {
    id: 7,
    name: "Suggested Services",
    offsetLabel: "6 months after service",
    channel: "Email",
    respPct: 15.2,
    roas: 10.8,
    sends: 1380,
    revenue: 14900,
    daysSinceLastSend: 11,
  },
  {
    id: 8,
    name: "Monthly Newsletter",
    offsetLabel: "Once a month",
    channel: "Email",
    respPct: 12.4,
    roas: 7.8,
    sends: 4200,
    revenue: 32800,
    daysSinceLastSend: 5,
  },
  {
    id: 9,
    name: "Reminder 1",
    offsetLabel: "5k after last service",
    channel: "Postcard + Email + Text",
    respPct: 20.3,
    roas: 16.4,
    sends: 1380,
    revenue: 22600,
    channelBreakdown: [
      { channel: "postcard", sends: 460, opened: 0, responses: 112, respPct: 24.3, roas: 18.2, revenue: 8380, daysSinceLastSend: 45 },
      { channel: "email", sends: 460, opened: 184, responses: 89, respPct: 19.3, roas: 15.1, revenue: 6950, daysSinceLastSend: 8 },
      { channel: "text", sends: 460, opened: 437, responses: 79, respPct: 17.2, roas: 15.8, revenue: 7270, daysSinceLastSend: 6 },
    ],
  },
  {
    id: 10,
    name: "Reminder 2",
    offsetLabel: "30 days after Reminder 1",
    channel: "Postcard + Email + Text",
    respPct: 14.5,
    roas: 10.7,
    sends: 980,
    revenue: 10500,
    channelBreakdown: [
      { channel: "postcard", sends: 327, opened: 0, responses: 52, respPct: 15.9, roas: 11.4, revenue: 3730, daysSinceLastSend: 72 },
      { channel: "email", sends: 327, opened: 124, responses: 44, respPct: 13.5, roas: 10.2, revenue: 3340, daysSinceLastSend: 12 },
      { channel: "text", sends: 326, opened: 306, responses: 46, respPct: 14.1, roas: 10.5, revenue: 3430, daysSinceLastSend: 11 },
    ],
  },
  {
    id: 11,
    name: "Reminder 3",
    offsetLabel: "10k after last service",
    channel: "Postcard + Email + Text",
    respPct: 14.0,
    roas: 9.8,
    sends: 860,
    revenue: 8400,
    channelBreakdown: [
      { channel: "postcard", sends: 287, opened: 0, responses: 43, respPct: 15.0, roas: 10.2, revenue: 2930, daysSinceLastSend: 65 },
      { channel: "email", sends: 287, opened: 103, responses: 38, respPct: 13.2, roas: 9.5, revenue: 2730, daysSinceLastSend: 14 },
      { channel: "text", sends: 286, opened: 269, responses: 39, respPct: 13.6, roas: 9.6, revenue: 2740, daysSinceLastSend: 12 },
    ],
  },
  {
    id: 12,
    name: "Reminder 4",
    offsetLabel: "15k after last service",
    channel: "Postcard + Email + Text",
    respPct: 14.2,
    roas: 9.4,
    sends: 740,
    revenue: 6950,
    channelBreakdown: [
      { channel: "postcard", sends: 247, opened: 0, responses: 38, respPct: 15.4, roas: 9.8, revenue: 2420, daysSinceLastSend: 58 },
      { channel: "email", sends: 247, opened: 89, responses: 34, respPct: 13.8, roas: 9.1, revenue: 2250, daysSinceLastSend: 10 },
      { channel: "text", sends: 246, opened: 231, responses: 33, respPct: 13.4, roas: 9.3, revenue: 2280, daysSinceLastSend: 9 },
    ],
  },
  {
    id: 13,
    name: "Reactivation",
    offsetLabel: "12 months after service",
    channel: "Email",
    respPct: 13.9,
    roas: 8.2,
    sends: 620,
    revenue: 5100,
    daysSinceLastSend: 18,
  },
  {
    id: 14,
    name: "Reactivation",
    offsetLabel: "18 months after service",
    channel: "Email",
    respPct: 13.3,
    roas: 7.5,
    sends: 480,
    revenue: 3600,
    daysSinceLastSend: 16,
  },
  {
    id: 15,
    name: "Reactivation",
    offsetLabel: "24 months after service",
    channel: "Email",
    respPct: 12.8,
    roas: 7.1,
    sends: 360,
    revenue: 2560,
    daysSinceLastSend: 13,
  },
];

// Removed CJTab type - no longer using tabs

const KPI_OPTIONS: KpiOption[] = [
  { id: "validMailing", label: "Valid Mailing Addresses" },
  { id: "validEmail", label: "Valid Email Addresses" },
  { id: "validCell", label: "Valid Cell Numbers" },
  { id: "avgInvoice", label: "Avg Invoice" },
  { id: "emailReminders", label: "Email Reminders" },
  { id: "textReminders", label: "Text Reminders" },
  { id: "pcReminders", label: "PC Reminders" },
];

type DetailsSortKey = "id" | "channel" | "sends" | "opened" | "responses" | "respPct" | "roas" | "revenue";
type SortDir = "asc" | "desc";

// Channel sort order for consistent sorting
const CHANNEL_SORT_ORDER: Record<string, number> = {
  postcard: 1,
  email: 2,
  text: 3,
};

const CustomerJourneyPage: React.FC = () => {
  const { selectedIds, setSelectedIds } = useKpiPreferences("customer-journey", KPI_OPTIONS);
  const [shareOpen, setShareOpen] = useState(false);
  const [clicksModalData, setClicksModalData] = useState<ClicksBreakdownData | null>(null);

  // Mock clicks data for touch points with email channel
  const CLICKS_BY_TP: Record<number, { totalClicks: number; clickTypes: ClickTypeRow[] }> = {
    2: { // Thank You Email
      totalClicks: 892,
      clickTypes: [
        { id: "website", label: "Website", clicks: 312, clickRate: 0.35 },
        { id: "video", label: "Video", clicks: 178, clickRate: 0.20 },
        { id: "directions", label: "Directions", clicks: 134, clickRate: 0.15 },
        { id: "reviews", label: "Google Reviews", clicks: 156, clickRate: 0.175 },
        { id: "unsub", label: "Unsubscribed", clicks: 112, clickRate: 0.125 },
      ],
    },
    3: { // Suggested Services 1 week
      totalClicks: 645,
      clickTypes: [
        { id: "website", label: "Website", clicks: 258, clickRate: 0.40 },
        { id: "video", label: "Video", clicks: 129, clickRate: 0.20 },
        { id: "coupons", label: "Coupons Redeemed", clicks: 97, clickRate: 0.15 },
        { id: "preferences", label: "Preferences", clicks: 96, clickRate: 0.149 },
        { id: "unsub", label: "Unsubscribed", clicks: 65, clickRate: 0.101 },
      ],
    },
    4: { // 2nd Vehicle Invitation
      totalClicks: 412,
      clickTypes: [
        { id: "website", label: "Website", clicks: 185, clickRate: 0.449 },
        { id: "double-opt", label: "Double Opt-In (TXT)", clicks: 124, clickRate: 0.301 },
        { id: "directions", label: "Directions", clicks: 62, clickRate: 0.150 },
        { id: "unsub", label: "Unsubscribed", clicks: 41, clickRate: 0.10 },
      ],
    },
    5: { // Suggested Services 1 month
      totalClicks: 523,
      clickTypes: [
        { id: "website", label: "Website", clicks: 209, clickRate: 0.40 },
        { id: "video", label: "Video", clicks: 105, clickRate: 0.20 },
        { id: "coupons", label: "Coupons Redeemed", clicks: 78, clickRate: 0.149 },
        { id: "preferences", label: "Preferences", clicks: 79, clickRate: 0.151 },
        { id: "unsub", label: "Unsubscribed", clicks: 52, clickRate: 0.10 },
      ],
    },
    6: { // Suggested Services 3 months
      totalClicks: 486,
      clickTypes: [
        { id: "website", label: "Website", clicks: 194, clickRate: 0.40 },
        { id: "video", label: "Video", clicks: 97, clickRate: 0.20 },
        { id: "coupons", label: "Coupons Redeemed", clicks: 73, clickRate: 0.15 },
        { id: "preferences", label: "Preferences", clicks: 73, clickRate: 0.15 },
        { id: "unsub", label: "Unsubscribed", clicks: 49, clickRate: 0.10 },
      ],
    },
    7: { // Suggested Services 6 months
      totalClicks: 442,
      clickTypes: [
        { id: "website", label: "Website", clicks: 177, clickRate: 0.40 },
        { id: "video", label: "Video", clicks: 88, clickRate: 0.20 },
        { id: "coupons", label: "Coupons Redeemed", clicks: 66, clickRate: 0.15 },
        { id: "preferences", label: "Preferences", clicks: 67, clickRate: 0.151 },
        { id: "unsub", label: "Unsubscribed", clicks: 44, clickRate: 0.099 },
      ],
    },
    8: { // Monthly Newsletter
      totalClicks: 1680,
      clickTypes: [
        { id: "website", label: "Website", clicks: 672, clickRate: 0.40 },
        { id: "video", label: "Video", clicks: 336, clickRate: 0.20 },
        { id: "coupons", label: "Coupons Redeemed", clicks: 252, clickRate: 0.15 },
        { id: "reviews", label: "Google Reviews", clicks: 168, clickRate: 0.10 },
        { id: "preferences", label: "Preferences", clicks: 168, clickRate: 0.10 },
        { id: "unsub", label: "Unsubscribed", clicks: 84, clickRate: 0.05 },
      ],
    },
    13: { // Reactivation 12 months
      totalClicks: 248,
      clickTypes: [
        { id: "website", label: "Website", clicks: 99, clickRate: 0.40 },
        { id: "coupons", label: "Coupons Redeemed", clicks: 74, clickRate: 0.30 },
        { id: "directions", label: "Directions", clicks: 50, clickRate: 0.20 },
        { id: "unsub", label: "Unsubscribed", clicks: 25, clickRate: 0.10 },
      ],
    },
    14: { // Reactivation 18 months
      totalClicks: 192,
      clickTypes: [
        { id: "website", label: "Website", clicks: 77, clickRate: 0.40 },
        { id: "coupons", label: "Coupons Redeemed", clicks: 58, clickRate: 0.30 },
        { id: "directions", label: "Directions", clicks: 38, clickRate: 0.20 },
        { id: "unsub", label: "Unsubscribed", clicks: 19, clickRate: 0.10 },
      ],
    },
    15: { // Reactivation 24 months
      totalClicks: 144,
      clickTypes: [
        { id: "website", label: "Website", clicks: 58, clickRate: 0.40 },
        { id: "coupons", label: "Coupons Redeemed", clicks: 43, clickRate: 0.30 },
        { id: "directions", label: "Directions", clicks: 29, clickRate: 0.20 },
        { id: "unsub", label: "Unsubscribed", clicks: 14, clickRate: 0.10 },
      ],
    },
  };

  const handleOpenClicks = (tpId: number, tpName: string, offsetLabel: string) => {
    const clickData = CLICKS_BY_TP[tpId];
    if (!clickData) return;
    setClicksModalData({
      id: String(tpId),
      name: `${tpId}. ${tpName}`,
      subtitle: `Click activity for "${offsetLabel}" email touch point.`,
      totalClicks: clickData.totalClicks,
      clickTypes: clickData.clickTypes,
    });
  };

  const handleCloseClicks = () => setClicksModalData(null);

  const handleViewProofs = (tpId: number) => {
    console.log("View proofs for touch point:", tpId);
  };

  // Build flattened rows for Details table (one row per channel per touch point)
  type DetailRow = {
    tpId: number;
    tpName: string;
    offsetLabel: string;
    channel: ChannelType;
    sends: number;
    opened: number;
    responses: number;
    respPct: number;
    roas: number;
    revenue: number;
    isFirstInGroup: boolean;
    groupSize: number;
    daysSinceLastSend?: number;
  };

  const detailRows = useMemo(() => {
    const rows: DetailRow[] = [];
    TOUCH_POINTS.forEach((tp) => {
      if (tp.channelBreakdown && tp.channelBreakdown.length > 0) {
        tp.channelBreakdown.forEach((cb, idx) => {
          rows.push({
            tpId: tp.id,
            tpName: tp.name,
            offsetLabel: tp.offsetLabel,
            channel: cb.channel,
            sends: cb.sends,
            opened: cb.opened,
            responses: cb.responses,
            respPct: cb.respPct,
            roas: cb.roas,
            revenue: cb.revenue,
            isFirstInGroup: idx === 0,
            groupSize: tp.channelBreakdown!.length,
            daysSinceLastSend: cb.daysSinceLastSend,
          });
        });
      } else {
        const channels = parseChannels(tp.channel);
        const channelKey = channels[0] || "email";
        const responses = Math.round(tp.sends * (tp.respPct / 100));
        const opened = channelKey === "email" 
          ? Math.round(tp.sends * 0.4) 
          : channelKey === "text" 
            ? Math.round(tp.sends * 0.95) 
            : 0;
        rows.push({
          tpId: tp.id,
          tpName: tp.name,
          offsetLabel: tp.offsetLabel,
          channel: channelKey as ChannelType,
          sends: tp.sends,
          opened,
          responses,
          respPct: tp.respPct,
          roas: tp.roas,
          revenue: tp.revenue,
          isFirstInGroup: true,
          groupSize: 1,
          daysSinceLastSend: tp.daysSinceLastSend,
        });
      }
    });
    return rows;
  }, []);

  // Sort detail rows by touch point ID for consistent display
  const sortedDetailRows = useMemo(() => {
    return [...detailRows].sort((a, b) => a.tpId - b.tpId);
  }, [detailRows]);

  // Compute touchpoint mix items for the mix tile
  const touchpointMixItems = useMemo(() => {
    // Group by touch point and sum responses
    const tpMap = new Map<number, { id: number; name: string; totalResponses: number }>();
    detailRows.forEach((row) => {
      if (!tpMap.has(row.tpId)) {
        tpMap.set(row.tpId, { id: row.tpId, name: row.tpName, totalResponses: 0 });
      }
      tpMap.get(row.tpId)!.totalResponses += row.responses;
    });

    const totalResponses = Array.from(tpMap.values()).reduce((sum, tp) => sum + tp.totalResponses, 0);

    return Array.from(tpMap.values())
      .sort((a, b) => a.id - b.id)
      .map((tp) => ({
        id: tp.id,
        label: `${tp.id}. ${tp.name}`,
        responses: tp.totalResponses,
        respPct: totalResponses > 0 ? (tp.totalResponses / totalResponses) * 100 : 0,
      }));
  }, [detailRows]);

  const renderKpiTile = (id: string) => {
    switch (id) {
      case "validMailing":
        return (
          <MetricTile
            key={id}
            label="Valid Mailing Addresses"
            value={journeySummary.validMailingAddresses.toLocaleString()}
            helpText="Customers with verified mailing addresses for postcard delivery. Higher counts improve reach for mail-based journey touch points."
          />
        );
      case "validEmail":
        return (
          <MetricTile
            key={id}
            label="Valid Email Addresses"
            value={journeySummary.validEmailAddresses.toLocaleString()}
            helpText="Customers with verified email addresses for digital communications. Email is typically the most cost-effective channel for reminders and follow-ups."
          />
        );
      case "validCell":
        return (
          <MetricTile
            key={id}
            label="Valid Cell Numbers"
            value={journeySummary.validCellNumbers.toLocaleString()}
            helpText="Customers with verified cell phone numbers for text messaging. Text messages often have the highest open and response rates."
          />
        );
      case "avgInvoice":
        return (
          <MetricTile
            key={id}
            label="Avg Invoice"
            value={journeySummary.avgInvoice.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            helpText="Average invoice amount across all journey-related transactions. This metric helps gauge overall ticket value driven by journey touches."
          />
        );
      case "emailReminders":
        return (
          <MetricTile
            key={id}
            label="Email Reminders"
            value={journeySummary.emailReminders.toLocaleString()}
            helpText="Total email reminders sent across all journey touch points. Email is a low-cost, high-reach channel for scheduled communications."
            className="bg-tp-pastel-green border-emerald-200"
            valueHighlightClass="bg-emerald-100 text-emerald-700"
          />
        );
      case "textReminders":
        return (
          <MetricTile
            key={id}
            label="Text Reminders"
            value={journeySummary.textReminders.toLocaleString()}
            helpText="Total text message reminders sent across all journey touch points. Text messages typically drive higher immediate response rates than other channels."
            className="bg-tp-pastel-purple border-indigo-200"
            valueHighlightClass="bg-indigo-100 text-indigo-700"
          />
        );
      case "pcReminders":
        return (
          <MetricTile
            key={id}
            label="PC Reminders"
            value={journeySummary.pcReminders.toLocaleString()}
            helpText="Total postcard reminders sent across all journey touch points. Postcards are tangible and often have strong retention with customers."
            className="bg-tp-pastel-blue border-sky-200"
            valueHighlightClass="bg-sky-100 text-sky-700"
          />
        );
      default:
        return null;
    }
  };

  const aiInsightsProps = {
    title: "AI Insights",
    timeframeLabel: "Based on 12 months data",
    bullets: [
      "Thank-you touch points drive the highest RESP % – protect these.",
      "Suggested Services after 1–3 months show strong ROAS; consider additional education.",
      "Reminder 1 delivers the best balance of RESP % and revenue per send.",
    ],
  };

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "Customer Journey" },
      ]}
      rightInfo={
        <>
          <span>
            Vehicles:{" "}
            <span className="font-medium">
              {journeySummary.vehicles.toLocaleString()}
            </span>
          </span>
          <span>
            Period: <span className="font-medium">Last 12 months</span>
          </span>
        </>
      }
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Customer Journey
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Active Customer Journey touch points for the stores and date range selected.
            <br />
            Response maturity is based on Throttle standard response windows:
            <br />
            <span className="font-semibold">60 days for postcards</span> and <span className="font-semibold">10 days for email and text</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShareReportButton onClick={() => setShareOpen(true)} />
          <KpiCustomizeButton
            reportId="customer-journey"
            options={KPI_OPTIONS}
            selectedIds={selectedIds}
            onChangeSelected={setSelectedIds}
          />
        </div>
      </div>

      {/* Share Modal */}
      <ShareReportModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        context={{
          reportName: "Customer Journey",
          dateRangeLabel: "Last 12 months",
          storeCount: 5,
        }}
      />

      {/* Main content */}
      <ReportPageLayout
        kpis={
          selectedIds.length > 0 ? (
            <DraggableKpiRow
              reportKey="customer-journey"
              tiles={selectedIds
                .map((id) => {
                  const tile = renderKpiTile(id);
                  return tile ? { id, element: tile } : null;
                })
                .filter(Boolean) as { id: string; element: React.ReactNode }[]}
            />
          ) : null
        }
        ai={<AIInsightsTile {...aiInsightsProps} />}
        mobileAiPlacement="top"
      >
        {/* Touchpoint mix tile */}
        <JourneyTouchpointMixTile items={touchpointMixItems} />

        {/* Touch point ghost pills */}
        <div className="space-y-4">
          {(() => {
            // Group rows by touch point
            type GroupedTP = {
              tpId: number;
              tpName: string;
              offsetLabel: string;
              rows: typeof sortedDetailRows;
            };
            const groupedMap = new Map<number, GroupedTP>();

            sortedDetailRows.forEach((row) => {
              if (!groupedMap.has(row.tpId)) {
                groupedMap.set(row.tpId, {
                  tpId: row.tpId,
                  tpName: row.tpName,
                  offsetLabel: row.offsetLabel,
                  rows: [],
                });
              }
              groupedMap.get(row.tpId)!.rows.push(row);
            });

            // Sort groups by touch point ID
            const groups = Array.from(groupedMap.values()).sort((a, b) => a.tpId - b.tpId);

            // Colors matching the mix tile
            const SEGMENT_DOT_COLORS = [
              "bg-tp-green",
              "bg-tp-blue-light",
              "bg-tp-purple",
              "bg-tp-yellow",
              "bg-tp-red",
              "bg-emerald-500",
              "bg-sky-500",
              "bg-indigo-500",
              "bg-amber-500",
              "bg-rose-500",
              "bg-teal-500",
              "bg-violet-500",
              "bg-orange-500",
              "bg-cyan-500",
              "bg-lime-500",
            ];

            return groups.map((group, groupIndex) => (
              <div
                key={group.tpId}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                {/* Header row: touch point name/offset + Clicks/View proofs buttons */}
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${SEGMENT_DOT_COLORS[groupIndex % SEGMENT_DOT_COLORS.length]}`}
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {group.tpId}. {group.tpName}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {group.offsetLabel}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Show Clicks button only if this touch point has email channel */}
                    {group.rows.some((r) => r.channel === "email") && CLICKS_BY_TP[group.tpId] && (
                      <button
                        type="button"
                        onClick={() => handleOpenClicks(group.tpId, group.tpName, group.offsetLabel)}
                        className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      >
                        Clicks
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleViewProofs(group.tpId)}
                      className="inline-flex items-center rounded-full border border-slate-200 px-4 py-1.5 text-[11px] font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    >
                      View proof
                    </button>
                  </div>
                </div>

                {/* Grid-based layout for consistent column alignment */}
                <div className="mt-2">
                  {/* Column headers – same grid pattern for all cards */}
                  <div className="grid grid-cols-[minmax(0,1.5fr)_repeat(6,minmax(0,1fr))] gap-4 border-b border-slate-200 pb-2 text-[11px] tracking-wide text-slate-500">
                    <div className="font-medium">Channel</div>
                    <div className="text-right font-medium">Sent</div>
                    <div className="text-right font-medium">Opened</div>
                    <div className="text-right font-medium">Responses</div>
                    <div className="text-right font-medium">Resp %</div>
                    <div className="text-right font-medium">ROAS</div>
                    <div className="text-right font-medium">Revenue</div>
                  </div>

                  {/* Data rows */}
                  <div className="mt-1 space-y-2">
                    {group.rows.map((row, idx) => {
                      const maturityInfo = getResponseMaturity(row.channel, row.daysSinceLastSend);
                      const colors = getMaturityColorClasses(maturityInfo.level);
                      
                      return (
                        <div
                          key={`${row.tpId}-${row.channel}-${idx}`}
                          className="grid grid-cols-[minmax(0,1.5fr)_repeat(6,minmax(0,1fr))] gap-4 items-center py-1.5 text-[11px]"
                        >
                          {/* Channel pill */}
                          <div>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
                                row.channel === "postcard"
                                  ? "bg-tp-pastel-blue text-sky-700"
                                  : row.channel === "email"
                                  ? "bg-tp-pastel-green text-emerald-700"
                                  : "bg-tp-pastel-purple text-indigo-700"
                              }`}
                            >
                              {CHANNEL_LABELS[row.channel]}
                            </span>
                          </div>

                          {/* Sent */}
                          <div className="text-right text-slate-900">
                            {row.sends.toLocaleString()}
                          </div>

                          {/* Opened */}
                          <div className="text-right text-slate-900">
                            {row.channel === "postcard" ? "—" : row.opened.toLocaleString()}
                          </div>

                          {/* Responses */}
                          <div className="text-right text-slate-900">
                            {row.responses.toLocaleString()}
                          </div>

                          {/* Resp % with maturity pill */}
                          <div className="text-right">
                            <div className={`font-semibold ${colors.text}`}>
                              {row.respPct.toFixed(1)}%
                            </div>
                            <div className="mt-0.5 flex justify-end">
                              <ResponseMaturityPill
                                channel={row.channel}
                                info={maturityInfo}
                              />
                            </div>
                          </div>

                          {/* ROAS */}
                          <div className="text-right text-slate-900">
                            {row.roas.toFixed(1)}x
                          </div>

                          {/* Revenue */}
                          <div className="text-right text-slate-900">
                            {row.revenue.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Touch point totals row - only show for multi-channel touch points */}
                    {group.rows.length > 1 && (() => {
                      const totals = {
                        sent: group.rows.reduce((sum, r) => sum + r.sends, 0),
                        opened: group.rows.reduce((sum, r) => sum + r.opened, 0),
                        responses: group.rows.reduce((sum, r) => sum + r.responses, 0),
                        revenue: group.rows.reduce((sum, r) => sum + r.revenue, 0),
                      };
                      const avgRespPct = group.rows.reduce((sum, r) => sum + r.respPct, 0) / group.rows.length;
                      const avgRoas = group.rows.reduce((sum, r) => sum + r.roas, 0) / group.rows.length;

                      return (
                        <div className="grid grid-cols-[minmax(0,1.5fr)_repeat(6,minmax(0,1fr))] gap-4 items-center border-t border-slate-200 pt-3 mt-2 text-[11px] font-semibold">
                          <div className="uppercase tracking-wide text-slate-700">
                            Touch Point Totals
                          </div>
                          <div className="text-right text-slate-900">
                            {totals.sent.toLocaleString()}
                          </div>
                          <div className="text-right text-slate-900">
                            {totals.opened.toLocaleString()}
                          </div>
                          <div className="text-right text-slate-900">
                            {totals.responses.toLocaleString()}
                          </div>
                          <div className="text-right text-slate-600">
                            {avgRespPct.toFixed(1)}%
                          </div>
                          <div className="text-right text-slate-900">
                            {avgRoas.toFixed(1)}x
                          </div>
                          <div className="text-right text-slate-900">
                            {totals.revenue.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Clicks Breakdown Modal */}
        <ClicksBreakdownModal
          open={!!clicksModalData}
          data={clicksModalData}
          onClose={handleCloseClicks}
        />
      </ReportPageLayout>
    </ShellLayout>
  );
};

export default CustomerJourneyPage;
