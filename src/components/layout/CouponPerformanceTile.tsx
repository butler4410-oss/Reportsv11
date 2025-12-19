import React, { useMemo, useState } from "react";
import {
  ReportTable,
  ReportTableHead,
  ReportTableBody,
  ReportTableRow,
  ReportTableHeaderCell,
  ReportTableCell,
  SortState,
} from "@/components/ui/report-table";
import { ExpandPillButton } from "@/components/ui/expand-pill-button";

type CouponKind = "coupon" | "discount";

type CouponRow = {
  code: string;
  description: string;
  kind: CouponKind;
  isThrottle: boolean;
  redemptions: number;
  avgTicket: number;
  couponAmount: number;
  revenue: number;
};

type SortKey = "code" | "redemptions" | "avgTicket" | "couponAmount" | "revenue" | "usagePct";

const COUPON_ROWS: CouponRow[] = [
  { code: "OIL10", description: "$10 off any oil change", kind: "coupon", isThrottle: true, redemptions: 980, avgTicket: 94, couponAmount: 9800, revenue: 92200 },
  { code: "SYN20", description: "$20 off synthetic oil", kind: "coupon", isThrottle: true, redemptions: 640, avgTicket: 138, couponAmount: 12800, revenue: 88320 },
  { code: "VIP25", description: "$25 off ticket over $150", kind: "coupon", isThrottle: true, redemptions: 420, avgTicket: 186, couponAmount: 10500, revenue: 78120 },
  { code: "WEB15", description: "15% off web-only offer", kind: "discount", isThrottle: false, redemptions: 760, avgTicket: 112, couponAmount: 12768, revenue: 85120 },
  { code: "WELCOME5", description: "$5 off new customer", kind: "coupon", isThrottle: true, redemptions: 1020, avgTicket: 76, couponAmount: 5100, revenue: 77520 },
  { code: "FLEET10", description: "10% fleet discount", kind: "discount", isThrottle: false, redemptions: 340, avgTicket: 165, couponAmount: 5610, revenue: 56100 },
  { code: "LOYAL15", description: "$15 loyalty reward", kind: "coupon", isThrottle: true, redemptions: 520, avgTicket: 118, couponAmount: 7800, revenue: 61360 },
  { code: "SPRING25", description: "Spring promo $25 off", kind: "coupon", isThrottle: false, redemptions: 280, avgTicket: 142, couponAmount: 7000, revenue: 39760 },
  { code: "REFER10", description: "$10 referral bonus", kind: "coupon", isThrottle: true, redemptions: 190, avgTicket: 98, couponAmount: 1900, revenue: 18620 },
  { code: "SENIOR15", description: "15% senior discount", kind: "discount", isThrottle: false, redemptions: 410, avgTicket: 88, couponAmount: 5412, revenue: 36080 },
  { code: "MILITARY", description: "Military 20% off", kind: "discount", isThrottle: false, redemptions: 220, avgTicket: 105, couponAmount: 4620, revenue: 23100 },
  { code: "BDAY20", description: "$20 birthday coupon", kind: "coupon", isThrottle: true, redemptions: 150, avgTicket: 132, couponAmount: 3000, revenue: 19800 },
];

const basePillClasses =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase";
const couponColorClasses = "bg-sky-50 border-sky-100 text-sky-700";
const discountColorClasses = "bg-emerald-50 border-emerald-100 text-emerald-700";

const getPillClassesForKind = (kind: CouponKind) =>
  `${basePillClasses} ${kind === "coupon" ? couponColorClasses : discountColorClasses}`;

export const CouponPerformanceTile: React.FC = () => {
  const [sort, setSort] = useState<SortState>({
    key: "revenue",
    direction: "desc",
  });
  const [expanded, setExpanded] = useState(false);

  const totalRedemptions = useMemo(
    () => COUPON_ROWS.reduce((sum, row) => sum + row.redemptions, 0),
    []);

  const rowsWithUsage = useMemo(
    () =>
      COUPON_ROWS.map((row) => ({
        ...row,
        usagePct:
          totalRedemptions > 0
            ? (row.redemptions / totalRedemptions) * 100
            : 0,
      })),
    [totalRedemptions]
  );

  const sortedRows = useMemo(() => {
    if (!sort) return rowsWithUsage;
    const { key, direction } = sort;

    const copy = [...rowsWithUsage];

    copy.sort((a, b) => {
      const aValue = a[key as keyof typeof a];
      const bValue = b[key as keyof typeof b];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const aNum = Number(aValue);
      const bNum = Number(bValue);
      return direction === "asc" ? aNum - bNum : bNum - aNum;
    });

    return copy;
  }, [rowsWithUsage, sort]);

  const handleSortChange = (key: string) => {
    setSort((current) => {
      if (!current || current.key !== key) {
        const isCode = key === "code";
        return {
          key,
          direction: isCode ? "asc" : "desc",
        };
      }

      return {
        key,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const visibleRows = expanded ? sortedRows : sortedRows.slice(0, 5);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header: Pills as the title */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`${basePillClasses} ${couponColorClasses}`}>
              COUPONS
            </span>
            <span className={`${basePillClasses} ${discountColorClasses}`}>
              DISCOUNTS
            </span>
          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            Performance by coupon or discount code. Color indicates offer type;
            <span className="ml-1 text-amber-500">★</span> marks Throttle coupons or discounts.
          </p>
        </div>

        {sortedRows.length > 5 && (
          <ExpandPillButton
            expanded={expanded}
            totalCount={sortedRows.length}
            onClick={() => setExpanded(!expanded)}
          />
        )}
      </header>

      {/* Standardized table */}
      <div className="mt-4 overflow-x-auto">
        <ReportTable>
          <ReportTableHead>
            <ReportTableRow>
              <ReportTableHeaderCell
                label="Code"
                sortKey="code"
                sortState={sort}
                onSortChange={handleSortChange}
              />
              <ReportTableHeaderCell label="Description" />
              <ReportTableHeaderCell
                label="Redemptions"
                align="right"
                sortKey="redemptions"
                sortState={sort}
                onSortChange={handleSortChange}
              />
              <ReportTableHeaderCell
                label="Avg ticket"
                align="right"
                sortKey="avgTicket"
                sortState={sort}
                onSortChange={handleSortChange}
              />
              <ReportTableHeaderCell
                label="Coupon $"
                align="right"
                sortKey="couponAmount"
                sortState={sort}
                onSortChange={handleSortChange}
              />
              <ReportTableHeaderCell
                label="Revenue"
                align="right"
                sortKey="revenue"
                sortState={sort}
                onSortChange={handleSortChange}
              />
              <ReportTableHeaderCell
                label="% of redemptions"
                align="right"
                sortKey="usagePct"
                sortState={sort}
                onSortChange={handleSortChange}
              />
            </ReportTableRow>
          </ReportTableHead>

          <ReportTableBody>
            {visibleRows.map((row) => (
              <ReportTableRow key={row.code}>
                <ReportTableCell>
                  <span className={getPillClassesForKind(row.kind)}>
                    {row.isThrottle && (
                      <span className="mr-1 text-[10px] leading-none text-amber-500">★</span>
                    )}
                    {row.code}
                  </span>
                </ReportTableCell>

                <ReportTableCell className="text-slate-700">
                  {row.description}
                </ReportTableCell>

                <ReportTableCell align="right" className="font-semibold">
                  {row.redemptions.toLocaleString()}
                </ReportTableCell>

                <ReportTableCell align="right" className="font-semibold">
                  ${row.avgTicket.toLocaleString()}
                </ReportTableCell>

                <ReportTableCell align="right" className="font-semibold">
                  {row.couponAmount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  })}
                </ReportTableCell>

                <ReportTableCell align="right" className="font-semibold">
                  {row.revenue.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  })}
                </ReportTableCell>

                <ReportTableCell align="right" className="font-semibold text-emerald-600">
                  {row.usagePct.toFixed(1)}%
                </ReportTableCell>
              </ReportTableRow>
            ))}
          </ReportTableBody>
        </ReportTable>
      </div>
    </section>
  );
};

export default CouponPerformanceTile;
