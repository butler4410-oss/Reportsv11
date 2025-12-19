// src/pages/CustomerJourneyTouchPointDetailPage.tsx

import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShellLayout, MetricTile, AIInsightsTile, ZipMapPlaceholder, ReportPageLayout } from "@/components/layout";
import {
  getJourneyTouchPointById,
  JourneyTouchPoint,
  JourneyZipStat,
} from "@/data/customerJourney";

type DetailTab = "summary" | "audience" | "map" | "journeys";

const CustomerJourneyTouchPointDetailPage: React.FC = () => {
  const { touchPointId } = useParams<{ touchPointId: string }>();
  const touchPoint: JourneyTouchPoint | undefined =
    touchPointId ? getJourneyTouchPointById(touchPointId) : undefined;

  const [detailTab, setDetailTab] = useState<DetailTab>("map");
  const [mapMetric, setMapMetric] = useState<"resp" | "roas">("resp");

  const zipStats: JourneyZipStat[] = touchPoint?.zipStats ?? [];
  const [activeZip, setActiveZip] = useState<string>(
    zipStats[0]?.zip ?? "94110"
  );

  if (!touchPoint) {
    return (
      <ShellLayout
        breadcrumb={[
          { label: "Home", to: "/" },
          { label: "Reports & Insights", to: "/" },
          { label: "Customer Journey", to: "/reports/customer-journey" },
          { label: "Touch point not found" },
        ]}
      >
        <div className="mt-6 text-sm text-slate-600">
          This touch point could not be found.{" "}
          <Link
            to="/reports/customer-journey"
            className="text-sky-600 hover:text-sky-700"
          >
            Back to Customer Journey
          </Link>
        </div>
      </ShellLayout>
    );
  }

  const { name, interval, channel, sent, vehicles, responseRate, roas } =
    touchPoint;

  const aiBullets = [
    `${name} currently runs at ${interval} with ${responseRate.toFixed(
      1
    )}% RESP.`,
    `This touch point generated ${vehicles.toLocaleString()} responses from ${sent.toLocaleString()} messages sent.`,
    "Use the map and audience views to see which ZIPs and segments respond best.",
  ];

  const activeZipStat: JourneyZipStat | undefined =
    zipStats.find((z) => z.zip === activeZip) || zipStats[0];

  return (
    <ShellLayout
      breadcrumb={[
        { label: "Home", to: "/" },
        { label: "Reports & Insights", to: "/" },
        { label: "Customer Journey", to: "/reports/customer-journey" },
        { label: name },
      ]}
      rightInfo={
        <>
          <span>
            Store group: <span className="font-medium">North Bay Group</span>
          </span>
          <span>
            Period: <span className="font-medium">Last 12 months</span>
          </span>
        </>
      }
    >
      {/* Header uses touch point name */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            {name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Map, audience and journey context for this touch point.
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {interval} · {channel}
          </p>
        </div>
      </div>

      {/* Main content */}
      <ReportPageLayout
        kpis={
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricTile label="Msgs sent" value={sent.toLocaleString()} />
            <MetricTile label="Responses" value={vehicles.toLocaleString()} />
            <MetricTile label="Resp %" value={`${responseRate.toFixed(1)}%`} />
            <MetricTile label="ROAS" value={`${roas.toFixed(1)}x`} />
          </div>
        }
        ai={
          <AIInsightsTile
            title="AI Insights"
            subtitle="Based on this touch point"
            bullets={aiBullets}
          />
        }
        mobileAiPlacement="top"
      >
        {/* Main detail card with tabs */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {name} detail
              </h2>
              <p className="text-[11px] text-slate-600">
                Use Summary, Audience and Map views to see where this touch
                point is working best.
              </p>
            </div>

            {/* Tile-level tabs */}
            <div className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-1 py-0.5 text-[11px] text-slate-600">
              {(["summary", "audience", "map", "journeys"] as DetailTab[]).map(
                (tab) => {
                  const label =
                    tab === "summary"
                      ? "Summary"
                      : tab === "audience"
                      ? "Audience"
                      : tab === "map"
                      ? "Map"
                      : "Journeys";
                  const isActive = detailTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setDetailTab(tab)}
                      className={`px-3 py-1 rounded-full transition-colors ${
                        isActive
                          ? "bg-white shadow-sm text-slate-900"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {label}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* CONTENT: Summary / Audience / Map / Journeys */}
          {detailTab === "summary" && (
            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Summary view will highlight how {name.toLowerCase()} performs
                vs. other touch points, including lift by channel mix and
                customer segment.
              </p>
              <p className="text-[11px] text-slate-500">
                (Placeholder copy – ready for future charts and tables.)
              </p>
            </div>
          )}

          {detailTab === "audience" && (
            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Audience view will break out performance by customer cohort –
                for example loyalty, vehicle age and visit frequency.
              </p>
              <p className="text-[11px] text-slate-500">
                (Placeholder copy – plug audience tables/charts in here.)
              </p>
            </div>
          )}

          {detailTab === "journeys" && (
            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Journeys view will show how customers move from this touch
                point into later reminders, Suggested Services and
                reactivation.
              </p>
              <p className="text-[11px] text-slate-500">
                (Placeholder copy – ready for future flow diagrams.)
              </p>
            </div>
          )}

          {detailTab === "map" && (
            <div className="space-y-4">
              {/* Map tile */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 shadow-sm">
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <button className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm">
                    Map:{" "}
                    {mapMetric === "resp"
                      ? "RESP % by ZIP"
                      : "ROAS by ZIP"}
                  </button>

                  <div className="inline-flex items-center rounded-full bg-white/60 border border-slate-200 px-1 py-0.5 text-[11px] text-slate-600">
                    <button
                      type="button"
                      onClick={() => setMapMetric("resp")}
                      className={`px-3 py-1 rounded-full transition-colors ${
                        mapMetric === "resp"
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      RESP %
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapMetric("roas")}
                      className={`px-3 py-1 rounded-full transition-colors ${
                        mapMetric === "roas"
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      ROAS
                    </button>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1">
                  <div className="flex flex-col md:flex-row gap-3">
                    {/* Channel legend */}
                    <div className="md:w-40">
                      <div className="inline-flex flex-col rounded-2xl bg-white border border-slate-200 px-3 py-3 text-[11px] text-slate-600 shadow-sm">
                        <div className="text-[11px] font-semibold text-slate-700 mb-1">
                          Channel legend
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="h-2 w-2 rounded-full bg-sky-400" />
                          <span>Postcard</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          <span>Email</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-indigo-400" />
                          <span>Text</span>
                        </div>
                      </div>
                    </div>

                    {/* Map image */}
                    <div className="flex-1">
                      <ZipMapPlaceholder />
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-slate-500 text-center">
                    Google Map placeholder – tile ready for integration.
                  </p>
                </div>
              </div>

              {/* ZIP selector + detail card */}
              {zipStats.length > 0 && activeZipStat && (
                <>
                  {/* ZIP pills */}
                  <div className="flex flex-wrap gap-2">
                    {zipStats.map((z) => {
                      const isActive = z.zip === activeZipStat.zip;
                      return (
                        <button
                          key={z.zip}
                          type="button"
                          onClick={() => setActiveZip(z.zip)}
                          className={`px-3 py-1 rounded-full border text-[11px] transition-colors ${
                            isActive
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {z.zip}
                        </button>
                      );
                    })}
                  </div>

                  {/* ZIP details */}
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          ZIP {activeZipStat.zip}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {activeZipStat.city}, {activeZipStat.state}
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500">
                          Gender mix
                        </div>
                        <div className="text-xs text-slate-700">
                          {activeZipStat.genderMalePct}% male ·{" "}
                          {100 - activeZipStat.genderMalePct}% female
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-6 text-[11px] text-slate-600">
                        <div>
                          <div className="uppercase tracking-wide text-slate-500">
                            Resp %
                          </div>
                          <div className="mt-1 text-sm font-semibold text-emerald-600">
                            {activeZipStat.respPct.toFixed(1)}% RESP
                          </div>
                        </div>
                        <div>
                          <div className="uppercase tracking-wide text-slate-500">
                            Responses
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {activeZipStat.responses.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="uppercase tracking-wide text-slate-500">
                            Active customers
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {activeZipStat.activeCustomers.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="uppercase tracking-wide text-slate-500">
                            Loyal customers
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {activeZipStat.loyalCustomers.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-600">
                      <div>
                        <div className="uppercase tracking-wide text-slate-500 mb-1">
                          Vehicle age mix
                        </div>
                        {activeZipStat.vehicleAgeMix.map((bucket) => (
                          <div
                            key={bucket.label}
                            className="flex justify-between text-xs"
                          >
                            <span>{bucket.label}</span>
                            <span>{bucket.pct}%</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="uppercase tracking-wide text-slate-500 mb-1">
                          Notes
                        </div>
                        <p className="text-xs text-slate-700">
                          Use ZIP-level patterns here to tune{" "}
                          {name.toLowerCase()} offers, channel mix and future
                          one-off campaigns.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </ReportPageLayout>
    </ShellLayout>
  );
};

export default CustomerJourneyTouchPointDetailPage;