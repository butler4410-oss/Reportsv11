import React, { useState, useMemo } from "react";
import { ShellLayout, SummaryTile, BarStack, MetricTile, AIInsightsTile, KpiCustomizeButton, DraggableKpiRow, ReportPageLayout } from "@/components/layout";
import { useKpiPreferences, KpiOption } from "@/hooks/useKpiPreferences";

type CostProjectionSummary = {
  storeGroupName: string;
  periodLabel: string;
  monthlyCost: number;
  projectedVehicles: number;
  projectedRevenue: number;
};

type CostProjectionStep = {
  name: string;
  channel: string;
  estCost: number;
  estVehicles: number;
  estRevenue: number;
};

const costSummary: CostProjectionSummary = {
  storeGroupName: "North Bay Group",
  periodLabel: "Next 30 days",
  monthlyCost: 12800,
  projectedVehicles: 520,
  projectedRevenue: 186000,
};

const costSteps: CostProjectionStep[] = [
  {
    name: "Reminder 1 postcard",
    channel: "Postcard",
    estCost: 8200,
    estVehicles: 280,
    estRevenue: 98000,
  },
  {
    name: "Reminder 1 email + SMS",
    channel: "Email + SMS",
    estCost: 1400,
    estVehicles: 110,
    estRevenue: 32000,
  },
  {
    name: "Reminder 2 postcard",
    channel: "Postcard",
    estCost: 2600,
    estVehicles: 82,
    estRevenue: 34000,
  },
  {
    name: "Reactivation 12 months",
    channel: "Email",
    estCost: 600,
    estVehicles: 48,
    estRevenue: 22000,
  },
];

const KPI_OPTIONS: KpiOption[] = [
  { id: "projectedVehicles", label: "Projected vehicles" },
  { id: "projectedRoas", label: "Projected ROAS" },
  { id: "postcardHeavy", label: "Postcard-heavy?" },
  { id: "emailSmsCost", label: "Email/SMS cost" },
  { id: "scenario", label: "Scenario" },
];

const CostProjectionsPage: React.FC = () => {
  const [insights, setInsights] = useState<string[]>([
    "Most projected spend is in Reminder 1 postcards, which also drive the largest share of vehicles.",
    "Email and SMS steps are low-cost but high-ROAS and should almost always be enabled.",
    "Use this report when planning budgets with owners and vendor partners.",
  ]);

  const overallRoas = useMemo(() => costSummary.projectedRevenue / costSummary.monthlyCost, []);
  const segments = useMemo(() => costSteps.map((s, idx) => ({ label: s.name, value: s.estCost, color: idx === 0 ? "bg-indigo-500" : idx === 1 ? "bg-sky-400" : idx === 2 ? "bg-emerald-400" : "bg-amber-400" })), []);

  const { selectedIds, setSelectedIds } = useKpiPreferences("cost-projections", KPI_OPTIONS);

  const renderKpiTile = (id: string) => {
    switch (id) {
      case "projectedVehicles": return <MetricTile key={id} label="Projected vehicles" value={costSummary.projectedVehicles.toString()} helpText="Estimated number of vehicles expected to respond to journey campaigns this period. Projections are based on historical response rates and current customer counts." />;
      case "projectedRoas": return <MetricTile key={id} label="Projected ROAS" value={`${overallRoas.toFixed(1)}x`} helpText="Expected return on ad spend based on projected revenue and costs. Use this to validate budget allocations before the period begins." />;
      case "postcardHeavy": return <MetricTile key={id} label="Postcard-heavy?" value="Yes" helper="Most cost is postcards" helpText="Indicates whether the majority of projected spend is allocated to postcards. Postcard-heavy mixes have higher costs but often stronger response rates." />;
      case "emailSmsCost": return <MetricTile key={id} label="Email/SMS cost" value="Low" helper="High ROAS potential" helpText="Relative cost level for email and SMS channels in the journey. These low-cost channels typically deliver the highest ROAS." />;
      case "scenario": return <MetricTile key={id} label="Scenario" value="Standard" helper="Demo only" helpText="Budget scenario used for this projection such as standard, aggressive, or conservative. Change scenarios to model different spend levels." />;
      default: return null;
    }
  };

  const regenerateInsights = () => {
    const best = costSteps.reduce((b, s) =>
      !b || s.estRevenue / s.estCost > b.estRevenue / b.estCost ? s : b
    );
    setInsights([
      `Projected ROAS for the journey is about ${overallRoas.toFixed(
        1
      )}x this month.`,
      `"${best.name}" currently has the highest projected ROAS among journey steps.`,
      "If budget is constrained, reduce postcard volume before cutting low-cost email/SMS touches.",
    ]);
  };

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "Cost Projections" },
      ]}
      rightInfo={
        <>
          <span>
            Group:{" "}
            <span className="font-medium">{costSummary.storeGroupName}</span>
          </span>
          <span>
            Period:{" "}
            <span className="font-medium">{costSummary.periodLabel}</span>
          </span>
        </>
      }
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Cost Projections (Journey)
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Forecast journey step costs, expected vehicles and projected ROAS for
            planning and budgeting.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SummaryTile
            label="Projected monthly cost"
            value={`$${costSummary.monthlyCost.toLocaleString()}`}
          />
          <SummaryTile
            label="Projected revenue"
            value={`$${costSummary.projectedRevenue.toLocaleString()}`}
          />
          <KpiCustomizeButton
            reportId="cost-projections"
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
              reportKey="cost-projections"
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
            subtitle="Based on cost projection data"
            bullets={insights}
            onRefresh={regenerateInsights}
          />
        }
      >
        {/* Cost mix */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Journey cost mix
            </h2>
            <span className="text-[11px] text-slate-500">
              Share of projected cost by step
            </span>
          </div>
          <BarStack segments={segments} />
        </section>

        {/* Step details */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Step projections
            </h2>
            <span className="text-[11px] text-slate-500">
              Est. cost, vehicles & revenue
            </span>
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            {costSteps.map((s) => {
              const roas = s.estRevenue / s.estCost;
              return (
                <div key={s.name} className="border-b border-slate-100 pb-1 last:border-0">
                  <div className="flex justify-between">
                    <span>{s.name}</span>
                    <span>{s.channel}</span>
                  </div>
                  <div className="flex justify-between mt-1 text-[11px]">
                    <span>Cost: ${s.estCost.toLocaleString()}</span>
                    <span>Vehicles: {s.estVehicles}</span>
                    <span>ROAS: {roas.toFixed(1)}x</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </ReportPageLayout>
    </ShellLayout>
  );
};

export default CostProjectionsPage;
