import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type ExpandPillButtonProps = {
  expanded: boolean;
  totalCount: number;
  onClick: () => void;
  className?: string;
};

export const ExpandPillButton: React.FC<ExpandPillButtonProps> = ({
  expanded,
  totalCount,
  onClick,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors ${className}`}
    >
      {expanded ? (
        <>
          <ChevronUp className="h-3 w-3" />
          Show less
        </>
      ) : (
        <>
          <ChevronDown className="h-3 w-3" />
          Show all {totalCount}
        </>
      )}
    </button>
  );
};

export default ExpandPillButton;
