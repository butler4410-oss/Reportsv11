# Lovable Implementation Reference

This document provides the exact implementation details of the Throttle Pro Reporting Prototype built in Lovable. Use this as the canonical reference for maintaining consistency across all report pages.

---

## 1. Shell / Navigation Structure

### ShellLayout Component

`src/components/layout/ShellLayout.tsx`

```tsx
import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface ShellLayoutProps {
  breadcrumb: BreadcrumbItem[];
  rightInfo?: React.ReactNode;
  children: React.ReactNode;
}

const ShellLayout: React.FC<ShellLayoutProps> = ({
  breadcrumb,
  rightInfo,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-400">/</span>}
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className={
                      idx === breadcrumb.length - 1
                        ? "font-medium text-slate-700"
                        : "text-slate-400 hover:text-slate-600"
                    }
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={
                      idx === breadcrumb.length - 1
                        ? "font-medium text-slate-700"
                        : "text-slate-400"
                    }
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {rightInfo}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ShellLayout;
```

### Sidebar Component

`src/components/layout/Sidebar.tsx`

```tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const items = [
    { label: "Dashboard", path: "#", activeMatch: "" },
    { label: "Customers", path: "#", activeMatch: "" },
    { label: "Campaigns", path: "#", activeMatch: "" },
    { label: "Reports & Insights", path: "/", activeMatch: "/" },
    { label: "Organizations", path: "#", activeMatch: "" },
    { label: "Settings", path: "#", activeMatch: "" },
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-slate-900 text-slate-100">
      <div className="flex items-center gap-2 px-5 h-14 border-b border-slate-800">
        <div className="h-8 w-8 rounded-xl bg-emerald-400 flex items-center justify-center font-bold text-slate-900">
          TP
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">Throttle Pro</span>
          <span className="text-[11px] text-slate-400">Reporting Prototype</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 text-sm space-y-1">
        {items.map((item) => {
          const isActive =
            item.activeMatch &&
            location.pathname.startsWith(item.activeMatch);
          const classes = `w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-800 ${
            isActive ? "bg-slate-800 font-medium" : "text-slate-300"
          }`;
          const content = (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>{item.label}</span>
            </>
          );
          return item.path === "#" ? (
            <button key={item.label} className={classes}>
              {content}
            </button>
          ) : (
            <Link key={item.label} to={item.path} className={classes}>
              {content}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-400">
        Signed in as<br />
        <span className="text-slate-200">demo@throttlepro.com</span>
      </div>
    </aside>
  );
};

export default Sidebar;
```

---

## 2. Reports Index Page

`src/pages/Index.tsx`

### Types & Data Structures

```tsx
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
```

### Report Catalog (19 reports)

```tsx
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
  {
    id: "oil-type-invoices",
    name: "Oil Type – Invoices",
    primaryCategory: "vendors",
    secondaryCategories: ["sales"],
    type: "table",
    purpose: "Invoice-level detail for oil and vendor products, including coupons and operations.",
    previewMetric: "View 248 invoices with vendor oils",
  },

  // --- Customers ---
  {
    id: "service-intervals",
    name: "Service Intervals",
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
    purpose: "Customer/vehicle roster with visits, lifetime value and contactability.",
    previewMetric: "4,582 active customers",
  },
  {
    id: "data-capture-ltv",
    name: "Data Capture + Life Time Value",
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

  // --- Internal / Data health ---
  {
    id: "valid-email-capture",
    name: "Valid Email Capture",
    primaryCategory: "internal",
    secondaryCategories: ["customers"],
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
```

### Deep Link Mapping

```tsx
const DEEP_LINK_MAP: Record<string, { to: string; label: string }> = {
  "service-intervals": { to: "/reports/service-intervals", label: "Open Service Intervals" },
  "customer-journey": { to: "/reports/customer-journey", label: "Open Customer Journey" },
  "oil-type-sales": { to: "/reports/oil-type-sales", label: "Open Oil Type Sales" },
  "data-capture-ltv": { to: "/reports/data-capture-ltv", label: "Open Data Capture + LTV" },
  "customer-data": { to: "/reports/customer-data", label: "Open Customer Data" },
  "valid-address": { to: "/reports/valid-address", label: "Open Valid Address" },
  "product-sales": { to: "/reports/product-sales", label: "Open Product Sales" },
  "pos-data-lapse": { to: "/reports/pos-data-lapse", label: "Open POS Data Lapse" },
  "suggested-services": { to: "/reports/suggested-services", label: "Open Suggested Services" },
  "roas": { to: "/reports/roas", label: "Open ROAS" },
  "coupon-discount-analysis": { to: "/reports/coupon-discount-analysis", label: "Open Coupon Analysis" },
  "valid-email-capture": { to: "/reports/valid-email-capture", label: "Open Valid Email Capture" },
  "billing-campaign-tracking": { to: "/reports/billing-campaign-tracking", label: "Open Billing Tracking" },
  "active-locations": { to: "/reports/active-locations", label: "Open Active Locations" },
  "cost-projections": { to: "/reports/cost-projections", label: "Open Cost Projections" },
  "comprehensive-account-audit": { to: "/reports/comprehensive-account-audit", label: "Open Comprehensive Account Audit" },
  "call-back-report": { to: "/reports/call-back-report", label: "Open Call Back Report" },
  "one-off-campaign-tracker": { to: "/reports/one-off-campaign-tracker", label: "Open One-Off Campaign Tracker" },
  "oil-type-invoices": { to: "/reports/oil-type-invoices", label: "Open Oil Type – Invoices" },
};
```

### Index Page Layout Pattern

```tsx
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
  {/* Title + SummaryTiles */}
  {/* Category filter buttons + search input */}
  {/* Main area: flex with cards grid (3/4) + preview pane (1/4) */}
</ShellLayout>
```

---

## 3. Full Report Page Implementation

### Customer Journey Page

`src/pages/CustomerJourney.tsx`

```tsx
import React, { useMemo } from "react";
import { ShellLayout, MetricTile, AIInsightsTile } from "@/components/layout";

type JourneyStepDetail = {
  name: string;         // Comm Name (no timing embedded)
  interval: string;     // Interval Description / timing
  channel: string;      // primary delivery method(s)
  sent: number;
  vehicles: number;
  responseRate: number; // %
  roas: number;         // x
};

const JOURNEY_STEPS: JourneyStepDetail[] = [
  {
    name: "Thank You",
    interval: "1 day after Service",
    channel: "Text",
    sent: 1850,
    vehicles: 420,
    responseRate: 22.7,
    roas: 9.5,
  },
  {
    name: "Thank You Eml",
    interval: "1 day after Service",
    channel: "Email",
    sent: 1850,
    vehicles: 420,
    responseRate: 22.7,
    roas: 9.5,
  },
  {
    name: "Suggested Services",
    interval: "1 week after Service",
    channel: "Email",
    sent: 1760,
    vehicles: 310,
    responseRate: 17.6,
    roas: 12.1,
  },
  {
    name: "2nd Vehicle Invitation",
    interval: "10 days after Service",
    channel: "Email",
    sent: 900,
    vehicles: 150,
    responseRate: 16.7,
    roas: 10.3,
  },
  {
    name: "Suggested Services",
    interval: "1 month after Service",
    channel: "Email",
    sent: 1640,
    vehicles: 240,
    responseRate: 14.6,
    roas: 11.2,
  },
  {
    name: "Suggested Services",
    interval: "3 months after Service",
    channel: "Email",
    sent: 1520,
    vehicles: 230,
    responseRate: 15.1,
    roas: 10.9,
  },
  {
    name: "Suggested Services",
    interval: "6 months after Service",
    channel: "Email",
    sent: 1380,
    vehicles: 210,
    responseRate: 15.2,
    roas: 10.8,
  },
  {
    name: "Monthly Newsletter",
    interval: "Once a month",
    channel: "Email",
    sent: 4200,
    vehicles: 520,
    responseRate: 12.4,
    roas: 7.8,
  },
  {
    name: "Reminder 1",
    interval: "5k after last Service",
    channel: "Postcard + Email + SMS",
    sent: 1380,
    vehicles: 280,
    responseRate: 20.3,
    roas: 16.4,
  },
  {
    name: "Reminder 2",
    interval: "30 days after Reminder 1",
    channel: "Postcard + Email + SMS",
    sent: 980,
    vehicles: 142,
    responseRate: 14.5,
    roas: 10.7,
  },
  {
    name: "Reminder 3",
    interval: "10k after last Service",
    channel: "Postcard + Email + SMS",
    sent: 860,
    vehicles: 120,
    responseRate: 14.0,
    roas: 9.8,
  },
  {
    name: "Reminder 4",
    interval: "15k after last Service",
    channel: "Postcard + Email + SMS",
    sent: 740,
    vehicles: 105,
    responseRate: 14.2,
    roas: 9.4,
  },
  {
    name: "Reactivation",
    interval: "12 months after Service",
    channel: "Email",
    sent: 620,
    vehicles: 86,
    responseRate: 13.9,
    roas: 8.2,
  },
  {
    name: "Reactivation",
    interval: "18 months after Service",
    channel: "Email",
    sent: 480,
    vehicles: 64,
    responseRate: 13.3,
    roas: 7.5,
  },
  {
    name: "Reactivation",
    interval: "24 months after Service",
    channel: "Email",
    sent: 360,
    vehicles: 46,
    responseRate: 12.8,
    roas: 7.1,
  },
];

const CustomerJourneyPage: React.FC = () => {
  const totalSent = useMemo(
    () => JOURNEY_STEPS.reduce((sum, s) => sum + s.sent, 0),
    []
  );
  const journeyVehicles = useMemo(
    () => JOURNEY_STEPS.reduce((sum, s) => sum + s.vehicles, 0),
    []
  );
  const avgStepRoas = useMemo(
    () =>
      JOURNEY_STEPS.reduce((sum, s) => sum + s.roas, 0) /
      JOURNEY_STEPS.length,
    []
  );
  const avgRespRate = useMemo(
    () =>
      JOURNEY_STEPS.reduce((sum, s) => sum + s.responseRate, 0) /
      JOURNEY_STEPS.length,
    []
  );
  const maxResponseRate = useMemo(
    () => Math.max(...JOURNEY_STEPS.map((s) => s.responseRate), 1),
    []
  );

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
            Store group: <span className="font-medium">North Bay Group</span>
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
            Performance of the standard Throttle journey steps for this store:
            thank-you, suggested services, reminders and reactivation.
          </p>
        </div>
      </div>

      {/* Main layout: left content (3/4) + right AI tile (1/4) */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEFT: all journey tiles and tables */}
        <div className="lg:col-span-3 space-y-4">
          {/* KPI tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricTile
              label="Vehicles"
              value={journeyVehicles.toLocaleString()}
            />
            <MetricTile
              label="Avg ROAS"
              value={`${avgStepRoas.toFixed(1)}x`}
            />
            <MetricTile
              label="Average response rate"
              value={`${avgRespRate.toFixed(1)}%`}
            />
            <MetricTile
              label="Total comms sent"
              value={totalSent.toLocaleString()}
            />
          </div>

          {/* Journey steps visualization */}
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Customer Journey: Touch Point + Response Rate + ROAS
                </h2>
                <p className="text-[11px] text-slate-600">
                  Relative performance (dummy data)
                </p>
              </div>
              <span className="hidden text-[11px] text-slate-500 lg:inline">
                {journeyVehicles.toLocaleString()} journey vehicles ·{" "}
                {totalSent.toLocaleString()} comms sent
              </span>
            </div>

            <div className="mt-3 space-y-3 text-xs text-slate-700">
              {JOURNEY_STEPS.map((step, idx) => (
                <div key={step.name}>
                  {/* Top row: touch point name + timing on left, stacked stats on right */}
                  <div className="flex items-start justify-between gap-3 text-[11px]">
                    <div className="text-slate-700">
                      <span className="font-medium">
                        {idx + 1}. {step.name}
                      </span>{" "}
                      <span className="text-slate-500">
                        ({step.interval})
                      </span>
                    </div>

                    <div className="text-right text-slate-600 min-w-[80px]">
                      <div>{step.responseRate.toFixed(1)}% RESP</div>
                      <div>{step.roas.toFixed(1)}x ROAS</div>
                    </div>
                  </div>

                  {/* Bar row */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-sky-500"
                        style={{
                          width: `${
                            (step.responseRate / maxResponseRate) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Touch point details table */}
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Touch point details
              </h2>
              <span className="text-[11px] text-slate-600">
                Sent, responses and ROAS by touch point
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3">Touch Point</th>
                    <th className="py-2 pr-3">Timing</th>
                    <th className="py-2 pr-3">Channel</th>
                    <th className="py-2 pr-3 text-right">Sent</th>
                    <th className="py-2 pr-3 text-right">Responses</th>
                    <th className="py-2 pr-3 text-right">Resp %</th>
                    <th className="py-2 pr-3 text-right">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {JOURNEY_STEPS.map((step) => (
                    <tr key={step.name} className="border-t border-slate-100">
                      <td className="py-2 pr-3 text-slate-800">
                        {step.name}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {step.interval}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {step.channel}
                      </td>
                      <td className="py-2 pr-3 text-right">
                        {step.sent.toLocaleString()}
                      </td>
                      <td className="py-2 pr-3 text-right">
                        {step.vehicles.toLocaleString()}
                      </td>
                      <td className="py-2 pr-3 text-right">
                        {step.responseRate.toFixed(1)}%
                      </td>
                      <td className="py-2 pr-3 text-right">
                        {step.roas.toFixed(1)}x
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT: AI Insights tile, fixed 1/4-width column */}
        <div className="lg:col-span-1">
          <AIInsightsTile
            title="AI Insights"
            subtitle="Based on 12 months data"
            bullets={[]} // empty = loading state
          />
        </div>
      </div>
    </ShellLayout>
  );
};

export default CustomerJourneyPage;
```

---

## 4. Shared Layout Components

### MetricTile

`src/components/layout/MetricTile.tsx`

```tsx
import React from "react";

type MetricTileProps = {
  label: string;
  value: string;
  helper?: string;
  highlight?: boolean;
};

const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  helper,
  highlight = false,
}) => {
  const valueClass = highlight
    ? "inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-sm md:text-base font-semibold"
    : "text-sm md:text-base font-semibold text-slate-900";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full">
      <div className="flex flex-col justify-center h-full px-3 py-3 md:px-4 md:py-4 min-h-[88px]">
        <div className="text-[11px] font-medium text-slate-500 leading-snug">
          {label}
        </div>
        <div className={`${valueClass} mt-1 leading-tight`}>{value}</div>
        {helper && (
          <div className="mt-1 text-[11px] text-slate-500 leading-snug">
            {helper}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricTile;
```

### AIInsightsTile

`src/components/layout/AIInsightsTile.tsx`

```tsx
import React from "react";

type AIInsightsTileProps = {
  title?: string;
  subtitle?: string;
  bullets: string[];
  onRefresh?: () => void;
};

const AIInsightsTile: React.FC<AIInsightsTileProps> = ({
  title = "AI Insights",
  subtitle = "Based on last 12 months data",
  bullets,
  onRefresh,
}) => {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-sky-50 via-sky-50 to-sky-100 border border-sky-100 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2 gap-3">
        <div className="flex items-start gap-2">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm text-sky-500 text-lg">
            ✨
          </span>
          <div>
            <div className="text-xs font-semibold text-sky-800">
              {title}
            </div>
            <p className="mt-1 text-[11px] text-sky-600">{subtitle}</p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-[11px] px-2 py-1 rounded-full border border-sky-100 bg-white/70 hover:bg-white text-sky-600"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 px-4 pb-4">
        {bullets.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[11px] text-sky-500 italic">
            Loading KPI data…
          </div>
        ) : (
          <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
            {bullets.map((line, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-sky-100 px-4 py-2">
        <p className="text-[10px] text-sky-500">
          Powered by AI · Insights refresh when data changes.
        </p>
      </div>
    </div>
  );
};

export default AIInsightsTile;
```

### SummaryTile

`src/components/layout/SummaryTile.tsx`

```tsx
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
```

### DeepLink

`src/components/layout/DeepLink.tsx`

```tsx
import React from "react";
import { Link } from "react-router-dom";

interface DeepLinkProps {
  to: string;
  label: string;
}

const DeepLink: React.FC<DeepLinkProps> = ({ to, label }) => (
  <div className="pt-2 mt-1">
    <Link
      to={to}
      className="inline-flex items-center text-[11px] font-medium text-sky-600 hover:text-sky-700"
      onClick={(e) => e.stopPropagation()}
    >
      {label} →
    </Link>
  </div>
);

export default DeepLink;
```

### BarStack

`src/components/layout/BarStack.tsx`

```tsx
import React from "react";

interface BarSegment {
  label: string;
  value: number;
  color: string;
}

interface BarStackProps {
  segments: BarSegment[];
}

const BarStack: React.FC<BarStackProps> = ({ segments }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div className="space-y-3">
      <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-100">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`h-full ${seg.color}`}
            style={{ width: `${(seg.value / total) * 100}%` }}
            title={`${seg.label} · ${seg.value}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
        {segments.map((seg) => (
          <span key={seg.label} className="inline-flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${seg.color}`} />
            <span>
              {seg.label} · {seg.value}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export const SimpleStackBar: React.FC<BarStackProps> = ({ segments }) => (
  <BarStack segments={segments} />
);

export const LegendDot: React.FC<{ colorClass: string; label: string }> = ({
  colorClass,
  label,
}) => (
  <span className="inline-flex items-center gap-1">
    <span className={`h-2 w-2 rounded-full ${colorClass}`} />
    <span>{label}</span>
  </span>
);

export default BarStack;
```

### Component Exports

`src/components/layout/index.ts`

```tsx
export { default as Sidebar } from "./Sidebar";
export { default as ShellLayout } from "./ShellLayout";
export { default as MetricTile } from "./MetricTile";
export { default as SummaryTile } from "./SummaryTile";
export { default as BarStack, SimpleStackBar, LegendDot } from "./BarStack";
export { default as DeepLink } from "./DeepLink";
export { default as AIInsightsTile } from "./AIInsightsTile";
```

---

## 5. Design Tokens / Tailwind Conventions

### CSS Variables (index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;

    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode variants */
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}
```

### Tailwind Config (tailwind.config.ts)

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

---

## 6. Routing Structure

### App.tsx Routes

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/reports/service-intervals" element={<ServiceIntervals />} />
    <Route path="/reports/customer-journey" element={<CustomerJourney />} />
    <Route path="/reports/oil-type-sales" element={<OilTypeSales />} />
    <Route path="/reports/data-capture-ltv" element={<DataCaptureLtv />} />
    <Route path="/reports/customer-data" element={<CustomerDataPage />} />
    <Route path="/reports/valid-address" element={<ValidAddressPage />} />
    <Route path="/reports/product-sales" element={<ProductSalesPage />} />
    <Route path="/reports/pos-data-lapse" element={<PosDataLapsePage />} />
    <Route path="/reports/suggested-services" element={<SuggestedServicesPage />} />
    <Route path="/reports/roas" element={<RoasPage />} />
    <Route path="/reports/coupon-discount-analysis" element={<CouponDiscountPage />} />
    <Route path="/reports/valid-email-capture" element={<ValidEmailCapturePage />} />
    <Route path="/reports/billing-campaign-tracking" element={<BillingCampaignTrackingPage />} />
    <Route path="/reports/active-locations" element={<ActiveLocationsPage />} />
    <Route path="/reports/cost-projections" element={<CostProjectionsPage />} />
    <Route path="/reports/comprehensive-account-audit" element={<ComprehensiveAccountAuditPage />} />
    <Route path="/reports/call-back-report" element={<CallBackReportPage />} />
    <Route path="/reports/one-off-campaign-tracker" element={<OneOffCampaignTrackerPage />} />
    <Route path="/reports/oil-type-invoices" element={<OilTypeInvoicesPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

---

## 7. Common Conventions

### Typography Scale

- `text-[10px]` – Footer fine print
- `text-[11px]` – Labels, captions, table headers (uppercase + tracking-wide)
- `text-xs` – Table cells, bullet lists, helper text
- `text-sm` – Section titles, card titles
- `text-base` – Primary values in MetricTile
- `text-xl md:text-2xl` – Page h1 headings

### Spacing Patterns

- Card padding: `p-4`
- Grid gaps: `gap-3` (KPI tiles), `gap-4` (sections)
- Section spacing: `space-y-4` inside left column

### Card Styling

- Rounded corners: `rounded-2xl`
- Border: `border border-slate-200`
- Shadow: `shadow-sm`
- Background: `bg-white`

### Bar Visualization

- Container: `h-2 rounded-full bg-slate-100 overflow-hidden`
- Fill bar: `h-full bg-sky-500` (or `bg-emerald-500` for SS)
- Width calculated as percentage of max value

### Table Styling

- Header: `text-[11px] uppercase tracking-wide text-slate-500`
- Cells: `py-2 pr-3 text-xs`
- Row dividers: `border-t border-slate-100`

---

## 8. Icon System

Using **Lucide React** icons. Import example:

```tsx
import { Camera, Settings, ChevronRight } from 'lucide-react';

<Camera size={16} className="text-slate-500" />
```

Currently emojis are used in places (e.g., ✨ in AIInsightsTile). These can be swapped to Lucide icons as needed.

---

## Summary

This reference document contains everything needed to build new report pages that match the existing Lovable implementation:

1. **ShellLayout** – Main wrapper with sidebar, breadcrumbs, right info
2. **Report page pattern** – `lg:grid-cols-4` with left 3/4 content + right 1/4 AI tile
3. **MetricTile** – KPI display component
4. **AIInsightsTile** – Right-side AI insights panel
5. **Category/card system** – 5 categories, color coding, type labels
6. **Table conventions** – Headers, cells, dividers
7. **Bar visualizations** – Response rate bars with max-relative scaling
8. **19 reports** – Full catalog with routes and deep links
