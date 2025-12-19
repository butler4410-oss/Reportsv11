import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface ShellLayoutProps {
  breadcrumb: BreadcrumbItem[];
  rightInfo?: React.ReactNode;
  children: React.ReactNode;
}

const ShellLayout: React.FC<ShellLayoutProps> = ({
  breadcrumb,
  rightInfo,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-400">/</span>}
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className={
                      idx === breadcrumb.length - 1
                        ? "font-medium text-slate-700"
                        : "text-slate-400 hover:text-slate-600"
                    }
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={
                      idx === breadcrumb.length - 1
                        ? "font-medium text-slate-700"
                        : "text-slate-400"
                    }
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {rightInfo}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
          {/* Left-aligned content with a pleasant max width */}
          <div className="w-full max-w-6xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShellLayout;
