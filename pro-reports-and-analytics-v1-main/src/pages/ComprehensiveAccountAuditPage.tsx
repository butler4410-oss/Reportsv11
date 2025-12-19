import React, { useState } from "react";
import { ShellLayout, SummaryTile, MetricTile, AIInsightsTile, KpiCustomizeButton, DraggableKpiRow, ReportPageLayout } from "@/components/layout";
import { useKpiPreferences, KpiOption } from "@/hooks/useKpiPreferences";
import {
  ReportTable,
  ReportTableHead,
  ReportTableBody,
  ReportTableRow,
  ReportTableHeaderCell,
  ReportTableCell,
} from "@/components/ui/report-table";

type AuditSummary = {
  accountName: string;
  score: number;
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  failedChecks: number;
};

type AuditRow = {
  area: string;
  check: string;
  status: "Pass" | "Warning" | "Fail";
  notes: string;
};

const auditSummary: AuditSummary = {
  accountName: "North Bay Group",
  score: 92,
  totalChecks: 24,
  passedChecks: 19,
  warningChecks: 4,
  failedChecks: 1,
};

const auditRows: AuditRow[] = [
  {
    area: "Intervals",
    check: "Oil interval aligned to store policy",
    status: "Pass",
    notes: "5,000 miles or 6 months for conventional, 7,500 for synthetic.",
  },
  {
    area: "Data",
    check: "POS data ingested in last 48 hours",
    status: "Pass",
    notes: "All stores current.",
  },
  {
    area: "Branding",
    check: "Logo and color scheme configured",
    status: "Pass",
    notes: "Custom template live.",
  },
  {
    area: "Journeys",
    check: "Reactivation step configured for 12+ months",
    status: "Warning",
    notes: "Enabled, but targeting rules are broad.",
  },
  {
    area: "Journeys",
    check: "Multi-channel reminders (postcard + email + SMS)",
    status: "Pass",
    notes: "Standard Throttle configuration.",
  },
  {
    area: "Compliance",
    check: "SMS consent settings configured",
    status: "Warning",
    notes: "Consent texts present; recommend periodic review.",
  },
  {
    area: "Billing",
    check: "Account has current billing info",
    status: "Pass",
    notes: "Card on file valid.",
  },
  {
    area: "Data",
    check: "Bad address rate < 10%",
    status: "Fail",
    notes: "Currently ~13%; recommend address cleanup.",
  },
];

const KPI_OPTIONS: KpiOption[] = [
  { id: "checksPassed", label: "Checks passed" },
  { id: "warnings", label: "Warnings" },
  { id: "failures", label: "Failures" },
  { id: "totalChecks", label: "Total checks" },
  { id: "priorityArea", label: "Priority area" },
];

const ComprehensiveAccountAuditPage: React.FC = () => {
  const [insights, setInsights] = useState<string[]>([
    "Overall audit score is strong at 92/100.",
    "The main area of risk is data quality (bad addresses above 10%).",
    "Journeys and compliance are mostly solid but have a few improvement opportunities.",
  ]);

  const { selectedIds, setSelectedIds } = useKpiPreferences("comprehensive-account-audit", KPI_OPTIONS);

  const renderKpiTile = (id: string) => {
    switch (id) {
      case "checksPassed": return <MetricTile key={id} label="Checks passed" value={auditSummary.passedChecks.toString()} helpText="Number of audit checks that passed without issues. Passed checks indicate areas where the account is performing well." />;
      case "warnings": return <MetricTile key={id} label="Warnings" value={auditSummary.warningChecks.toString()} helpText="Number of audit checks that need attention but aren't critical. Address warnings to prevent them from becoming failures." />;
      case "failures": return <MetricTile key={id} label="Failures" value={auditSummary.failedChecks.toString()} helpText="Number of audit checks that failed and require immediate action. Failures often affect deliverability, compliance, or data quality." />;
      case "totalChecks": return <MetricTile key={id} label="Total checks" value={auditSummary.totalChecks.toString()} helpText="Total number of audit checks performed on the account. This includes data quality, journey health, and compliance validations." />;
      case "priorityArea": return <MetricTile key={id} label="Priority area" value="Data quality" helper="Bad address rate high" helpText="The area requiring the most attention based on audit findings. Focus improvement efforts here for maximum impact." />;
      default: return null;
    }
  };

  const regenerateInsights = () => {
    setInsights([
      `This account passed ${auditSummary.passedChecks} of ${auditSummary.totalChecks} checks, with ${auditSummary.warningChecks} warning(s) and ${auditSummary.failedChecks} failure(s).`,
      "Prioritize data quality and compliance warnings first, since those affect deliverability and risk.",
      "Use this report in quarterly business reviews with owners and larger groups.",
    ]);
  };

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "Comprehensive Account Audit" },
      ]}
      rightInfo={
        <>
          <span>
            Account:{" "}
            <span className="font-medium">{auditSummary.accountName}</span>
          </span>
        </>
      }
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Comprehensive Account Audit
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configuration, data health and compliance checks for this account.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SummaryTile
            label="Audit score"
            value={`${auditSummary.score}/100`}
          />
          <KpiCustomizeButton
            reportId="comprehensive-account-audit"
            options={KPI_OPTIONS}
            selectedIds={selectedIds}
            onChangeSelected={setSelectedIds}
          />
        </div>
      </div>

      {/* Main content using ReportPageLayout */}
      <ReportPageLayout
        kpis={
          selectedIds.length > 0 ? (
            <DraggableKpiRow
              reportKey="comprehensive-account-audit"
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
            subtitle="Based on audit results"
            bullets={insights}
            onRefresh={regenerateInsights}
          />
        }
      >
        {/* Table */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Audit checks
            </h2>
            <span className="text-[11px] text-slate-500">
              Detailed pass/warn/fail by area
            </span>
          </div>
          <div className="overflow-x-auto">
            <ReportTable>
              <ReportTableHead>
                <ReportTableRow>
                  <ReportTableHeaderCell label="Area" />
                  <ReportTableHeaderCell label="Check" />
                  <ReportTableHeaderCell label="Status" />
                  <ReportTableHeaderCell label="Notes" />
                </ReportTableRow>
              </ReportTableHead>
              <ReportTableBody>
                {auditRows.map((row, idx) => (
                  <ReportTableRow key={idx}>
                    <ReportTableCell className="text-slate-800">{row.area}</ReportTableCell>
                    <ReportTableCell className="text-slate-600">{row.check}</ReportTableCell>
                    <ReportTableCell className="text-slate-600">{row.status}</ReportTableCell>
                    <ReportTableCell className="text-slate-600">{row.notes}</ReportTableCell>
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

export default ComprehensiveAccountAuditPage;
