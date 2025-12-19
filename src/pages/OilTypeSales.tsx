import React, { useState } from "react";
import {
  ShellLayout,
  AIInsightsTile,
  KpiCustomizeButton,
  DraggableKpiRow,
  ReportPageLayout,
} from "@/components/layout";
import OilTypeMixSection from "@/components/reports/OilTypeMixSection";
import OilTypeUsageKpis from "@/components/reports/OilTypeUsageKpis";
import OilTypeRevenueDetailsTable from "@/components/reports/OilTypeRevenueDetailsTable";
import OilTypeInvoiceDetailTile from "@/components/reports/OilTypeInvoiceDetailTile";
import { useKpiPreferences } from "@/hooks/useKpiPreferences";

type OilMixSummary = {
  periodLabel: string;
};

const oilMixSummary: OilMixSummary = {
  periodLabel: "Last 90 days",
};

const KPI_OPTIONS = [
  { id: "conventional", label: "Conventional" },
  { id: "synBlend", label: "Synthetic Blend" },
  { id: "fullSyn", label: "Full Synthetic" },
  { id: "highMileage", label: "High Mileage" },
  { id: "unclassified", label: "Unclassified" },
];

const OilTypeSalesPage: React.FC = () => {
  const { selectedIds, setSelectedIds } = useKpiPreferences("oil-type-sales", KPI_OPTIONS);
  
  const [insights, setInsights] = useState<string[]>([
    "Synthetic and high mileage oils now account for the majority of oil change revenue.",
    "Conventional still represents a large number of visits but at a lower average ticket.",
    "Moving a small share of conventional customers into synthetic can significantly increase revenue.",
  ]);

  const regenerateInsights = () => {
    setInsights([
      "Full Syn has the highest average ticket at $99.",
      "Use Suggested Services and SS videos to educate customers on benefits of upgraded oils.",
      "Pair this report with Oil Type – Invoices to show vendors invoice-level proof of premium mix.",
    ]);
  };

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "Oil Type Sales" },
      ]}
      rightInfo={<span>Period: <span className="font-medium">{oilMixSummary.periodLabel}</span></span>}
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Oil Type Sales</h1>
          <p className="mt-1 text-sm text-slate-500">Volume and revenue mix across conventional, blend, synthetic and high mileage oils.</p>
        </div>
        <KpiCustomizeButton
          reportId="oil-type-sales"
          options={KPI_OPTIONS}
          selectedIds={selectedIds}
          onChangeSelected={setSelectedIds}
        />
      </div>

      {/* Main content using ReportPageLayout */}
      <ReportPageLayout
        kpis={
          selectedIds.length > 0 ? (
            <OilTypeUsageKpis selectedIds={selectedIds} />
          ) : null
        }
        ai={
          <AIInsightsTile title="AI Insights" subtitle="Based on oil mix & revenue" bullets={insights} onRefresh={regenerateInsights} />
        }
      >
        <OilTypeMixSection />
        <OilTypeRevenueDetailsTable />
        <OilTypeInvoiceDetailTile />
      </ReportPageLayout>
    </ShellLayout>
  );
};

export default OilTypeSalesPage;
