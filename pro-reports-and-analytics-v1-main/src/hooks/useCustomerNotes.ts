import { useCallback, useEffect, useMemo, useState } from "react";
import type { CustomerNote } from "@/components/common/CustomerNotesTile";

const STORAGE_KEY = "throttle_customer_notes_v1";
type NotesMap = Record<string, CustomerNote[]>;

function safeParse(jsonString: string | null): NotesMap {
  if (!jsonString) return {};
  try {
    const parsed = JSON.parse(jsonString) as NotesMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function readStore(): NotesMap {
  if (typeof window === "undefined") return {};
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

function writeStore(map: NotesMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function useCustomerNotes(customerId?: string) {
  const [notesMap, setNotesMap] = useState<NotesMap>({});

  useEffect(() => setNotesMap(readStore()), []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setNotesMap(readStore());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const notes = useMemo(() => {
    if (!customerId) return [];
    return notesMap[customerId] ?? [];
  }, [customerId, notesMap]);

  const addNote = useCallback(
    (note: CustomerNote) => {
      if (!customerId) return;
      setNotesMap((prev) => {
        const next: NotesMap = { ...prev, [customerId]: [note, ...(prev[customerId] ?? [])] };
        writeStore(next);
        return next;
      });
    },
    [customerId]
  );

  return { notes, addNote };
}

export default useCustomerNotes;
