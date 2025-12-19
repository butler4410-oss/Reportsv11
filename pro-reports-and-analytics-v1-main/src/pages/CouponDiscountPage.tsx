import React, { useState, useMemo } from "react";
import {
  ShellLayout,
  MetricTile,
  AIInsightsTile,
  KpiCustomizeButton,
  CouponPerformanceTile,
  DraggableKpiRow,
  ReportPageLayout,
} from "@/components/layout";
import { useKpiPreferences, KpiOption } from "@/hooks/useKpiPreferences";
import { CouponMixTile } from "@/components/reports/CouponMixTile";
import { CouponInvoiceDetailTile, CouponInvoiceRow } from "@/components/reports/CouponInvoiceDetailTile";

/* ------------------------------------------------------------------
   Sample data
-------------------------------------------------------------------*/

const COUPON_MIX_ROWS = [
  { code: "OIL10", redemptions: 980 },
  { code: "SYN20", redemptions: 640 },
  { code: "WEB15", redemptions: 760 },
  { code: "VIP25", redemptions: 420 },
  { code: "WELCOME5", redemptions: 1020 },
];

const COUPON_INVOICES: CouponInvoiceRow[] = [
  { date: "2024-12-09", invoice: "122048", license: "7CDE741", store: "Fairfield, CA", customer: "Noah Rivera", vehicle: "2017 Toyota Highlander", couponCode: "OIL10", offer: "$10 off any oil change", discount: 10, sales: 90, channel: "Email", isThrottle: true },
  { date: "2024-12-08", invoice: "121006", license: "9WXY529", store: "Vallejo, CA", customer: "Ethan Hall", vehicle: "2015 Nissan Altima", couponCode: "SYN20", offer: "$20 off synthetic oil", discount: 20, sales: 112, channel: "SMS", isThrottle: true },
  { date: "2024-12-08", invoice: "121022", license: "8ZAB630", store: "Napa, CA", customer: "Hannah Lewis", vehicle: "2020 Subaru Legacy", couponCode: "WEB15", offer: "15% off web-only offer", discount: 18, sales: 155, channel: "Web", isThrottle: false },
  { date: "2024-12-07", invoice: "123058", license: "1TUV418", store: "Vacaville, CA", customer: "Chloe Adams", vehicle: "2019 Kia Sorento", couponCode: "WELCOME5", offer: "$5 off new customer", discount: 5, sales: 83, channel: "POS", isThrottle: true },
  { date: "2024-12-07", invoice: "122047", license: "2QRS307", store: "Fairfield, CA", customer: "Logan Ramirez", vehicle: "2018 Chevy Equinox", couponCode: "VIP25", offer: "$25 off ticket over $150", discount: 25, sales: 142, channel: "Email", isThrottle: true },
  { date: "2024-12-06", invoice: "121021", license: "3NOP296", store: "Napa, CA", customer: "Megan Scott", vehicle: "2016 Subaru Crosstrek", couponCode: "WEB15", offer: "15% off web-only offer", discount: 14, sales: 108, channel: "Web", isThrottle: false },
  { date: "2024-12-06", invoice: "121005", license: "4KLM185", store: "Vallejo, CA", customer: "Jason Clark", vehicle: "2011 Ford Focus", couponCode: "WELCOME5", offer: "$5 off new customer", discount: 5, sales: 105, channel: "POS", isThrottle: true },
  { date: "2024-12-05", invoice: "123057", license: "5HIJ074", store: "Vacaville, CA", customer: "Sophia Turner", vehicle: "2022 Hyundai Tucson", couponCode: "SYN20", offer: "$20 off synthetic oil", discount: 20, sales: 160, channel: "Email", isThrottle: true },
  { date: "2024-12-05", invoice: "122046", license: "6EFG963", store: "Fairfield, CA", customer: "Anthony Perez", vehicle: "2013 Honda Accord", couponCode: "OIL10", offer: "$10 off any oil change", discount: 10, sales: 84, channel: "SMS", isThrottle: true },
  { date: "2024-12-04", invoice: "121020", license: "7BCD852", store: "Napa, CA", customer: "Rachel Green", vehicle: "2019 Toyota RAV4", couponCode: "WEB15", offer: "15% off web-only offer", discount: 16, sales: 99, channel: "Web", isThrottle: false },
  { date: "2024-12-04", invoice: "121004", license: "8YZA741", store: "Vallejo, CA", customer: "Kevin Nguyen", vehicle: "2014 Jeep Wrangler", couponCode: "VIP25", offer: "$25 off ticket over $150", discount: 25, sales: 150, channel: "Email", isThrottle: true },
  { date: "2024-12-03", invoice: "123056", license: "9VWX369", store: "Vacaville, CA", customer: "Olivia Brown", vehicle: "2018 Ford Escape", couponCode: "WELCOME5", offer: "$5 off new customer", discount: 5, sales: 118, channel: "POS", isThrottle: true },
  { date: "2024-12-03", invoice: "122045", license: "1STU258", store: "Fairfield, CA", customer: "David Martinez", vehicle: "2015 Toyota Corolla", couponCode: "OIL10", offer: "$10 off any oil change", discount: 10, sales: 72, channel: "Email", isThrottle: true },
  { date: "2024-12-02", invoice: "121019", license: "2PQR147", store: "Napa, CA", customer: "Sarah Wilson", vehicle: "2020 Subaru Forester", couponCode: "SYN20", offer: "$20 off synthetic oil", discount: 20, sales: 102, channel: "SMS", isThrottle: true },
  { date: "2024-12-02", invoice: "121003", license: "3MNO987", store: "Vallejo, CA", customer: "Brian Lee", vehicle: "2017 Chevy Silverado", couponCode: "VIP25", offer: "$25 off ticket over $150", discount: 25, sales: 145, channel: "Email", isThrottle: true },
  { date: "2024-12-01", invoice: "123055", license: "4JKL654", store: "Vacaville, CA", customer: "Emily Davis", vehicle: "2019 Honda CR-V", couponCode: "WEB15", offer: "15% off web-only offer", discount: 17, sales: 110, channel: "Web", isThrottle: false },
  { date: "2024-11-30", invoice: "122044", license: "5GHI321", store: "Fairfield, CA", customer: "Carlos Garcia", vehicle: "2012 Honda Civic", couponCode: "WELCOME5", offer: "$5 off new customer", discount: 5, sales: 79, channel: "POS", isThrottle: true },
  { date: "2024-11-29", invoice: "121018", license: "6DEF456", store: "Napa, CA", customer: "Laura Chen", vehicle: "2021 Subaru Outback", couponCode: "SYN20", offer: "$20 off synthetic oil", discount: 20, sales: 132, channel: "Email", isThrottle: true },
  { date: "2024-11-28", invoice: "121002", license: "7XYZ789", store: "Vallejo, CA", customer: "Michael Johnson", vehicle: "2016 Ford F-150", couponCode: "OIL10", offer: "$10 off any oil change", discount: 10, sales: 96, channel: "POS", isThrottle: true },
  { date: "2024-11-28", invoice: "121001", license: "8ABC123", store: "Vallejo, CA", customer: "Jane Smith", vehicle: "2018 Toyota Camry", couponCode: "WELCOME5", offer: "$5 off new customer", discount: 5, sales: 128, channel: "Email", isThrottle: true },
];

/* ------------------------------------------------------------------
   KPI config (previous iteration)
-------------------------------------------------------------------*/

const KPI_OPTIONS: KpiOption[] = [
  { id: "totalCouponAmount", label: "Total coupon amount" },
  { id: "totalDiscountAmount", label: "Total discount $" },
  { id: "avgCouponPerInvoice", label: "Avg coupon/discount per invoice" },
  { id: "totalRevenue", label: "Total revenue" },
];

const CouponDiscountPage: React.FC = () => {
  const [insights, setInsights] = useState<string[]>([
    "Most discount dollars are concentrated in a small set of high-usage coupons.",
    "Some offers are richer than necessary given their strong response rates.",
    "New customer and web-only offers can often be tuned independently of core oil-change coupons.",
  ]);

  const { selectedIds, setSelectedIds } = useKpiPreferences("coupon-discount", KPI_OPTIONS);

  // KPI values matching the reference image
  const totalCouponAmount = 15420;
  const totalDiscountAmount = 28950;
  const avgCouponDiscount = 7.85;
  const totalRevenue = 312400;
  const currency = (v: number, decimals = 0) =>
    v.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const renderKpiTile = (id: string) => {
    switch (id) {
      case "totalCouponAmount":
        return (
          <MetricTile
            key={id}
            label="Total coupon amount"
            value={currency(totalCouponAmount)}
            helpText="Sum of coupon dollars used across all redemptions during the period. Higher amounts may indicate strong response but also margin erosion."
            variant="coupon"
          />
        );
      case "totalDiscountAmount":
        return (
          <MetricTile
            key={id}
            label="Total discount amount"
            value={currency(totalDiscountAmount)}
            helpText="Total discount dollars applied from all discount offers. Monitor this alongside revenue to ensure discounts are driving profitable visits."
            variant="discount"
          />
        );
      case "avgCouponPerInvoice":
        return (
          <MetricTile
            key={id}
            label="Avg coupon/discount"
            value={currency(avgCouponDiscount, 2)}
            helpText="Average reduction per discounted invoice across all offers. Use this to benchmark offer richness and identify outliers."
          />
        );
      case "totalRevenue":
        return (
          <MetricTile
            key={id}
            label="Total revenue"
            value={currency(totalRevenue)}
            helpText="Total revenue on invoices that used a coupon or discount. Compare net revenue to coupon spend to evaluate profitability."
          />
        );
      default:
        return null;
    }
  };

  const regenerateInsights = () => {
    setInsights([
      '"WELCOME5" has the highest response rate (7.5%). Review its ROAS to ensure margin is acceptable.',
      "Consider small tests lowering discount amounts on top-performing coupons to protect margin.",
      "Use this report with ROAS and Oil Type Sales to spot where discounts are eroding premium oil margins.",
    ]);
  };

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "Coupon / Discount Analysis" },
      ]}
      rightInfo={<span>Period: <span className="font-medium">Last 90 days</span></span>}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Coupon / Discount Analysis
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            See which offers drive profitable visits and where discounting erodes margin.
          </p>
        </div>
        <KpiCustomizeButton
          reportId="coupon-discount"
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
              reportKey="coupon-discount"
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
            subtitle="Based on coupon & discount data"
            bullets={insights}
            onRefresh={regenerateInsights}
          />
        }
      >
        {/* Coupon mix bar */}
        <CouponMixTile rows={COUPON_MIX_ROWS} />

        {/* Coupon performance table (previous iteration) */}
        <CouponPerformanceTile />

        {/* Invoice detail */}
        <CouponInvoiceDetailTile rows={COUPON_INVOICES} />
      </ReportPageLayout>
    </ShellLayout>
  );
};

export default CouponDiscountPage;
