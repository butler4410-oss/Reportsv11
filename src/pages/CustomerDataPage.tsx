import React, { useState } from "react";
import { ShellLayout, MetricTile, AIInsightsTile, KpiCustomizeButton, DraggableKpiRow, ReportPageLayout } from "@/components/layout";
import { useKpiPreferences, KpiOption } from "@/hooks/useKpiPreferences";
import { CaptureByLocationTile, CaptureByLocationRow } from "@/components/layout/CaptureByLocationTile";

type CustomerDataSummary = {
  customers: number;
  vehicles: number;
  avgVehiclesPerCustomer: number;
  reachableEmailPct: number;
  reachableMailPct: number;
};

const customerDataSummary: CustomerDataSummary = {
  customers: 18500,
  vehicles: 24600,
  avgVehiclesPerCustomer: 1.33,
  reachableEmailPct: 78,
  reachableMailPct: 86,
};

const MAIL_CAPTURE_ROWS: CaptureByLocationRow[] = [
  { id: "vallejo", name: "Vallejo, CA", capturePct: 75, captureMomPct: 2.1, blankPct: 25, blankMomPct: -1.5, enrichedPct: 12.3 },
  { id: "napa", name: "Napa, CA", capturePct: 67, captureMomPct: -0.5, blankPct: 33, blankMomPct: 0.3, enrichedPct: 8.7 },
  { id: "fairfield", name: "Fairfield, CA", capturePct: 76, captureMomPct: 4.8, blankPct: 24, blankMomPct: -2.1, enrichedPct: 15.2 },
];

const EMAIL_CAPTURE_ROWS: CaptureByLocationRow[] = [
  { id: "vallejo", name: "Vallejo, CA", capturePct: 70, captureMomPct: 0.8, blankPct: 30, blankMomPct: -0.8, enrichedPct: 4.1 },
  { id: "napa", name: "Napa, CA", capturePct: 65, captureMomPct: 1.4, blankPct: 35, blankMomPct: -1.4, enrichedPct: 6.2 },
  { id: "fairfield", name: "Fairfield, CA", capturePct: 74, captureMomPct: -0.2, blankPct: 26, blankMomPct: 0.2, enrichedPct: 3.8 },
];

const KPI_OPTIONS: KpiOption[] = [
  { id: "customers", label: "Customers" },
  { id: "vehicles", label: "Vehicles" },
  { id: "vehiclesPerCustomer", label: "Vehicles / customer" },
  { id: "reachableEmail", label: "Reachable by email" },
  { id: "reachableMail", label: "Reachable by mail" },
];

const CustomerDataPage: React.FC = () => {
  const [insights, setInsights] = useState<string[]>([
    "Most customers have at least one reachable channel, with email capture trailing postal.",
    "Multi-vehicle households are a major driver of LTV and should be prioritized in journey coverage.",
    "Store-level differences in email capture create different marketing leverage.",
  ]);

  const { selectedIds, setSelectedIds } = useKpiPreferences("customer-data", KPI_OPTIONS);

  const renderKpiTile = (id: string) => {
    switch (id) {
      case "customers":
        return <MetricTile key={id} label="Customers" value={customerDataSummary.customers.toLocaleString()} helpText="Total unique customers in the database across all locations. This count includes both active and inactive customer records." />;
      case "vehicles":
        return <MetricTile key={id} label="Vehicles" value={customerDataSummary.vehicles.toLocaleString()} helpText="Total vehicles associated with customer records. Vehicles are the primary unit for journey targeting and service reminders." />;
      case "vehiclesPerCustomer":
        return <MetricTile key={id} label="Vehicles / customer" value={customerDataSummary.avgVehiclesPerCustomer.toFixed(2)} helpText="Average number of vehicles per customer household. Higher ratios indicate multi-vehicle households with greater lifetime value (LTV) potential." />;
      case "reachableEmail":
        return <MetricTile key={id} label="Reachable by email" value={`${customerDataSummary.reachableEmailPct.toFixed(0)}%`} helpText="Percentage of customers with a valid email address on file. Email is typically the most cost-effective channel for regular communications." />;
      case "reachableMail":
        return <MetricTile key={id} label="Reachable by mail" value={`${customerDataSummary.reachableMailPct.toFixed(0)}%`} helpText="Percentage of customers with a valid mailing address on file. Mail is essential for postcard-based reminders and high-impact campaigns." />;
      default:
        return null;
    }
  };

  const regenerateInsights = () => {
    const worstEmailStore = EMAIL_CAPTURE_ROWS.reduce((worst, r) =>
      !worst || r.capturePct < worst.capturePct ? r : worst
    );
    setInsights([
      `Average vehicles per customer is ${customerDataSummary.avgVehiclesPerCustomer.toFixed(
        2
      )}, which is strong for quick lube.`,
      `"${worstEmailStore.name}" has the weakest email capture (${worstEmailStore.capturePct.toFixed(
        1
      )}%), making it a focus for data capture improvements.`,
      "Use this report with Valid Email Capture and Valid Address Report to prioritize data cleanup projects.",
    ]);
  };

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "Customer Data" },
      ]}
      rightInfo={
        <>
          <span>
            Customers:{" "}
            <span className="font-medium">
              {customerDataSummary.customers.toLocaleString()}
            </span>
          </span>
        </>
      }
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Customer Data
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Customer/vehicle roster with visits, lifetime value (LTV) and
            contactability by channel.
          </p>
        </div>
        <KpiCustomizeButton
          reportId="customer-data"
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
              reportKey="customer-data"
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
            subtitle="Based on customer & contactability data"
            bullets={insights}
            onRefresh={regenerateInsights}
          />
        }
      >
        {/* Mail capture by location */}
        <CaptureByLocationTile
          title="Mail capture by location"
          channelLabel="Mail"
          rows={MAIL_CAPTURE_ROWS}
        />

        {/* Email capture by location */}
        <CaptureByLocationTile
          title="Email capture by location"
          channelLabel="Email"
          rows={EMAIL_CAPTURE_ROWS}
        />
      </ReportPageLayout>
    </ShellLayout>
  );
};

export default CustomerDataPage;
