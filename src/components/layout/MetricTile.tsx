import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type MetricVariant = "default" | "coupon" | "discount";

type MetricTileProps = {
  label: string;
  value: string;
  helper?: string;
  highlight?: boolean;
  helpText?: string;
  variant?: MetricVariant;
  className?: string;
  /** Custom class for value highlight pill (e.g., "bg-sky-100 text-sky-700") */
  valueHighlightClass?: string;
};

const variantClasses: Record<MetricVariant, string> = {
  default: "bg-white border-slate-200",
  coupon: "bg-sky-50 border-sky-100",
  discount: "bg-emerald-50 border-emerald-100",
};

const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  helper,
  highlight = false,
  helpText,
  variant = "default",
  className,
  valueHighlightClass,
}) => {
  // Determine value styling - no pill backgrounds, just colored text when highlighted
  let valueClass = "text-xl md:text-2xl font-semibold text-slate-900 tracking-tight";
  
  if (highlight) {
    valueClass = "text-xl md:text-2xl font-semibold text-emerald-700 tracking-tight";
  } else if (valueHighlightClass) {
    // Extract just the text color from valueHighlightClass (e.g., "text-emerald-700")
    const textColorMatch = valueHighlightClass.match(/text-\S+/);
    const textColor = textColorMatch ? textColorMatch[0] : "text-slate-900";
    valueClass = `text-xl md:text-2xl font-semibold ${textColor} tracking-tight`;
  } else if (variant === "coupon") {
    valueClass = "text-xl md:text-2xl font-semibold text-sky-700 tracking-tight";
  } else if (variant === "discount") {
    valueClass = "text-xl md:text-2xl font-semibold text-emerald-700 tracking-tight";
  }

  const tileContent = (
    <div className={cn("rounded-2xl border shadow-sm h-full", variantClasses[variant], className, helpText && "cursor-help")}>
      <div className="flex flex-col justify-center h-full px-3 py-3 md:px-4 md:py-4 min-h-[96px]">
        {/* Description */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-medium text-slate-500 leading-snug">
            {label}
          </span>
        </div>

        {/* Metric value */}
        <div className={cn(valueClass, "mt-0.5 leading-tight")}>{value}</div>

        {/* Optional helper line */}
        {helper && (
          <div className="mt-1 text-[11px] text-slate-500 leading-snug">
            {helper}
          </div>
        )}
      </div>
    </div>
  );

  if (helpText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {tileContent}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-[11px] leading-snug">
            {helpText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return tileContent;
};

export default MetricTile;
