import React, { useState, useMemo } from "react";
import {
  ReportTable,
  ReportTableHead,
  ReportTableBody,
  ReportTableRow,
  ReportTableHeaderCell,
  ReportTableCell,
} from "@/components/ui/report-table";

export type CouponRow = {
  code: string;
  description: string;
  invoices: number;
  redemptions: number;
  respPct: number;
  couponAmount: number;
  revenue: number;
};

type Props = {
  rows: CouponRow[];
};

type SortKey = "code" | "invoices" | "redemptions" | "respPct" | "couponAmount" | "revenue";
type SortDir = "asc" | "desc";
type SortState = { key: SortKey; dir: SortDir };

const COUPON_PILL_COLORS: Record<string, string> = {
  OIL10: "bg-emerald-50 text-emerald-700 border-emerald-100",
  SYN20: "bg-sky-50 text-sky-700 border-sky-100",
  WEB15: "bg-indigo-50 text-indigo-700 border-indigo-100",
  VIP25: "bg-amber-50 text-amber-700 border-amber-100",
  WELCOME5: "bg-rose-50 text-rose-700 border-rose-100",
};

const getPillColor = (code: string) =>
  COUPON_PILL_COLORS[code] || "bg-slate-100 text-slate-700 border-slate-200";

const currency = (v: number) =>
  v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const pct = (v: number) => `${v.toFixed(1)}%`;

export const CouponTableTile: React.FC<Props> = ({ rows }) => {
  const [sort, setSort] = useState<SortState>({ key: "revenue", dir: "desc" });

  const sortedRows = useMemo(() => {
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (sort.key === "code") return factor * a.code.localeCompare(b.code);
      return factor * ((a[sort.key] as number) - (b[sort.key] as number));
    });
  }, [rows, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
  };

  const renderHeader = (label: string, key: SortKey, align: "left" | "right" = "left") => (
    <ReportTableHeaderCell
      label={label}
      sortKey={key}
      sortState={{ key: sort.key, direction: sort.dir }}
      onSortChange={() => toggleSort(key)}
      align={align}
    />
  );

  return (
    <section className="rounded-2xl border border-tp-border bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px]">
            <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 font-medium text-sky-700">
              COUPONS
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Performance by coupon code. Color indicates offer type.
          </p>
        </div>
      </header>

      <div className="mt-4">
        <ReportTable>
          <ReportTableHead>
          <ReportTableRow>
              {renderHeader("Code", "code")}
              <ReportTableHeaderCell label="Description" className="normal-case" />
              {renderHeader("Invoices", "invoices", "right")}
              {renderHeader("Redemptions", "redemptions", "right")}
              {renderHeader("Resp %", "respPct", "right")}
              {renderHeader("Coupon $", "couponAmount", "right")}
              {renderHeader("Revenue", "revenue", "right")}
            </ReportTableRow>
          </ReportTableHead>
          <ReportTableBody>
            {sortedRows.map((row) => (
              <ReportTableRow key={row.code}>
                <ReportTableCell>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getPillColor(
                      row.code
                    )}`}
                  >
                    {row.code}
                  </span>
                </ReportTableCell>
                <ReportTableCell>{row.description}</ReportTableCell>
                <ReportTableCell align="right">
                  {row.invoices.toLocaleString()}
                </ReportTableCell>
                <ReportTableCell align="right">
                  {row.redemptions.toLocaleString()}
                </ReportTableCell>
                <ReportTableCell align="right" className="font-semibold text-emerald-600">
                  {pct(row.respPct)}
                </ReportTableCell>
                <ReportTableCell align="right">
                  {currency(row.couponAmount)}
                </ReportTableCell>
                <ReportTableCell align="right">
                  {currency(row.revenue)}
                </ReportTableCell>
              </ReportTableRow>
            ))}
          </ReportTableBody>
        </ReportTable>
      </div>
    </section>
  );
};

export default CouponTableTile;
