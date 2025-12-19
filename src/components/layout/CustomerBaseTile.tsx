import React, { useState } from "react";
import {
  ReportTable,
  ReportTableHead,
  ReportTableBody,
  ReportTableRow,
  ReportTableHeaderCell,
  ReportTableCell,
} from "@/components/ui/report-table";

type StoreRow = {
  store: string;
  customers: number;
  vehicles: number;
  emailCapturePct: number;
  phoneCapturePct: number;
  addressCapturePct: number;
};

const STORES: StoreRow[] = [
  {
    store: "Vallejo, CA",
    customers: 5200,
    vehicles: 7000,
    emailCapturePct: 79.0,
    phoneCapturePct: 72.0,
    addressCapturePct: 65.0,
  },
  {
    store: "Napa, CA",
    customers: 4200,
    vehicles: 5600,
    emailCapturePct: 81.0,
    phoneCapturePct: 74.0,
    addressCapturePct: 67.0,
  },
  {
    store: "Fairfield, CA",
    customers: 3100,
    vehicles: 4080,
    emailCapturePct: 74.0,
    phoneCapturePct: 68.0,
    addressCapturePct: 60.0,
  },
  {
    store: "Vacaville, CA",
    customers: 4000,
    vehicles: 5420,
    emailCapturePct: 80.0,
    phoneCapturePct: 71.0,
    addressCapturePct: 66.0,
  },
];

type Tab = "overview" | "details";

const getCaptureColorClass = (pct: number): string => {
  if (pct >= 80) return "text-emerald-600";
  if (pct >= 75) return "text-sky-600";
  return "text-slate-800";
};

export const CustomerBaseTile: React.FC = () => {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header + pill tabs */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">
            Database, by Location
          </h2>
          <p className="text-[11px] text-slate-500">
            Valid Email Addresses + Valid Mailing Addresses
          </p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 text-[11px]">
          {(["overview", "details"] as Tab[]).map((t) => {
            const isActive = t === tab;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-3 py-1 transition ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {t === "overview" ? "Overview" : "Details"}
              </button>
            );
          })}
        </div>
      </header>

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <div className="mt-4 divide-y divide-slate-100">
          {STORES.map((row) => (
            <div key={row.store} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                {/* Left: store + counts */}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-slate-900">
                    {row.store}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {row.customers.toLocaleString()} customers ·{" "}
                    {row.vehicles.toLocaleString()} vehicles
                  </div>
                </div>

                {/* Right: EMAIL + PHONE + ADDRESS CAPTURE */}
                <div className="flex flex-col items-end gap-2 text-right sm:flex-row sm:items-start sm:gap-6">
                  {/* Email capture */}
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">
                      Email capture
                    </div>
                    <div
                      className={`text-sm font-semibold ${getCaptureColorClass(
                        row.emailCapturePct
                      )}`}
                    >
                      {row.emailCapturePct.toFixed(1)}%
                    </div>
                  </div>

                  {/* Phone capture */}
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">
                      Phone capture
                    </div>
                    <div
                      className={`text-sm font-semibold ${getCaptureColorClass(
                        row.phoneCapturePct
                      )}`}
                    >
                      {row.phoneCapturePct.toFixed(1)}%
                    </div>
                  </div>

                  {/* Address capture */}
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">
                      Address capture
                    </div>
                    <div
                      className={`text-sm font-semibold ${getCaptureColorClass(
                        row.addressCapturePct
                      )}`}
                    >
                      {row.addressCapturePct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILS TAB */}
      {tab === "details" && (
        <div className="mt-4 overflow-x-auto">
          <ReportTable>
            <ReportTableHead>
              <ReportTableRow>
                <ReportTableHeaderCell label="Store" />
                <ReportTableHeaderCell label="Customers" align="right" />
                <ReportTableHeaderCell label="Vehicles" align="right" />
                <ReportTableHeaderCell label="Email capture %" align="right" />
                <ReportTableHeaderCell label="Phone capture %" align="right" />
                <ReportTableHeaderCell label="Address capture %" align="right" />
              </ReportTableRow>
            </ReportTableHead>
            <ReportTableBody>
              {STORES.map((row) => (
                <ReportTableRow key={row.store}>
                  <ReportTableCell className="text-slate-900">{row.store}</ReportTableCell>
                  <ReportTableCell align="right" className="text-slate-900">{row.customers.toLocaleString()}</ReportTableCell>
                  <ReportTableCell align="right" className="text-slate-900">{row.vehicles.toLocaleString()}</ReportTableCell>
                  <ReportTableCell align="right" className={`font-semibold ${getCaptureColorClass(row.emailCapturePct)}`}>
                    {row.emailCapturePct.toFixed(1)}%
                  </ReportTableCell>
                  <ReportTableCell align="right" className={`font-semibold ${getCaptureColorClass(row.phoneCapturePct)}`}>
                    {row.phoneCapturePct.toFixed(1)}%
                  </ReportTableCell>
                  <ReportTableCell align="right" className={`font-semibold ${getCaptureColorClass(row.addressCapturePct)}`}>
                    {row.addressCapturePct.toFixed(1)}%
                  </ReportTableCell>
                </ReportTableRow>
              ))}
            </ReportTableBody>
          </ReportTable>
        </div>
      )}
    </section>
  );
};

export default CustomerBaseTile;
