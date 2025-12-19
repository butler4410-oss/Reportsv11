import React from "react";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

export type SortState = {
  key: string;
  direction: SortDirection;
} | null;

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;
type SectionProps = React.HTMLAttributes<HTMLTableSectionElement>;
type RowProps = React.HTMLAttributes<HTMLTableRowElement>;

export const ReportTable: React.FC<TableProps> = ({ className, ...props }) => (
  <table
    className={cn("min-w-full border-collapse text-left text-[11px]", className)}
    {...props}
  />
);

export const ReportTableHead: React.FC<SectionProps> = ({
  className,
  ...props
}) => (
  <thead
    className={cn(
      "border-b border-slate-100 text-slate-500 uppercase tracking-wide",
      className
    )}
    {...props}
  />
);

export const ReportTableBody: React.FC<SectionProps> = ({
  className,
  ...props
}) => (
  <tbody
    className={cn("divide-y divide-slate-100 text-slate-900", className)}
    {...props}
  />
);

export const ReportTableRow: React.FC<RowProps> = ({ className, ...props }) => (
  <tr className={cn("align-middle", className)} {...props} />
);

type HeaderCellProps = {
  label: string;
  sortKey?: string;
  sortState?: SortState;
  onSortChange?: (key: string) => void;
  align?: "left" | "right";
  className?: string;
};

export const ReportTableHeaderCell: React.FC<HeaderCellProps> = ({
  label,
  sortKey,
  sortState,
  onSortChange,
  align = "left",
  className,
}) => {
  const isSortable = !!sortKey && !!onSortChange;
  const isActive = isSortable && sortState?.key === sortKey;
  const direction = isActive ? sortState!.direction : undefined;

  const ariaSort: "ascending" | "descending" | "none" | undefined = !isSortable
    ? undefined
    : isActive
    ? direction === "asc"
      ? "ascending"
      : "descending"
    : "none";

  const base = cn(
    "py-2",
    align === "right" ? "text-right pl-4" : "text-left pr-4",
    "font-medium"
  );

  if (!isSortable) {
    return (
      <th scope="col" className={cn(base, className)} aria-sort={ariaSort}>
        {label}
      </th>
    );
  }

  return (
    <th scope="col" className={cn(base, className)} aria-sort={ariaSort}>
      <button
        type="button"
        onClick={() => onSortChange?.(sortKey!)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-slate-700",
          align === "right" && "ml-auto"
        )}
      >
        <span>{label}</span>
        {isActive && (
          <span className="text-[9px]">
            {direction === "asc" ? "▲" : "▼"}
          </span>
        )}
      </button>
    </th>
  );
};

type CellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "right";
};

export const ReportTableCell: React.FC<CellProps> = ({
  align = "left",
  className,
  ...props
}) => (
  <td
    className={cn(
      "py-2",
      align === "right" ? "text-right pl-4" : "text-left pr-4",
      className
    )}
    {...props}
  />
);
