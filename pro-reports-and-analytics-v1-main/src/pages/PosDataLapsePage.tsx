import React, { useMemo, useState } from "react";
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

type PosLapseRow = {
  storeName: string;
  lastPosDate: string;
  daysSince: number;
};

const posLapseRows: PosLapseRow[] = [
  { storeName: "Vallejo, CA", lastPosDate: "2024-12-05", daysSince: 1 },
  { storeName: "Napa, CA", lastPosDate: "2024-12-05", daysSince: 1 },
  { storeName: "Fairfield, CA", lastPosDate: "2024-12-02", daysSince: 4 },
  { storeName: "Vacaville, CA", lastPosDate: "2024-11-27", daysSince: 9 },
];

const KPI_OPTIONS: KpiOption[] = [
  { id: "totalStores", label: "Total stores" },
  { id: "zeroTwo", label: "0–2 days" },
  { id: "threeSeven", label: "3–7 days" },
  { id: "overSeven", label: "> 7 days" },
];

const PosDataLapsePage: React.FC = () => {
  const [insights, setInsights] = useState<string[]>([
    "Most stores are sending POS data within the last 1–2 days.",
    "A small number of locations are approaching or exceeding the 7-day lapse threshold.",
    "Data lapses can cause under-reporting in all other reports, so they should be handled quickly.",
  ]);

  const maxDays = useMemo(
    () => Math.max(...posLapseRows.map((r) => r.daysSince), 1),
    []
  );

  const { selectedIds, setSelectedIds } = useKpiPreferences("pos-data-lapse", KPI_OPTIONS);

  const renderKpiTile = (id: string) => {
    switch (id) {
      case "totalStores":
        return <MetricTile key={id} label="Total stores" value="4" helpText="Total number of store locations in the account. All stores should be sending regular POS data for accurate reporting." />;
      case "zeroTwo":
        return <MetricTile key={id} label="0–2 days" value="2" helpText="Stores with POS data received within the last 0–2 days. These stores are healthy and data is current for journey and reporting purposes." />;
      case "threeSeven":
        return <MetricTile key={id} label="3–7 days" value="1" helpText="Stores with POS data 3–7 days old and needing attention. Check connectivity and export schedules to prevent data gaps." />;
      case "overSeven":
        return <MetricTile key={id} label="> 7 days" value="1" helpText="Stores with POS data over 7 days old requiring immediate investigation. Extended lapses affect journey accuracy and reporting reliability." />;
      default:
        return null;
    }
  };

  const regenerateInsights = () => {
    const worst = posLapseRows.reduce((worst, r) =>
      !worst || r.daysSince > worst.daysSince ? r : worst
    );
    setInsights([
      `"${worst.storeName}" has the oldest POS file (${worst.daysSince} days since last data).`,
      "Investigate POS export / SFTP connectivity for any stores over 3 days.",
      "Use this report in weekly ops huddles to confirm the data foundation before reviewing marketing results.",
    ]);
  };

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "POS Data Lapses" },
      ]}
      rightInfo={
        <>
          <span>
            Stores:{" "}
            <span className="font-medium">
              {posLapseRows.length.toString()}
            </span>
          </span>
        </>
      }
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            POS Data Lapses
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor the freshness of POS files by store so reporting and
            journeys stay accurate.
          </p>
        </div>
        <KpiCustomizeButton
          reportId="pos-data-lapse"
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
              reportKey="pos-data-lapse"
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
            subtitle="Based on POS file freshness"
            bullets={insights}
            onRefresh={regenerateInsights}
          />
        }
      >
        {/* Bars by store */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Days since last POS file
            </h2>
            <span className="text-[11px] text-slate-500">
              Threshold: 3 days (warning), 7 days (critical)
            </span>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            {posLapseRows.map((r) => (
              <div key={r.storeName}>
                <div className="flex justify-between text-[11px]">
                  <span>{r.storeName}</span>
                  <span>{r.daysSince} days</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-tp-pastel-green"
                      style={{
                        width: `${(r.daysSince / maxDays) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 w-32 text-right">
                    Last file {r.lastPosDate}
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
              Store details
            </h2>
            <span className="text-[11px] text-slate-500">
              Last POS date by store
            </span>
          </div>
          <div className="overflow-x-auto">
            <ReportTable>
              <ReportTableHead>
                <ReportTableRow>
                  <ReportTableHeaderCell label="Store" />
                  <ReportTableHeaderCell label="Last POS date" />
                  <ReportTableHeaderCell label="Days since" align="right" />
                </ReportTableRow>
              </ReportTableHead>
              <ReportTableBody>
                {posLapseRows.map((r) => (
                  <ReportTableRow key={r.storeName}>
                    <ReportTableCell className="text-slate-800">{r.storeName}</ReportTableCell>
                    <ReportTableCell className="text-slate-700">{r.lastPosDate}</ReportTableCell>
                    <ReportTableCell align="right">{r.daysSince}</ReportTableCell>
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

export default PosDataLapsePage;
