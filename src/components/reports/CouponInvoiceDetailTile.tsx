import React, { useState, useMemo } from "react";
import {
  ReportTable,
  ReportTableHead,
  ReportTableBody,
  ReportTableRow,
  ReportTableHeaderCell,
  ReportTableCell,
} from "@/components/ui/report-table";
import { ExpandPillButton } from "@/components/ui/expand-pill-button";
import { formatDate, formatInvoiceNumber } from "@/lib/formatters";

export type CouponInvoiceRow = {
  date: string;
  invoice: string;
  license: string;
  store: string;
  customer: string;
  vehicle: string;
  couponCode: string;
  offer: string;
  discount: number;
  sales: number;
  channel: string;
  isThrottle?: boolean;
};

type Props = {
  rows: CouponInvoiceRow[];
};

type SortKey =
  | "date"
  | "invoice"
  | "store"
  | "customer"
  | "vehicle"
  | "couponCode"
  | "discount"
  | "sales"
  | "channel";
type SortDir = "asc" | "desc";
type SortState = { key: SortKey; dir: SortDir };

// Coupon = sky (blue), Discount = emerald (green)
const COUPON_PILL = "bg-sky-50 text-sky-700 border-sky-100";
const DISCOUNT_PILL = "bg-emerald-50 text-emerald-700 border-emerald-100";

// Deterministic random assignment based on code string
const getOfferType = (code: string): "coupon" | "discount" => {
  const hash = code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % 2 === 0 ? "coupon" : "discount";
};

const getPillColor = (code: string) =>
  getOfferType(code) === "coupon" ? COUPON_PILL : DISCOUNT_PILL;

const currency = (v: number) =>
  v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export const CouponInvoiceDetailTile: React.FC<Props> = ({ rows }) => {
  const [sort, setSort] = useState<SortState>({ key: "sales", dir: "desc" });
  const [expanded, setExpanded] = useState(false);

  const sortedRows = useMemo(() => {
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (
        sort.key === "date" ||
        sort.key === "invoice" ||
        sort.key === "store" ||
        sort.key === "customer" ||
        sort.key === "vehicle" ||
        sort.key === "couponCode" ||
        sort.key === "channel"
      ) {
        return factor * (a[sort.key] as string).localeCompare(b[sort.key] as string);
      }
      return factor * ((a[sort.key] as number) - (b[sort.key] as number));
    });
  }, [rows, sort]);

  const visibleRows = expanded ? sortedRows : sortedRows.slice(0, 3);

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
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold text-tp-grey-dark">
            Invoice Detail
          </h2>
          <p className="text-[11px] text-slate-500">
            Invoice-level view of discounted visits.
            <span className="ml-1 text-amber-500">★</span> marks Throttle coupons or discounts.
          </p>
        </div>
        {rows.length > 3 && (
          <ExpandPillButton
            expanded={expanded}
            totalCount={rows.length}
            onClick={() => setExpanded(!expanded)}
          />
        )}
      </header>

      <ReportTable>
        <ReportTableHead>
          <ReportTableRow>
            {renderHeader("Date", "date")}
            {renderHeader("Invoice", "invoice")}
            <ReportTableHeaderCell label="License / Store / Cust / Vehicle" className="normal-case" />
            {renderHeader("Coupon", "couponCode")}
            <ReportTableHeaderCell label="Offer" className="normal-case" />
            {renderHeader("Discount", "discount", "right")}
            {renderHeader("Revenue", "sales", "right")}
          </ReportTableRow>
        </ReportTableHead>
        <ReportTableBody>
          {visibleRows.map((row, idx) => (
            <ReportTableRow key={`${row.invoice}-${idx}`}>
              <ReportTableCell>{formatDate(row.date)}</ReportTableCell>
              <ReportTableCell className="font-semibold text-sky-700">
                {formatInvoiceNumber(row.invoice)}
              </ReportTableCell>
              <ReportTableCell>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-semibold text-slate-900">{row.license}</div>
                  <div className="text-[10px] text-slate-500">{row.store}</div>
                  <div className="text-[10px] text-slate-500">{row.customer} · {row.vehicle}</div>
                </div>
              </ReportTableCell>
              <ReportTableCell>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getPillColor(
                    row.couponCode
                  )}`}
                >
                  {row.isThrottle && (
                    <span className="mr-1 text-[10px] leading-none text-amber-500">★</span>
                  )}
                  {row.couponCode}
                </span>
              </ReportTableCell>
              <ReportTableCell>{row.offer}</ReportTableCell>
              <ReportTableCell align="right">{currency(row.discount)}</ReportTableCell>
              <ReportTableCell align="right">{currency(row.sales)}</ReportTableCell>
            </ReportTableRow>
          ))}
        </ReportTableBody>
      </ReportTable>
    </section>
  );
};

export default CouponInvoiceDetailTile;
