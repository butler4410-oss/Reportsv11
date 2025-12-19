import { useEffect, useState } from "react";

export interface KpiOption {
  id: string;
  label: string;
}

const STORAGE_PREFIX = "kpiPrefs:";

export function useKpiPreferences(reportId: string, options: KpiOption[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return options.map((o) => o.id);

    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + reportId);
      if (!raw) return options.map((o) => o.id);

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return options.map((o) => o.id);

      const validSet = new Set(options.map((o) => o.id));
      const filtered = (parsed as string[]).filter((id) => validSet.has(id));
      return filtered;
    } catch {
      return options.map((o) => o.id);
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_PREFIX + reportId,
        JSON.stringify(selectedIds)
      );
    } catch {
      // ignore storage errors
    }
  }, [reportId, selectedIds]);

  return { selectedIds, setSelectedIds };
}
