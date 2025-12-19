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

type ProductSalesSummary = {
  periodLabel: string;
  totalRevenue: number;
  vendorSharePct: number;
  houseBrandSharePct: number;
};

type ProductVendorRow = {
  vendor: string;
  revenue: number;
  invoices: number;
};

const productSalesSummary: ProductSalesSummary = {
  periodLabel: "Last 90 days",
  totalRevenue: 284600,
  vendorSharePct: 58,
  houseBrandSharePct: 42,
};

const productVendors: ProductVendorRow[] = [
  { vendor: "Royal Purple", revenue: 91200, invoices: 820 },
  { vendor: "Service Pro", revenue: 68400, invoices: 620 },
  { vendor: "House Brand", revenue: 124000, invoices: 1480 },
];

const KPI_OPTIONS: KpiOption[] = [
  { id: "productRevenue", label: "Product revenue" },
  { id: "vendorShare", label: "Vendor share" },
  { id: "houseBrandShare", label: "House brand share" },
];

const ProductSalesPage: React.FC = () => {
  const [insights, setInsights] = useState<string[]>([
    "Vendor-branded products account for more than half of product revenue.",
    "House brand products still represent a large share of tickets and margin.",
    "Use this report with Oil Type – Invoices for vendor meetings and co-op justification.",
  ]);

  const maxRevenue = useMemo(
    () => Math.max(...productVendors.map((v) => v.revenue), 1),
    []
  );

  const { selectedIds, setSelectedIds } = useKpiPreferences("product-sales", KPI_OPTIONS);

  const renderKpiTile = (id: string) => {
    switch (id) {
      case "productRevenue":
        return <MetricTile key={id} label="Product revenue" value={`$${productSalesSummary.totalRevenue.toLocaleString()}`} helpText="Total revenue from product sales during the selected period. This includes all vendor and house brand products sold." />;
      case "vendorShare":
        return <MetricTile key={id} label="Vendor share" value={`${productSalesSummary.vendorSharePct.toFixed(0)}%`} helpText="Percentage of product revenue from vendor-branded products. Higher vendor share may indicate stronger partner relationships and co-marketing opportunities." />;
      case "houseBrandShare":
        return <MetricTile key={id} label="House brand share" value={`${productSalesSummary.houseBrandSharePct.toFixed(0)}%`} helpText="Percentage of product revenue from store house brand products. House brands typically have higher margins but may lack brand recognition." />;
      default:
        return null;
    }
  };

  const regenerateInsights = () => {
    const bestVendor = productVendors.reduce((best, v) =>
      !best || v.revenue > best.revenue ? v : best
    );
    setInsights([
      `"${bestVendor.vendor}" currently has the highest product revenue ($${bestVendor.revenue.toLocaleString()}).`,
      "Target stores with low vendor penetration for training and focused campaigns.",
      "Pair this report with One-Off Campaign Tracker to show how vendor-funded pushes performed.",
    ]);
  };

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "Product Sales" },
      ]}
      rightInfo={
        <>
          <span>
            Period:{" "}
            <span className="font-medium">
              {productSalesSummary.periodLabel}
            </span>
          </span>
        </>
      }
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Product Sales
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monthly revenue and invoices by vendor/product group (e.g. Royal
            Purple, house brand).
          </p>
        </div>
        <KpiCustomizeButton
          reportId="product-sales"
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
              reportKey="product-sales"
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
            subtitle="Based on product & vendor sales"
            bullets={insights}
            onRefresh={regenerateInsights}
          />
        }
      >
        {/* Vendor mix */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Revenue by vendor
            </h2>
            <span className="text-[11px] text-slate-500">
              Compare vendor vs house brand
            </span>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            {productVendors.map((v) => (
              <div key={v.vendor}>
                <div className="flex justify-between text-[11px]">
                  <span>{v.vendor}</span>
                  <span>
                    ${v.revenue.toLocaleString()} ·{" "}
                    {v.invoices.toLocaleString()} invoices
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-tp-pastel-blue"
                      style={{
                        width: `${(v.revenue / maxRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Table */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Vendor details
            </h2>
            <span className="text-[11px] text-slate-500">
              Product revenue and invoices by vendor
            </span>
          </div>
          <div className="overflow-x-auto">
            <ReportTable>
              <ReportTableHead>
                <ReportTableRow>
                  <ReportTableHeaderCell label="Vendor" />
                  <ReportTableHeaderCell label="Invoices" align="right" />
                  <ReportTableHeaderCell label="Revenue" align="right" />
                </ReportTableRow>
              </ReportTableHead>
              <ReportTableBody>
                {productVendors.map((v) => (
                  <ReportTableRow key={v.vendor}>
                    <ReportTableCell className="text-slate-800">{v.vendor}</ReportTableCell>
                    <ReportTableCell align="right">{v.invoices.toLocaleString()}</ReportTableCell>
                    <ReportTableCell align="right">${v.revenue.toLocaleString()}</ReportTableCell>
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

export default ProductSalesPage;
