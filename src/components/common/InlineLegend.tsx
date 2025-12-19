import React from "react";
import clsx from "clsx";

export type LegendItem = {
  label: string;
  colorClass: string; // Tailwind class for the dot color
};

type InlineLegendProps = {
  items: LegendItem[];
  className?: string;
};

export const InlineLegend: React.FC<InlineLegendProps> = ({
  items,
  className,
}) => {
  if (!items.length) return null;

  return (
    <div
      className={clsx(
        "mt-2 flex flex-wrap items-center gap-4 text-[11px] text-tp-grey-dark",
        className
      )}
    >
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span
            className={clsx(
              "h-2 w-2 rounded-full",
              item.colorClass
            )}
          />
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  );
};

export default InlineLegend;
