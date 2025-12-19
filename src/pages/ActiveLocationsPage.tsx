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

type ActiveLocationSummary = {
  groupName: string;
  activeCount: number;
  launchingCount: number;
  pausedCount: number;
  suspendedCount: number;
};

type ActiveLocationRow = {
  storeName: string;
  throttleId: string;
  city: string;
  state: string;
  status: "Active" | "Launching" | "Paused" | "Suspended";
  openDate: string;
  lastPosDate: string;
};

const activeLocationSummary: ActiveLocationSummary = {
  groupName: "North Bay Group",
  activeCount: 28,
  launchingCount: 2,
  pausedCount: 1,
  suspendedCount: 0,
};

const activeLocationRows: ActiveLocationRow[] = [
  {
    storeName: "Vallejo, CA",
    throttleId: "S17040",
    city: "Vallejo",
    state: "CA",
    status: "Active",
    openDate: "2019-03-14",
    lastPosDate: "2024-12-04",
  },
  {
    storeName: "Napa, CA",
    throttleId: "S18021",
    city: "Napa",
    state: "CA",
    status: "Active",
    openDate: "2020-06-01",
    lastPosDate: "2024-12-04",
  },
  {
    storeName: "Fairfield, CA",
    throttleId: "S19012",
    city: "Fairfield",
    state: "CA",
    status: "Launching",
    openDate: "2024-12-20",
    lastPosDate: "-",
  },
];

const KPI_OPTIONS: KpiOption[] = [
  { id: "active", label: "Active" },
  { id: "launching", label: "Launching" },
  { id: "paused", label: "Paused" },
  { id: "suspended", label: "Suspended" },
  { id: "dataFreshness", label: "Data freshness" },
];

const ActiveLocationsPage: React.FC = () => {
  const [insights, setInsights] = useState<string[]>([
    "Most locations are active with current POS data; only one site is still in launch status.",
    "Use this view as an at-a-glance source of truth for which locations are live in Throttle Pro.",
    "Launching locations should be watched closely for POS connectivity before campaigns go live.",
  ]);

  const totalLocations = activeLocationSummary.activeCount + activeLocationSummary.launchingCount + activeLocationSummary.pausedCount + activeLocationSummary.suspendedCount;

  const { selectedIds, setSelectedIds } = useKpiPreferences("active-locations", KPI_OPTIONS);

  const renderKpiTile = (id: string) => {
    switch (id) {
      case "active": return <MetricTile key={id} label="Active" value={activeLocationSummary.activeCount.toString()} helpText="Locations fully live in Throttle Pro with campaigns running. These stores are receiving journey communications and generating reports." />;
      case "launching": return <MetricTile key={id} label="Launching" value={activeLocationSummary.launchingCount.toString()} helpText="Locations in onboarding phase, not yet fully active. Verify POS data is flowing before enabling all journey touch points." />;
      case "paused": return <MetricTile key={id} label="Paused" value={activeLocationSummary.pausedCount.toString()} helpText="Locations temporarily paused from campaigns, such as seasonal closures. Paused stores are excluded from billing and sends until reactivated." />;
      case "suspended": return <MetricTile key={id} label="Suspended" value={activeLocationSummary.suspendedCount.toString()} helpText="Locations suspended from Throttle Pro due to billing or other issues. Contact support to resolve suspension and restore service." />;
      case "dataFreshness": return <MetricTile key={id} label="Data freshness" value="Good" helper="Most stores sending POS data" helpText="Overall status of POS data ingestion across all locations. Good freshness means journeys and reports reflect recent activity." />;
      default: return null;
    }
  };

  const regenerateInsights = () => {
    setInsights([
      `${activeLocationSummary.activeCount} of ${totalLocations} locations are fully active in Throttle Pro.`,
      `${activeLocationSummary.launchingCount} location(s) are currently in launch; ensure POS data is flowing before enabling all journeys.`,
      "Paused or suspended locations should be excluded from campaigns and billing automatically.",
    ]);
  };

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "Active Locations" },
      ]}
      rightInfo={
        <>
          <span>
            Group:{" "}
            <span className="font-medium">
              {activeLocationSummary.groupName}
            </span>
          </span>
        </>
      }
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Active Locations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A source-of-truth roster of which stores are live, launching, paused
            or suspended in Throttle Pro.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SummaryTile
            label="Total locations"
            value={totalLocations.toString()}
          />
          <KpiCustomizeButton
            reportId="active-locations"
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
              reportKey="active-locations"
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
            subtitle="Based on location status data"
            bullets={insights}
            onRefresh={regenerateInsights}
          />
        }
      >
        {/* Table */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Locations roster
            </h2>
            <span className="text-[11px] text-slate-500">
              Status and POS freshness by store (dummy data)
            </span>
          </div>
          <div className="overflow-x-auto">
            <ReportTable>
              <ReportTableHead>
                <ReportTableRow>
                  <ReportTableHeaderCell label="Store" />
                  <ReportTableHeaderCell label="Throttle ID" />
                  <ReportTableHeaderCell label="City" />
                  <ReportTableHeaderCell label="State" />
                  <ReportTableHeaderCell label="Status" />
                  <ReportTableHeaderCell label="Open date" />
                  <ReportTableHeaderCell label="Last POS date" />
                </ReportTableRow>
              </ReportTableHead>
              <ReportTableBody>
                {activeLocationRows.map((row) => (
                  <ReportTableRow key={row.throttleId}>
                    <ReportTableCell className="text-slate-800">{row.storeName}</ReportTableCell>
                    <ReportTableCell className="text-slate-600">{row.throttleId}</ReportTableCell>
                    <ReportTableCell className="text-slate-600">{row.city}</ReportTableCell>
                    <ReportTableCell className="text-slate-600">{row.state}</ReportTableCell>
                    <ReportTableCell className="text-slate-600">{row.status}</ReportTableCell>
                    <ReportTableCell className="text-slate-600">{row.openDate}</ReportTableCell>
                    <ReportTableCell className="text-slate-600">{row.lastPosDate}</ReportTableCell>
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

export default ActiveLocationsPage;
