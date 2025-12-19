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

type EmailCaptureSummary = {
  totalCustomers: number;
  withEmail: number;
  validEmail: number;
  bouncedEmail: number;
  optedOut: number;
};

type EmailCaptureRow = {
  storeName: string;
  customers: number;
  validEmails: number;
  captureRate: number; // %
};

const emailSummary: EmailCaptureSummary = {
  totalCustomers: 18500,
  withEmail: 14200,
  validEmail: 13400,
  bouncedEmail: 800,
  optedOut: 920,
};

const emailRows: EmailCaptureRow[] = [
  {
    storeName: "Vallejo, CA",
    customers: 5200,
    validEmails: 4100,
    captureRate: 78.8,
  },
  {
    storeName: "Napa, CA",
    customers: 4200,
    validEmails: 3400,
    captureRate: 81.0,
  },
  {
    storeName: "Fairfield, CA",
    customers: 3100,
    validEmails: 2320,
    captureRate: 74.8,
  },
  {
    storeName: "Vacaville, CA",
    customers: 4000,
    validEmails: 3580,
    captureRate: 89.5,
  },
];

const KPI_OPTIONS: KpiOption[] = [
  { id: "totalCustomers", label: "Total customers" },
  { id: "withEmail", label: "With email on file" },
  { id: "validCapture", label: "Valid email capture" },
  { id: "bounced", label: "Bounced emails" },
  { id: "optedOut", label: "Opted-out" },
];

const ValidEmailCapturePage: React.FC = () => {
  const [insights, setInsights] = useState<string[]>([
    "Overall email capture is strong, but a few stores lag behind the group.",
    "Reducing bounce volume will immediately improve deliverability and ROI on email-heavy campaigns.",
    "Opt-out counts are within a normal range given total volume.",
  ]);

  const overallCaptureRate = useMemo(
    () => (emailSummary.validEmail / emailSummary.totalCustomers) * 100,
    []
  );

  const maxCaptureRate = useMemo(
    () => Math.max(...emailRows.map((r) => r.captureRate), 1),
    []
  );

  const { selectedIds, setSelectedIds } = useKpiPreferences("valid-email-capture", KPI_OPTIONS);

  const renderKpiTile = (id: string) => {
    switch (id) {
      case "totalCustomers": return <MetricTile key={id} label="Total customers" value={emailSummary.totalCustomers.toLocaleString()} helpText="Total unique customers in the database across all locations. This is the base population for email capture rate calculations." />;
      case "withEmail": return <MetricTile key={id} label="With email on file" value={emailSummary.withEmail.toLocaleString()} helpText="Number of customers with any email address on file, including bounced or invalid addresses. Compare to valid count to see quality gap." />;
      case "validCapture": return <MetricTile key={id} label="Valid email capture" value={`${overallCaptureRate.toFixed(1)}%`} helper={`${emailSummary.validEmail.toLocaleString()} valid`} helpText="Percentage of customers with a verified, deliverable email address. Higher rates improve email campaign reach and reduce waste." />;
      case "bounced": return <MetricTile key={id} label="Bounced emails" value={emailSummary.bouncedEmail.toLocaleString()} helpText="Number of email addresses that bounced and are undeliverable. High bounce counts hurt sender reputation and should be cleaned regularly." />;
      case "optedOut": return <MetricTile key={id} label="Opted-out" value={emailSummary.optedOut.toLocaleString()} helpText="Number of customers who opted out of email communications. This count is excluded from email campaigns per compliance requirements." />;
      default: return null;
    }
  };

  const regenerateInsights = () => {
    const worstStore = emailRows.reduce((worst, r) =>
      !worst || r.captureRate < worst.captureRate ? r : worst
    );
    setInsights([
      `Overall valid email capture is ${overallCaptureRate.toFixed(
        1
      )}% across the account.`,
      `"${worstStore.storeName}" has the lowest capture rate (${worstStore.captureRate.toFixed(
        1
      )}%) and is a good target for staff training.`,
      "Consider tablet or QR-based capture at checkout to boost valid emails without slowing the lane.",
    ]);
  };

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "Valid Email Capture" },
      ]}
      rightInfo={
        <>
          <span>
            Customers:{" "}
            <span className="font-medium">
              {emailSummary.totalCustomers.toLocaleString()}
            </span>
          </span>
        </>
      }
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Valid Email Capture
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track email capture and validity so that lifecycle and campaign
            reports reflect real reachable customers.
          </p>
        </div>
        <KpiCustomizeButton
          reportId="valid-email-capture"
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
              reportKey="valid-email-capture"
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
            subtitle="Based on email capture & deliverability"
            bullets={insights}
            onRefresh={regenerateInsights}
          />
        }
      >
        {/* Capture rate by store */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Capture rate by store
            </h2>
            <span className="text-[11px] text-slate-500">
              Valid email % by location
            </span>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            {emailRows.map((r) => (
              <div key={r.storeName}>
                <div className="flex justify-between text-[11px]">
                  <span>{r.storeName}</span>
                  <span>{r.captureRate.toFixed(1)}% valid</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-tp-pastel-green"
                      style={{
                        width: `${(r.captureRate / maxCaptureRate) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 w-40 text-right">
                    {r.validEmails.toLocaleString()} valid of{" "}
                    {r.customers.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Table */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Email capture details
            </h2>
            <span className="text-[11px] text-slate-500">
              Valid email rate by store
            </span>
          </div>
          <div className="overflow-x-auto">
            <ReportTable>
              <ReportTableHead>
                <ReportTableRow>
                  <ReportTableHeaderCell label="Store" />
                  <ReportTableHeaderCell label="Customers" align="right" />
                  <ReportTableHeaderCell label="Valid emails" align="right" />
                  <ReportTableHeaderCell label="Capture %" align="right" />
                </ReportTableRow>
              </ReportTableHead>
              <ReportTableBody>
                {emailRows.map((r) => (
                  <ReportTableRow key={r.storeName}>
                    <ReportTableCell className="text-slate-800">{r.storeName}</ReportTableCell>
                    <ReportTableCell align="right">{r.customers.toLocaleString()}</ReportTableCell>
                    <ReportTableCell align="right">{r.validEmails.toLocaleString()}</ReportTableCell>
                    <ReportTableCell align="right">{r.captureRate.toFixed(1)}%</ReportTableCell>
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

export default ValidEmailCapturePage;
