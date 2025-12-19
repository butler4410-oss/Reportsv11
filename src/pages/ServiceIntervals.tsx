import React, { useState } from "react";
import {
  ShellLayout,
  AIInsightsTile,
  KpiCustomizeButton,
  ReportPageLayout,
} from "@/components/layout";
import { useKpiPreferences, KpiOption } from "@/hooks/useKpiPreferences";

// Segment type definitions
type SegmentId = "active" | "retained" | "lapsed" | "inactive" | "lost";

type LoyaltySegment = {
  id: SegmentId;
  label: string;
  rangeLabel: string;
  kpiTitle: string;
  kpiRange: string;
  customers: number;
  vehicles: number;
  avgTicket: number;
  barPct: number;
  barColorClass: string;
  kpiBgClass: string;
  kpiTextClass: string;
};

const TOTAL_CUSTOMERS = 12480;

const LOYALTY_SEGMENTS: LoyaltySegment[] = [
  {
    id: "active",
    label: "Active Cust",
    rangeLabel: "0–8 months since last service visit",
    kpiTitle: "Active Customers",
    kpiRange: "0–8 Months",
    customers: 5400,
    vehicles: 6800,
    avgTicket: 104,
    barPct: 100,
    barColorClass: "bg-tp-pastel-green",
    kpiBgClass: "bg-emerald-50",
    kpiTextClass: "text-emerald-700",
  },
  {
    id: "retained",
    label: "Retained Cust",
    rangeLabel: "9–12 months since last service visit",
    kpiTitle: "Retained Customers",
    kpiRange: "9–12 Months",
    customers: 3500,
    vehicles: 4100,
    avgTicket: 112,
    barPct: 65,
    barColorClass: "bg-tp-pastel-blue",
    kpiBgClass: "bg-sky-50",
    kpiTextClass: "text-sky-700",
  },
  {
    id: "lapsed",
    label: "Lapsed Cust",
    rangeLabel: "13–18 months since last service visit",
    kpiTitle: "Lapsed Customers",
    kpiRange: "13–18 Months",
    customers: 1420,
    vehicles: 1660,
    avgTicket: 101,
    barPct: 35,
    barColorClass: "bg-tp-pastel-yellow",
    kpiBgClass: "bg-amber-50",
    kpiTextClass: "text-amber-700",
  },
  {
    id: "inactive",
    label: "Inactive Cust",
    rangeLabel: "19–24 months since last service visit",
    kpiTitle: "Inactive Customers",
    kpiRange: "19–24 Months",
    customers: 780,
    vehicles: 880,
    avgTicket: 92,
    barPct: 20,
    barColorClass: "bg-tp-pastel-orange",
    kpiBgClass: "bg-orange-50",
    kpiTextClass: "text-orange-700",
  },
  {
    id: "lost",
    label: "Lost Cust",
    rangeLabel: "25+ months since last service visit",
    kpiTitle: "Lost Customers",
    kpiRange: "25+ Months",
    customers: 1380,
    vehicles: 1540,
    avgTicket: 88,
    barPct: 25,
    barColorClass: "bg-tp-pastel-red",
    kpiBgClass: "bg-rose-50",
    kpiTextClass: "text-rose-700",
  },
];

const KPI_OPTIONS: KpiOption[] = LOYALTY_SEGMENTS.map((seg) => ({
  id: seg.id,
  label: seg.label,
}));

const ServiceIntervalsPage: React.FC = () => {
  const [insights, setInsights] = useState<string[]>([
    "Most customers are within 12 months of their last visit, but a meaningful group is drifting into at-risk and lost intervals.",
    "13–24 month customers should be the primary target for reminder and reactivation touches.",
    "Average ticket is strongest in the 9–12 month window, suggesting this is a sweet spot for visit timing.",
  ]);

  const { selectedIds, setSelectedIds } = useKpiPreferences("service-intervals", KPI_OPTIONS);

  const regenerateInsights = () => {
    const activeSeg = LOYALTY_SEGMENTS.find((s) => s.id === "active");
    const lostSeg = LOYALTY_SEGMENTS.find((s) => s.id === "lost");
    const activePct = activeSeg ? ((activeSeg.customers / TOTAL_CUSTOMERS) * 100).toFixed(1) : "0";
    const lostPct = lostSeg ? ((lostSeg.customers / TOTAL_CUSTOMERS) * 100).toFixed(1) : "0";

    setInsights([
      `${activePct}% of customers are active (0–8 mo), with ${lostPct}% lost (25+ mo).`,
      `"Lost Cust" has ${lostSeg?.customers.toLocaleString()} customers; pair this report with Reactivation and One-Off Campaign Tracker to win them back.`,
      "Use this report to validate your journey intervals and adjust reminder timing by store or region.",
    ]);
  };

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "Customer Lifecycle" },
      ]}
      rightInfo={
        <span>
          Customers: <span className="font-medium">{TOTAL_CUSTOMERS.toLocaleString()}</span>
        </span>
      }
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Customer Lifecycle</h1>
          <p className="mt-1 text-sm text-slate-500">
            Snapshot of current, at-risk and lost customers by time since last service visit.
          </p>
        </div>
        <KpiCustomizeButton
          reportId="service-intervals"
          options={KPI_OPTIONS}
          selectedIds={selectedIds}
          onChangeSelected={setSelectedIds}
        />
      </div>

      {/* Main content using ReportPageLayout */}
      <ReportPageLayout
        kpis={
          selectedIds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
              {selectedIds.map((id) => {
                const seg = LOYALTY_SEGMENTS.find((s) => s.id === id);
                if (!seg) return null;
                const share = (seg.customers / TOTAL_CUSTOMERS) * 100;
                return (
                  <div
                    key={seg.id}
                    className={`rounded-2xl border border-slate-200 p-3 shadow-sm ${seg.kpiBgClass}`}
                  >
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold tracking-wide text-slate-600">
                        {seg.kpiTitle}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {seg.kpiRange}
                      </div>
                      <div className={`mt-1 text-xl font-semibold tracking-tight ${seg.kpiTextClass}`}>
                        {seg.customers.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-600 leading-tight">
                        <div>{share.toFixed(1)}% of customers</div>
                        <div>{seg.vehicles.toLocaleString()} vehicles</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null
        }
        ai={
          <AIInsightsTile
            title="AI Insights"
            subtitle="Based on interval & retention data"
            bullets={insights}
            onRefresh={regenerateInsights}
          />
        }
      >
        {/* Customer Lifecycle chart tile */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <header className="flex items-baseline justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-semibold text-slate-900">
                Customer Lifecycle
              </h2>
              <p className="text-[11px] text-slate-500">
                Buckets by time since last service visit
              </p>
            </div>
          </header>

          <div className="mt-4 space-y-3">
            {LOYALTY_SEGMENTS.map((seg) => (
              <div key={seg.id} className="space-y-1">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: segment label + range */}
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{seg.label}</div>
                    <div className="text-[11px] text-slate-500">{seg.rangeLabel}</div>
                  </div>

                  {/* Right: counts + avg ticket */}
                  <div className="text-right text-[11px] text-slate-500">
                    <div className="text-xs font-semibold text-slate-900">
                      {seg.customers.toLocaleString()} customers · {seg.vehicles.toLocaleString()} vehicles
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Avg ticket ${seg.avgTicket.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>

                {/* Bar with segment-specific color */}
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-1.5 rounded-full ${seg.barColorClass}`}
                    style={{ width: `${seg.barPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </ReportPageLayout>
    </ShellLayout>
  );
};

export default ServiceIntervalsPage;
