import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShellLayout, SummaryTile, DeepLink, AIInsightsTile, AI_INSIGHTS_WIDTH_CLASSES } from "@/components/layout";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
type CategoryId = "all" | "marketing" | "sales" | "customers" | "vendors" | "internal";
type ReportType = "chart" | "table" | "kpi" | "mixed";

interface Category {
  id: Exclude<CategoryId, "all">;
  label: string;
  description: string;
}

interface Report {
  id: string;
  name: string;
  primaryCategory: Exclude<CategoryId, "all">;
  secondaryCategories?: Exclude<CategoryId, "all">[];
  type: ReportType;
  purpose: string;
  previewMetric?: string;
}

const CATEGORIES: Category[] = [
  { id: "marketing", label: "Marketing", description: "Journeys, campaigns, ROAS & offers" },
  { id: "sales", label: "Sales", description: "Tickets, oil mix, products & revenue" },
  { id: "customers", label: "Customers", description: "Retention, data quality & value" },
  { id: "vendors", label: "Vendors", description: "Vendor & distributor performance" },
  { id: "internal", label: "Internal", description: "Billing, data health & configuration" },
];

const REPORTS: Report[] = [
  // --- Marketing ---
  {
    id: "customer-journey",
    name: "Customer Journey",
    primaryCategory: "marketing",
    type: "mixed",
    purpose: "Step-by-step performance of the lifecycle journey (thank-you, SS, reminders, reactivation).",
    previewMetric: "Journey ROAS 12.4x · 64% of car count",
  },
  {
    id: "one-off-campaign-tracker",
    name: "One-Off Campaign Tracker",
    primaryCategory: "marketing",
    type: "mixed",
    purpose: "Compare one-off campaigns on ROAS, vehicles, coupons & clicks.",
    previewMetric: "8 campaigns · Avg ROAS 9.7x",
  },
  {
    id: "suggested-services",
    name: "Suggested Services",
    primaryCategory: "marketing",
    secondaryCategories: ["sales"],
    type: "mixed",
    purpose: "Track how educational Suggested Services convert into upsell revenue.",
    previewMetric: "SS acceptance 23% · $18.4k SS rev",
  },
  {
    id: "roas",
    name: "ROAS (Return on Ad Spend)",
    primaryCategory: "marketing",
    type: "mixed",
    purpose: "Evaluate campaigns and channels on spend, response, revenue and ROAS.",
    previewMetric: "Overall ROAS 14.8x",
  },

  // --- Sales / Vendors ---
  {
    id: "coupon-discount-analysis",
    name: "Coupon / Discount Analysis",
    primaryCategory: "sales",
    type: "mixed",
    purpose: "See which offers drive profitable visits and where discounting erodes margin.",
    previewMetric: "Discount rate 12.3% of revenue",
  },
  {
    id: "oil-type-sales",
    name: "Oil Type Sales",
    primaryCategory: "sales",
    secondaryCategories: ["vendors"],
    type: "chart",
    purpose: "Volume and revenue mix across conventional, synthetic and high mileage oils.",
    previewMetric: "Synthetic share 69% units · 83% revenue",
  },
  {
    id: "product-sales",
    name: "Product Sales",
    primaryCategory: "vendors",
    secondaryCategories: ["sales"],
    type: "chart",
    purpose: "Monthly revenue and invoices by vendor/product group (e.g., Royal Purple, house brand).",
    previewMetric: "Royal Purple 32% of oil revenue",
  },

  // --- Customers ---
  {
    id: "service-intervals",
    name: "Customer Lifecycle",
    primaryCategory: "customers",
    type: "chart",
    purpose: "Retention snapshot: current, at-risk and lost customers by time since last visit.",
    previewMetric: "71% current · 14% at-risk · 15% lost",
  },
  {
    id: "customer-data",
    name: "Customer Data",
    primaryCategory: "customers",
    type: "table",
    purpose: "Customer/vehicle roster with visits, lifetime value (LTV) and contactability.",
    previewMetric: "4,582 active customers",
  },
  {
    id: "data-capture-ltv",
    name: "Customer Value Analysis",
    primaryCategory: "customers",
    secondaryCategories: ["internal"],
    type: "chart",
    purpose: "Show how mail/email capture impacts revenue and ticket averages.",
    previewMetric: "Multi-channel +$56 per visit vs blank",
  },
  {
    id: "valid-address",
    name: "Valid Address Report",
    primaryCategory: "customers",
    secondaryCategories: ["internal"],
    type: "kpi",
    purpose: "Mail & email reachability by store: valid, bad & blank records.",
    previewMetric: "Mail reach 86% · Email reach 74%",
  },

  // --- Customers / Data health ---
  {
    id: "valid-email-capture",
    name: "Valid Email Capture",
    primaryCategory: "customers",
    type: "chart",
    purpose: "New valid emails captured by store, tech and week.",
    previewMetric: "228 new valid emails last 7 days",
  },
  {
    id: "call-back-report",
    name: "Call Back Report",
    primaryCategory: "customers",
    type: "table",
    purpose: "Operational queue of customers needing follow-up calls.",
    previewMetric: "34 callbacks queued",
  },
  {
    id: "billing-campaign-tracking",
    name: "Billing – Campaign Tracking",
    primaryCategory: "internal",
    secondaryCategories: ["marketing"],
    type: "table",
    purpose: "Tie billing lines to campaigns, spend and ROAS.",
    previewMetric: "Last month: $42k billed · ROAS 11.3x",
  },
  {
    id: "active-locations",
    name: "Active Locations",
    primaryCategory: "internal",
    type: "kpi",
    purpose: "Directory of live, paused and launching stores with contact details.",
    previewMetric: "28 active · 2 launching",
  },
  {
    id: "cost-projections",
    name: "Cost Projections (Journey)",
    primaryCategory: "internal",
    secondaryCategories: ["marketing"],
    type: "chart",
    purpose: "Forecast journey step costs and expected response/ROAS.",
    previewMetric: "Projected monthly cost $12.8k",
  },
  {
    id: "comprehensive-account-audit",
    name: "Comprehensive Account Audit",
    primaryCategory: "internal",
    type: "table",
    purpose: "Config snapshot: intervals, rules, branding and data flags per account.",
    previewMetric: "Audit score 92/100",
  },
  {
    id: "pos-data-lapse",
    name: "POS Data Lapse",
    primaryCategory: "internal",
    type: "kpi",
    purpose: "Monitor POS feed gaps by store, with days without data and vendor contacts.",
    previewMetric: "3 stores with >3 days lapse",
  },
];

const typeLabel: Record<ReportType, string> = {
  chart: "Chart",
  table: "Table",
  kpi: "KPI",
  mixed: "Charts & table",
};

const categoryColors: Record<Exclude<CategoryId, "all">, string> = {
  marketing: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  sales: "bg-sky-50 text-sky-700 ring-sky-100",
  customers: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  vendors: "bg-amber-50 text-amber-700 ring-amber-100",
  internal: "bg-rose-50 text-rose-700 ring-rose-100",
};

const categoryAccentBar: Record<Exclude<CategoryId, "all">, string> = {
  marketing: "bg-emerald-400",
  sales: "bg-sky-400",
  customers: "bg-indigo-400",
  vendors: "bg-amber-400",
  internal: "bg-rose-400",
};

const CATEGORY_ORDER: Exclude<CategoryId, "all">[] = [
  "marketing",
  "sales",
  "customers",
  "vendors",
  "internal",
];

const DEEP_LINK_MAP: Record<string, { to: string; label: string }> = {
  "service-intervals": { to: "/reports/service-intervals", label: "View Report" },
  "customer-journey": { to: "/reports/customer-journey", label: "View Report" },
  "oil-type-sales": { to: "/reports/oil-type-sales", label: "View Report" },
  "data-capture-ltv": { to: "/reports/data-capture-ltv", label: "View Report" },
  "customer-data": { to: "/reports/customer-data", label: "View Report" },
  "valid-address": { to: "/reports/valid-address", label: "View Report" },
  "product-sales": { to: "/reports/product-sales", label: "View Report" },
  "pos-data-lapse": { to: "/reports/pos-data-lapse", label: "View Report" },
  "suggested-services": { to: "/reports/suggested-services", label: "View Report" },
  "roas": { to: "/reports/roas", label: "View Report" },
  "coupon-discount-analysis": { to: "/reports/coupon-discount-analysis", label: "View Report" },
  "valid-email-capture": { to: "/reports/valid-email-capture", label: "View Report" },
  "billing-campaign-tracking": { to: "/reports/billing-campaign-tracking", label: "View Report" },
  "active-locations": { to: "/reports/active-locations", label: "View Report" },
  "cost-projections": { to: "/reports/cost-projections", label: "View Report" },
  "comprehensive-account-audit": { to: "/reports/comprehensive-account-audit", label: "View Report" },
  "call-back-report": { to: "/reports/call-back-report", label: "View Report" },
  "one-off-campaign-tracker": { to: "/reports/one-off-campaign-tracker", label: "View Report" },
  
};

const buildReportInsights = (report: Report | null, categories: Category[]): string[] => {
  if (!report) {
    return [
      "Select a report on the left to see AI suggestions for how to use it.",
      "Use filters at the top to focus on Marketing, Sales, Customers, Vendors or Internal reports.",
    ];
  }

  const categoryLabel =
    categories.find((c) => c.id === report.primaryCategory)?.label ?? "this category";

  const bullets: string[] = [
    `This report focuses on ${categoryLabel.toLowerCase()} performance and behavior.`,
  ];

  if (report.previewMetric) {
    bullets.push(`Current preview metric: ${report.previewMetric}.`);
  }

  bullets.push(
    "Use this view to spot segments for journeys, one-off campaigns and data clean-up work."
  );

  return bullets;
};

const Index: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryId>("all");
  const [search, setSearch] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const selectedReport = useMemo(
    () => REPORTS.find((r) => r.id === selectedReportId) ?? null,
    [selectedReportId]
  );

  const insightsBullets = useMemo(
    () => buildReportInsights(selectedReport, CATEGORIES),
    [selectedReport]
  );

  const visibleReports = useMemo(() => {
    const term = search.trim().toLowerCase();

    // 1) Filter by primary category only
    let filtered = REPORTS.filter((report) => {
      if (categoryFilter === "all") return true;
      return report.primaryCategory === categoryFilter;
    });

    // 2) Filter by search term
    if (term) {
      filtered = filtered.filter((report) => {
        const haystack =
          `${report.name} ${report.purpose} ${report.previewMetric ?? ""}`.toLowerCase();
        return haystack.includes(term);
      });
    }

    // 3) Sort by primaryCategory order, then by name
    return filtered
      .slice()
      .sort((a, b) => {
        const aIdx = CATEGORY_ORDER.indexOf(a.primaryCategory);
        const bIdx = CATEGORY_ORDER.indexOf(b.primaryCategory);

        if (aIdx !== bIdx) return aIdx - bIdx;
        return a.name.localeCompare(b.name);
      });
  }, [categoryFilter, search]);

  const totalsByCategory = useMemo(() => {
    const counts: Record<Exclude<CategoryId, "all">, number> = {
      marketing: 0,
      sales: 0,
      customers: 0,
      vendors: 0,
      internal: 0,
    };
    REPORTS.forEach((r) => {
      counts[r.primaryCategory] += 1;
    });
    return counts;
  }, []);

  const totalReports = REPORTS.length;

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights" },
      ]}
      rightInfo={
        <>
          <button className="hidden md:inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
            Export
          </button>
          <button className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-sky-700">
            + New Report (future)
          </button>
        </>
      }
    >
      {/* Title + description */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Reports & Insights
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Insights, segments and performance analytics for the entire Throttle Pro stack.
          </p>
        </div>
      </div>

      {/* Category filter + search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: "all" as CategoryId, label: "All" },
            ...CATEGORIES.map((c) => ({ id: c.id as CategoryId, label: c.label })),
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-full border text-xs transition ${
                categoryFilter === cat.id
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search reports…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 pl-8 text-xs text-slate-700 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
          <span className="absolute inset-y-0 left-2 flex items-center text-slate-400 text-xs">
            🔍
          </span>
        </div>
      </div>

      {/* Main area: cards + preview - flex layout matches report pages */}
      <div className="mt-4 flex flex-col lg:flex-row lg:gap-4 lg:items-start">
        {/* Left: report cards grid */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max items-start">
          {visibleReports.map((report) => {
            const isSelected = selectedReport?.id === report.id;
            const badgeColors = categoryColors[report.primaryCategory];
            const accentBar = categoryAccentBar[report.primaryCategory];
            const deepLink = DEEP_LINK_MAP[report.id];

            return (
              <TooltipProvider key={report.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <article
                      onClick={() => setSelectedReportId(report.id)}
                      className={[
                        "group h-full rounded-2xl border bg-white shadow-sm cursor-pointer flex flex-col",
                        "transition-all hover:shadow-md hover:border-sky-200",
                        isSelected ? "border-sky-300 ring-1 ring-sky-100" : "border-slate-200",
                      ].join(" ")}
                    >
                      {/* Top color bar */}
                      <div className={`h-1.5 rounded-t-2xl ${accentBar}`} />

                      <div className="flex-1 p-4 space-y-2">
                        <div className="flex items-center text-[11px]">
                          <span
                            className={[
                              "inline-flex items-center px-2 py-0.5 rounded-full font-medium",
                              "bg-opacity-80 ring-1 ring-inset",
                              badgeColors,
                            ].join(" ")}
                          >
                            {CATEGORIES.find((c) => c.id === report.primaryCategory)?.label ??
                              "Category"}
                          </span>
                        </div>

                        <h2 className="text-sm font-semibold text-slate-900 leading-snug">
                          {report.name}
                        </h2>

                        <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                          {report.purpose}
                        </p>

                        {report.previewMetric && (
                          <p className="pt-2 mt-1 text-[11px] text-slate-500 border-t border-dashed border-slate-200">
                            {report.previewMetric}
                          </p>
                        )}
                      </div>

                      {/* Footer CTA row */}
                      <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2">
                        {deepLink && (
                          <DeepLink to={deepLink.to} label={deepLink.label} />
                        )}
                      </div>
                    </article>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="start"
                    className="max-w-xs text-[11px] leading-snug"
                  >
                    {report.purpose}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}

          {visibleReports.length === 0 && (
            <p className="text-xs text-slate-400">No reports match your filters yet.</p>
          )}
        </div>

        {/* Right: report preview + AI insights - uses shared width */}
        <aside className={`${AI_INSIGHTS_WIDTH_CLASSES} hidden lg:block space-y-4 self-start`}>
          {/* Report Preview card */}
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
            {selectedReport ? (
              <div className="space-y-3 text-xs text-slate-700">
                <div>
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Report name
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {selectedReport.name}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Primary category
                  </div>
                  <div className="mt-0.5">
                    {
                      CATEGORIES.find(
                        (c) => c.id === selectedReport.primaryCategory
                      )?.label
                    }
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Purpose
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-600">
                    {selectedReport.purpose}
                  </p>
                </div>

                {selectedReport.previewMetric && (
                  <div>
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                      Example metric (dummy)
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-600">
                      {selectedReport.previewMetric}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                Choose a report on the left to see its purpose and example metrics.
              </p>
            )}
          </section>

          {/* AI Insights tile */}
          <AIInsightsTile
            title="AI Insights"
            subtitle={
              selectedReport
                ? `Based on similar ${selectedReport.primaryCategory.toLowerCase()} reports`
                : "Select a report to see AI suggestions"
            }
            bullets={insightsBullets}
          />
        </aside>
      </div>
    </ShellLayout>
  );
};

export default Index;
