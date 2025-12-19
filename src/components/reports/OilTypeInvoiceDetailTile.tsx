import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatDate, formatInvoiceNumber } from "@/lib/formatters";

type OilTypeInvoiceRow = {
  date: string;
  invoice: string;
  store: string;
  license: string;
  customer: string;
  vehicle: string;
  oilType: string;
  brand: string;
  sales: number;
  couponCode: string | null;
  discountCode: string | null;
};

type SortKey =
  | "date"
  | "invoice"
  | "store"
  | "license"
  | "oilType"
  | "brand"
  | "sales"
  | "couponCode"
  | "discountCode";

type SortDir = "asc" | "desc";

type Props = {
  rows?: OilTypeInvoiceRow[];
  initialCollapsed?: boolean;
  previewCount?: number;
};

const oilTypePillClass = (type: string): string => {
  switch (type) {
    case "Full Synthetic":
      return "bg-emerald-50 text-emerald-700";
    case "Conventional":
      return "bg-sky-50 text-sky-700";
    case "Synthetic Blend":
      return "bg-indigo-50 text-indigo-700";
    case "High Mileage":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-rose-50 text-rose-700";
  }
};

const SAMPLE_INVOICES: OilTypeInvoiceRow[] = [
  { date: "2024-11-28", invoice: "121001", store: "Vallejo, CA", license: "8ABC123", customer: "Jane Smith", vehicle: "2018 Toyota Camry", oilType: "Full Synthetic", brand: "Royal Purple", sales: 128, couponCode: "SYN20", discountCode: null },
  { date: "2024-11-28", invoice: "121002", store: "Vallejo, CA", license: "7XYZ789", customer: "Michael Johnson", vehicle: "2016 Ford F-150", oilType: "Synthetic Blend", brand: "House Brand", sales: 96, couponCode: null, discountCode: "FLEET10" },
  { date: "2024-11-29", invoice: "121018", store: "Napa, CA", license: "6DEF456", customer: "Laura Chen", vehicle: "2021 Subaru Outback", oilType: "Full Synthetic", brand: "Royal Purple", sales: 132, couponCode: "OIL10", discountCode: null },
  { date: "2024-11-30", invoice: "122044", store: "Fairfield, CA", license: "5GHI321", customer: "Carlos Garcia", vehicle: "2012 Honda Civic", oilType: "Conventional", brand: "House Brand", sales: 79, couponCode: "WINTERS", discountCode: null },
  { date: "2024-12-01", invoice: "123055", store: "Vacaville, CA", license: "4JKL654", customer: "Emily Davis", vehicle: "2019 Honda CR-V", oilType: "High Mileage", brand: "House Brand", sales: 110, couponCode: null, discountCode: null },
  { date: "2024-12-02", invoice: "121003", store: "Vallejo, CA", license: "3MNO987", customer: "Brian Lee", vehicle: "2017 Chevy Silverado", oilType: "Full Synthetic", brand: "Royal Purple", sales: 145, couponCode: "SYN25", discountCode: null },
  { date: "2024-12-02", invoice: "121019", store: "Napa, CA", license: "2PQR147", customer: "Sarah Wilson", vehicle: "2020 Subaru Forester", oilType: "Synthetic Blend", brand: "House Brand", sales: 102, couponCode: null, discountCode: "TRANS20" },
  { date: "2024-12-03", invoice: "122045", store: "Fairfield, CA", license: "1STU258", customer: "David Martinez", vehicle: "2015 Toyota Corolla", oilType: "Conventional", brand: "House Brand", sales: 72, couponCode: "OIL5", discountCode: null },
  { date: "2024-12-03", invoice: "123056", store: "Vacaville, CA", license: "9VWX369", customer: "Olivia Brown", vehicle: "2018 Ford Escape", oilType: "High Mileage", brand: "House Brand", sales: 118, couponCode: "HM10", discountCode: null },
  { date: "2024-12-04", invoice: "121004", store: "Vallejo, CA", license: "8YZA741", customer: "Kevin Nguyen", vehicle: "2014 Jeep Wrangler", oilType: "Full Synthetic", brand: "Royal Purple", sales: 150, couponCode: null, discountCode: "WEB15" },
  { date: "2024-12-04", invoice: "121020", store: "Napa, CA", license: "7BCD852", customer: "Rachel Green", vehicle: "2019 Toyota RAV4", oilType: "Synthetic Blend", brand: "House Brand", sales: 99, couponCode: "BLEND15", discountCode: null },
  { date: "2024-12-05", invoice: "122046", store: "Fairfield, CA", license: "6EFG963", customer: "Anthony Perez", vehicle: "2013 Honda Accord", oilType: "Conventional", brand: "House Brand", sales: 84, couponCode: null, discountCode: null },
  { date: "2024-12-05", invoice: "123057", store: "Vacaville, CA", license: "5HIJ074", customer: "Sophia Turner", vehicle: "2022 Hyundai Tucson", oilType: "Full Synthetic", brand: "Royal Purple", sales: 160, couponCode: "SYN25", discountCode: null },
  { date: "2024-12-06", invoice: "121005", store: "Vallejo, CA", license: "4KLM185", customer: "Jason Clark", vehicle: "2011 Ford Focus", oilType: "High Mileage", brand: "House Brand", sales: 105, couponCode: null, discountCode: "TRANS20" },
  { date: "2024-12-06", invoice: "121021", store: "Napa, CA", license: "3NOP296", customer: "Megan Scott", vehicle: "2016 Subaru Crosstrek", oilType: "Synthetic Blend", brand: "House Brand", sales: 108, couponCode: "WEB15", discountCode: null },
  { date: "2024-12-07", invoice: "122047", store: "Fairfield, CA", license: "2QRS307", customer: "Logan Ramirez", vehicle: "2018 Chevy Equinox", oilType: "Full Synthetic", brand: "Royal Purple", sales: 142, couponCode: "OIL15", discountCode: null },
  { date: "2024-12-07", invoice: "123058", store: "Vacaville, CA", license: "1TUV418", customer: "Chloe Adams", vehicle: "2019 Kia Sorento", oilType: "Conventional", brand: "House Brand", sales: 83, couponCode: null, discountCode: "WEB15" },
  { date: "2024-12-08", invoice: "121006", store: "Vallejo, CA", license: "9WXY529", customer: "Ethan Hall", vehicle: "2015 Nissan Altima", oilType: "High Mileage", brand: "House Brand", sales: 112, couponCode: "TRANS20", discountCode: null },
  { date: "2024-12-08", invoice: "121022", store: "Napa, CA", license: "8ZAB630", customer: "Hannah Lewis", vehicle: "2020 Subaru Legacy", oilType: "Full Synthetic", brand: "Royal Purple", sales: 155, couponCode: "WEB15", discountCode: null },
  { date: "2024-12-09", invoice: "122048", store: "Fairfield, CA", license: "7CDE741", customer: "Noah Rivera", vehicle: "2017 Toyota Highlander", oilType: "Unclassified", brand: "House Brand", sales: 90, couponCode: null, discountCode: "WEB15" },
];

const OilTypeInvoiceDetailTile: React.FC<Props> = ({ 
  rows, 
  initialCollapsed = true,
  previewCount = 3 
}) => {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [isExpanded, setIsExpanded] = useState(!initialCollapsed);

  const data = rows ?? SAMPLE_INVOICES;

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedRows = useMemo(() => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      let aVal: string | number = a[sortKey];
      let bVal: string | number = b[sortKey];
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        const cmp = aVal.localeCompare(bVal);
        return sortDir === "asc" ? cmp : -cmp;
      }
      
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortKey, sortDir]);

  const displayedRows = isExpanded ? sortedRows : sortedRows.slice(0, previewCount);
  const hiddenCount = sortedRows.length - previewCount;

  const renderHeader = (label: string, key: SortKey, alignRight = false) => {
    const isActive = sortKey === key;

    return (
      <th
        key={key}
        className={`py-2 px-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 ${alignRight ? "text-right" : "text-left"}`}
      >
        <button
          type="button"
          onClick={() => handleSort(key)}
          className={`inline-flex items-center gap-1 ${alignRight ? "justify-end w-full" : ""}`}
        >
          <span className="whitespace-nowrap">{label}</span>
          {isActive && (
            <span className="text-[9px] text-slate-400">
              {sortDir === "desc" ? "▼" : "▲"}
            </span>
          )}
        </button>
      </th>
    );
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">
            Invoice Detail
          </h2>
          <p className="text-[11px] text-slate-500">
            Invoice-level view of oil type sales.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              <span>Show less</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              <span>Show all {sortedRows.length}</span>
            </>
          )}
        </button>
      </header>

      <div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              {renderHeader("Date", "date")}
              {renderHeader("Invoice", "invoice")}
              <th className="py-2 px-2 text-[11px] font-medium tracking-wide text-slate-500 text-left">License / Store / Cust / Vehicle</th>
              {renderHeader("Oil type", "oilType")}
              {renderHeader("Oil brand", "brand")}
              {renderHeader("Sales", "sales", true)}
              {renderHeader("Coupon", "couponCode", true)}
              {renderHeader("Discount", "discountCode", true)}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {displayedRows.map((row, idx) => (
              <tr key={row.invoice + row.date + idx}>
                <td className="py-3 px-2 text-xs text-slate-900">{formatDate(row.date)}</td>
                <td className="py-3 px-2 text-xs font-semibold text-sky-700">{formatInvoiceNumber(row.invoice)}</td>
                <td className="py-3 px-2 text-xs">
                  <div className="font-semibold text-slate-900">{row.license}</div>
                  <div className="text-[10px] text-slate-500">{row.store}</div>
                  <div className="text-[10px] text-slate-500">{row.customer} · {row.vehicle}</div>
                </td>
                <td className="py-3 px-2 text-xs">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${oilTypePillClass(row.oilType)}`}>
                    {row.oilType}
                  </span>
                </td>
                <td className="py-3 px-2 text-xs text-slate-900">{row.brand}</td>
                <td className="py-3 px-2 text-xs text-slate-900 text-right">
                  {row.sales.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                </td>
                <td className="py-3 px-2 text-xs text-center">
                  {row.couponCode ? (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700">
                      {row.couponCode}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="py-3 px-2 text-xs text-center">
                  {row.discountCode ? (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-sky-50 text-sky-700">
                      {row.discountCode}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isExpanded && hiddenCount > 0 && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-[11px] text-sky-600 hover:text-sky-700 font-medium"
          >
            + {hiddenCount} more invoices
          </button>
        </div>
      )}
    </section>
  );
};

export default OilTypeInvoiceDetailTile;
