import React from "react";
import { cn } from "@/lib/utils";

/**
 * Shared AI Insights tile width for ALL report layouts.
 * Use this constant for the Reports home page and any custom layouts
 * to ensure consistent sizing across the app.
 */
export const AI_INSIGHTS_WIDTH_CLASSES = "w-full lg:w-[280px] xl:w-[320px] shrink-0";

/**
 * ============================================================
 * GLOBAL FIX: AI Insights alignment (applies to ALL report pages)
 * ============================================================
 *
 * GOAL
 * - AI Insights right-rail must ALWAYS start at the same top baseline:
 *   - Top-align with KPI row when KPIs exist
 *   - Top-align with the first left tile when KPIs do not exist
 *
 * ROOT CAUSE
 * - KPI row was being rendered as a full-width block ABOVE the 2-col grid,
 *   which pushes the AI column down whenever KPIs exist.
 *
 * FIX (MANDATORY)
 * - The page must start as a 2-column grid at the very top
 * - KPI row must render INSIDE the LEFT column (not above the grid)
 * - AI renders in the RIGHT column (desktop), always self-start (no mt hacks)
 *
 * ------------------------------------------------------------
 * QUICK TEMPLATE (use in every report page)
 * ------------------------------------------------------------
 * const kpiRow = selectedKpis.length ? (
 *   <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
 *     {selectedKpis.map(renderKpi)}
 *   </div>
 * ) : null;
 *
 * return (
 *   <ReportPageLayout
 *     kpis={kpiRow}
 *     ai={<AIInsightsTile bullets={[...]} />}
 *     mobileAiPlacement="top"
 *   >
 *     <LeftTile1 />
 *     <LeftTile2 />
 *   </ReportPageLayout>
 * );
 */

type ReportPageLayoutProps = {
  /** Optional KPI row. IMPORTANT: renders INSIDE the left column (so AI never gets pushed down). */
  kpis?: React.ReactNode;

  /** AI Insights tile (right rail). */
  ai?: React.ReactNode;

  /** Left-column tiles/content. */
  children: React.ReactNode;

  className?: string;
  leftClassName?: string;
  rightClassName?: string;

  /** Right rail width on desktop */
  rightWidthClassName?: string; // default: "lg:w-[360px]"

  /**
   * Mobile placement for AI tile:
   * - "top": below KPIs and above left content (recommended)
   * - "bottom": below all left content
   */
  mobileAiPlacement?: "top" | "bottom";
};

const ReportPageLayout: React.FC<ReportPageLayoutProps> = ({
  kpis,
  ai,
  children,
  className,
  leftClassName,
  rightClassName,
  rightWidthClassName = "lg:w-[280px] xl:w-[320px]",
  mobileAiPlacement = "top",
}) => {
  return (
    <div className={cn("w-full mt-4", className)}>
      {/* Two-column grid starts at the very top so AI baseline is consistent */}
      <div className="flex flex-col lg:flex-row lg:gap-4 lg:items-start">
        {/* LEFT COLUMN */}
        <div className={cn("flex-1 min-w-0", leftClassName)}>
          {/* KPI row sits INSIDE left column so it never affects AI vertical position */}
          {kpis}

          {/* Mobile AI placement (rendered ONCE here; do not duplicate in pages) */}
          {ai && mobileAiPlacement === "top" ? (
            <div className={cn("lg:hidden", kpis ? "mt-4" : "")}>{ai}</div>
          ) : null}

          {/* Main left content - margin logic:
              - KPIs exist: always mt-4 (content is below KPIs)
              - No KPIs + AI top: mt-4 on mobile only (AI shown above), no margin on desktop (AI is in separate column)
              - No KPIs + no AI top: no margin */}
          <div className={cn(
            "space-y-4",
            kpis ? "mt-4" : (ai && mobileAiPlacement === "top") ? "mt-4 lg:mt-0" : ""
          )}>
            {children}
          </div>

          {/* Optional mobile AI at bottom */}
          {ai && mobileAiPlacement === "bottom" ? (
            <div className="lg:hidden mt-4">{ai}</div>
          ) : null}
        </div>

        {/* RIGHT COLUMN (desktop only) - always aligns to top of left column */}
        {ai ? (
          <div
            className={cn(
              "hidden lg:block shrink-0 self-start",
              rightWidthClassName,
              rightClassName
            )}
          >
            {ai}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ReportPageLayout;
