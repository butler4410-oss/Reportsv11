import React, { useMemo, useRef, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type CustomerNote = {
  id: string;
  text: string;
  createdAt: string; // ISO string
};

type QuickTag = {
  id: string;
  label: string;
  className: string;
};

const QUICK_TAGS: QuickTag[] = [
  {
    id: "successful_call",
    label: "Successful call",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  {
    id: "no_answer",
    label: "No answer",
    className: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
  },
  {
    id: "left_vm",
    label: "Left VM",
    className: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
  },
  {
    id: "not_interested",
    label: "Not interested",
    className: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  },
];

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makeId() {
  // Browser-safe UUID fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyCrypto: any = typeof crypto !== "undefined" ? crypto : null;
  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();
  return `note_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

type CustomerNotesTileProps = {
  notes: CustomerNote[];
  onAddNote: (note: CustomerNote) => void;
};

const CustomerNotesTile: React.FC<CustomerNotesTileProps> = ({ notes, onAddNote }) => {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const prefixRegex = useMemo(() => {
    const labels = QUICK_TAGS.map((t) => escapeRegex(t.label)).join("|");
    return new RegExp(`^(${labels}):\\s*`, "i");
  }, []);

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [notes]);

  // Quick buttons ONLY prefill the textarea with "Label: " (no auto-save)
  const applyQuickTag = (label: string) => {
    setDraft((prev) => {
      const rest = prev.replace(prefixRegex, "");
      return `${label}: ${rest}`.replace(/:\s*$/, ": ");
    });

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      // optional: move cursor to end
      const el = textareaRef.current;
      if (el) {
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
    });
  };

  const saveNote = () => {
    const cleaned = draft.trim();
    if (!cleaned) return;

    onAddNote({
      id: makeId(),
      text: cleaned,
      createdAt: new Date().toISOString(),
    });

    setDraft("");
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-slate-600" />
          <div className="text-sm font-semibold text-slate-900">Customer Notes</div>
        </div>
        <Button size="sm" variant="outline" onClick={saveNote}>
          Save
        </Button>
      </div>

      <div className="mt-3">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">New customer note</div>
        <Textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a new note about this customer..."
          className="mt-2 min-h-[92px]"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_TAGS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rounded-full border px-3 py-1 text-[11px] font-medium ${t.className}`}
            onClick={() => applyQuickTag(t.label)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-500">
          <span>All customer notes ({sortedNotes.length})</span>
        </div>

        <div className="mt-2 space-y-2">
          {sortedNotes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-500">
              No notes yet.
            </div>
          ) : (
            sortedNotes.map((n) => (
              <div key={n.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-sm font-medium text-slate-900">{n.text}</div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerNotesTile;
