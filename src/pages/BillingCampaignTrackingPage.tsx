import React, { useState, useMemo } from "react";
import { ShellLayout, MetricTile, AIInsightsTile, KpiCustomizeButton, DraggableKpiRow, ReportPageLayout } from "@/components/layout";
import { useKpiPreferences, KpiOption } from "@/hooks/useKpiPreferences";
import {
  ReportTable,
  ReportTableHead,
  ReportTableBody,
  ReportTableRow,
  ReportTableHeaderCell,
  ReportTableCell,
} from "@/components/ui/report-table";

type BillingSummary = {
  periodLabel: string;
  totalBilling: number;
  billedCampaigns: number;
  storesBilled: number;
  outstanding: number;
};

type BillingRow = {
  billingId: string;
  campaignName: string;
  storeName: string;
  channel: "Email" | "Postcard" | "Mixed";
  amount: number;
  status: "Pending" | "Posted" | "Paid";
  billingDate: string;
};

const billingSummary: BillingSummary = {
  periodLabel: "Current month",
  totalBilling: 12840,
  billedCampaigns: 9,
  storesBilled: 7,
  outstanding: 4320,
};

const billingRows: BillingRow[] = [
  {
    billingId: "B-2024-1201",
    campaignName: "Reminder 1 – December",
    storeName: "Vallejo, CA",
    channel: "Mixed",
    amount: 2100,
    status: "Posted",
    billingDate: "2024-12-01",
  },
  {
    billingId: "B-2024-1202",
    campaignName: "Reminder 1 – December",
    storeName: "Napa, CA",
    channel: "Mixed",
    amount: 1840,
    status: "Pending",
    billingDate: "2024-12-01",
  },
  {
    billingId: "B-2024-1203",
    campaignName: "Reactivation 18–24 months",
    storeName: "All Stores",
    channel: "Email",
    amount: 780,
    status: "Posted",
    billingDate: "2024-12-03",
  },
  {
    billingId: "B-2024-1204",
    campaignName: "Holiday Thank You",
    storeName: "All Stores",
    channel: "Email",
    amount: 540,
    status: "Paid",
    billingDate: "2024-11-29",
  },
  {
    billingId: "B-2024-1205",
    campaignName: "New Mover Welcome",
    storeName: "Fairfield, CA",
    channel: "Postcard",
    amount: 1960,
    status: "Pending",
    billingDate: "2024-12-02",
  },
];

const KPI_OPTIONS: KpiOption[] = [
  { id: "totalBilling", label: "Total billing" },
  { id: "outstanding", label: "Outstanding" },
  { id: "billedCampaigns", label: "Billed campaigns" },
  { id: "storesBilled", label: "Stores billed" },
  { id: "pendingBilling", label: "Pending billing" },
];

const BillingCampaignTrackingPage: React.FC = () => {
  const [insights, setInsights] = useState<string[]>([
    "Most billing this month is from reminder postcards and mixed-channel campaigns.",
    "A portion of spend is still in Pending status and should be reviewed before month-end.",
    "Paid vs posted breakdown looks healthy; no major billing anomalies are visible.",
  ]);

  const totalPending = useMemo(() => billingRows.filter((b) => b.status === "Pending").reduce((sum, b) => sum + b.amount, 0), []);
  const totalPaid = useMemo(() => billingRows.filter((b) => b.status === "Paid").reduce((sum, b) => sum + b.amount, 0), []);
  const totalPosted = useMemo(() => billingRows.filter((b) => b.status === "Posted").reduce((sum, b) => sum + b.amount, 0), []);

  const { selectedIds, setSelectedIds } = useKpiPreferences("billing-campaign-tracking", KPI_OPTIONS);

  const renderKpiTile = (id: string) => {
    switch (id) {
      case "totalBilling": return <MetricTile key={id} label="Total billing" value={`$${billingSummary.totalBilling.toLocaleString()}`} helpText="Total billed amount for all campaigns during the selected period. This includes all channel costs across email, mail, and SMS." />;
      case "outstanding": return <MetricTile key={id} label="Outstanding" value={`$${billingSummary.outstanding.toLocaleString()}`} helpText="Total amount billed but not yet paid by store owners. Monitor this to ensure timely collections and cash flow." />;
      case "billedCampaigns": return <MetricTile key={id} label="Billed campaigns" value={billingSummary.billedCampaigns.toString()} helpText="Number of campaigns with billing entries in the selected period. Each campaign may include multiple drops and channels." />;
      case "storesBilled": return <MetricTile key={id} label="Stores billed" value={billingSummary.storesBilled.toString()} helpText="Number of store locations with billing activity in the period. Use this to verify all active stores are being billed correctly." />;
      case "pendingBilling": return <MetricTile key={id} label="Pending billing" value={`$${totalPending.toFixed(0)}`} helpText="Amount awaiting approval or processing before posting to invoices. Pending items should be reviewed and cleared regularly." />;
      default: return null;
    }
  };

  const regenerateInsights = () => {
    setInsights([
      `Pending billing totals $${totalPending.toFixed(
        0
      )}; confirm these jobs before close.`,
      `Posted but unpaid campaigns total $${totalPosted.toFixed(
        0
      )}; review with accounting.`,
      `Paid campaigns this period total $${totalPaid.toFixed(
        0
      )}, giving visibility into cash vs accrual.`,
    ]);
  };

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "Billing – Campaign Tracking" },
      ]}
      rightInfo={
        <>
          <span>
            Period:{" "}
            <span className="font-medium">{billingSummary.periodLabel}</span>
          </span>
        </>
      }
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Billing – Campaign Tracking
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tie marketing activity to billing entries so owners and groups see
            exactly what they are paying for.
          </p>
        </div>
        <KpiCustomizeButton
          reportId="billing-campaign-tracking"
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
              reportKey="billing-campaign-tracking"
              tiles={selectedIds
                .map((id) => {
                  const tile = renderKpiTile(id);
                  return tile ? { id, element: tile } : null;
                })
                .filter(Boolean) as { id: string; element: React.ReactNode }[]}
            />
          ) : null
        }
        ai={
          <AIInsightsTile
            title="AI Insights"
            subtitle="Based on billing & campaign data"
            bullets={insights}
            onRefresh={regenerateInsights}
          />
        }
      >
        {/* Status breakdown */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Billing by status
            </h2>
            <span className="text-[11px] text-slate-500">
              Pending, posted and paid
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-3 text-xs text-slate-700">
            <div className="flex-1">
              <div className="flex justify-between text-[11px]">
                <span>Pending</span>
                <span>${totalPending.toFixed(0)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-tp-pastel-yellow"
                  style={{
                    width: `${(totalPending / billingSummary.totalBilling) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-[11px]">
                <span>Posted</span>
                <span>${totalPosted.toFixed(0)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-tp-pastel-blue"
                  style={{
                    width: `${(totalPosted / billingSummary.totalBilling) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-[11px]">
                <span>Paid</span>
                <span>${totalPaid.toFixed(0)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-tp-pastel-green"
                  style={{
                    width: `${(totalPaid / billingSummary.totalBilling) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Billing details table */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Billing details
            </h2>
            <span className="text-[11px] text-slate-500">
              Campaign-level billing entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <ReportTable>
              <ReportTableHead>
                <ReportTableRow>
                  <ReportTableHeaderCell label="Billing ID" />
                  <ReportTableHeaderCell label="Campaign" />
                  <ReportTableHeaderCell label="Store" />
                  <ReportTableHeaderCell label="Channel" />
                  <ReportTableHeaderCell label="Amount" align="right" />
                  <ReportTableHeaderCell label="Status" />
                  <ReportTableHeaderCell label="Billing date" />
                </ReportTableRow>
              </ReportTableHead>
              <ReportTableBody>
                {billingRows.map((b) => (
                  <ReportTableRow key={b.billingId}>
                    <ReportTableCell className="text-slate-800">{b.billingId}</ReportTableCell>
                    <ReportTableCell className="text-slate-700">{b.campaignName}</ReportTableCell>
                    <ReportTableCell className="text-slate-700">{b.storeName}</ReportTableCell>
                    <ReportTableCell className="text-slate-600">{b.channel}</ReportTableCell>
                    <ReportTableCell align="right">${b.amount.toFixed(0)}</ReportTableCell>
                    <ReportTableCell className="text-slate-600">{b.status}</ReportTableCell>
                    <ReportTableCell className="text-slate-600">{b.billingDate}</ReportTableCell>
                  </ReportTableRow>
                ))}
              </ReportTableBody>
            </ReportTable>
          </div>
        </section>
      </ReportPageLayout>
    </ShellLayout>
  );
};

export default BillingCampaignTrackingPage;
