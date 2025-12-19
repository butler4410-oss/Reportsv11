import React, { useState } from "react";
import { ShellLayout, AIInsightsTile, ReportPageLayout } from "@/components/layout";

type AddressSummary = {
  totalAddresses: number;
  validPct: number;
  badPct: number;
  blankPct: number;
  validCount: number;
  badCount: number;
  blankCount: number;
  avgBadRate: number;
};

type AddressStoreRow = {
  storeName: string;
  validPct: number;
  badPct: number;
  blankPct: number;
};

const addressSummary: AddressSummary = {
  totalAddresses: 18200,
  validPct: 86,
  badPct: 9,
  blankPct: 5,
  validCount: 15652,
  badCount: 1638,
  blankCount: 910,
  avgBadRate: 8.5,
};

const addressStoreRows: AddressStoreRow[] = [
  { storeName: "Vallejo, CA", validPct: 84, badPct: 10, blankPct: 6 },
  { storeName: "Napa, CA", validPct: 88, badPct: 7, blankPct: 5 },
  { storeName: "Fairfield, CA", validPct: 82, badPct: 11, blankPct: 7 },
  { storeName: "Vacaville, CA", validPct: 90, badPct: 6, blankPct: 4 },
];

const ValidAddressPage: React.FC = () => {
  const [insights, setInsights] = useState<string[]>([
    "Mail address quality is generally good, but a few stores are above the 10% bad-address threshold.",
    "Blank and undeliverable addresses directly waste postcard spend.",
    "Cleaning up addresses in the worst stores will quickly improve ROAS on mail-heavy journeys.",
  ]);

  const regenerateInsights = () => {
    const worstStore = addressStoreRows.reduce((worst, r) =>
      !worst || r.badPct > worst.badPct ? r : worst
    );
    setInsights([
      `Valid address rate across the account is ${addressSummary.validPct.toFixed(1)}%, with ${addressSummary.badPct.toFixed(1)}% bad and ${addressSummary.blankPct.toFixed(1)}% blank.`,
      `"${worstStore.storeName}" has the worst address quality (${worstStore.badPct.toFixed(1)}% bad); clean-up here will have outsized impact.`,
      "Run this report before large mail campaigns to avoid wasting budget on undeliverable addresses.",
    ]);
  };

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "Valid Address Report" },
      ]}
      rightInfo={
        <>
          <span>
            Addresses:{" "}
            <span className="font-medium">
              {addressSummary.totalAddresses.toLocaleString()}
            </span>
          </span>
        </>
      }
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Valid Address Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Mail & email reachability by store: valid, bad and blank records.
          </p>
        </div>
      </div>

      {/* KPIs - above the grid */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total addresses */}
        <section className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-600">
            Total addresses
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {addressSummary.totalAddresses.toLocaleString()}
          </div>
        </section>

        {/* Valid – pastel green */}
        <section className="flex flex-col justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-600">
            Valid
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {addressSummary.validPct.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-slate-600">
            {addressSummary.validCount.toLocaleString()} addresses
          </div>
        </section>

        {/* Bad – pastel yellow */}
        <section className="flex flex-col justify-between rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-600">
            Bad
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {addressSummary.badPct.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-slate-600">
            {addressSummary.badCount.toLocaleString()} addresses
          </div>
        </section>

        {/* Blank – pastel red */}
        <section className="flex flex-col justify-between rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-600">
            Blank
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {addressSummary.blankPct.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-slate-600">
            {addressSummary.blankCount.toLocaleString()} addresses
          </div>
        </section>

        {/* Average bad address rate */}
        <section className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-600">
            Average bad address rate
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {addressSummary.avgBadRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-slate-600">
            Per store
          </div>
        </section>
      </div>

      {/* Main content using ReportPageLayout */}
      <ReportPageLayout
        ai={
          <AIInsightsTile
            title="AI Insights"
            subtitle="Based on address quality"
            bullets={insights}
            onRefresh={regenerateInsights}
          />
        }
      >
        {/* Store quality bars */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Address quality by store
            </h2>
            <span className="text-[11px] text-slate-500">
              Valid vs bad vs blank
            </span>
          </div>

          {/* Bars per store */}
          {addressStoreRows.map((row) => (
            <div key={row.storeName} className="mt-3 flex items-center gap-3">
              {/* Store name */}
              <div className="w-40 text-[11px] text-slate-700">
                {row.storeName}
              </div>

              {/* Pastel stacked bar */}
              <div className="flex-1">
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  {/* Valid (green) */}
                  <div
                    className="h-full bg-emerald-200"
                    style={{ width: `${row.validPct}%` }}
                  />
                  {/* Bad (yellow) */}
                  <div
                    className="h-full bg-amber-200"
                    style={{ width: `${row.badPct}%` }}
                  />
                  {/* Blank (red) */}
                  <div
                    className="h-full bg-rose-200"
                    style={{ width: `${row.blankPct}%` }}
                  />
                </div>
              </div>

              {/* Right-side label */}
              <div className="w-24 text-right text-[11px] text-slate-700">
                {row.validPct.toFixed(1)}% valid
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-200" />
              <span>Valid</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-200" />
              <span>Bad</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-200" />
              <span>Blank</span>
            </span>
          </div>
        </section>
      </ReportPageLayout>
    </ShellLayout>
  );
};

export default ValidAddressPage;
