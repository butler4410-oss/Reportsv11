import React from "react";
import { Download, Search, Phone, Mail, ClipboardCopy, ChevronDown, ChevronUp, Check, Car, User, MapPin, Wrench, FileText, MoreVertical, Pencil, Trash2, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ShellLayout from "@/components/layout/ShellLayout";
import AIInsightsTile from "@/components/layout/AIInsightsTile";
import ReportPageLayout from "@/components/layout/ReportPageLayout";

type SegmentKey = "active" | "retained" | "lapsed" | "inactive" | "lost";

type LaborLine = { description: string; code: string; qty: number; price: number };
type PartLine = { description: string; code: string; qty: number; price: number };
type CustomerNote = { id: string; text: string; timestamp: string };
type CustomerRecord = {
  id: string;
  customerId: string;
  name: string;
  segment: SegmentKey;
  address?: { street: string; city: string; state: string; zip: string };
  lastServiceDate: string;
  lastInvoiceNumber?: string;
  lastLocationVisited: string;
  storeCode?: string;
  phone?: string;
  email?: string;
  emailVerified?: boolean;
  licensePlate?: string;
  vehicleId?: string;
  vin?: string;
  vehicleYear?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleMileage?: number;
  totalVisits?: number;
  reminderInterval?: number;
  lastOilType?: string;
  invoiceSubtotal?: number;
  laborLines?: LaborLine[];
  partLines?: PartLine[];
  activityTimeline?: { date: string; invoiceNum: string; amount: number; mileage: number; location: string }[];
  notes?: CustomerNote[];
  preferredContact?: "Phone" | "Email";
  doNotCall?: boolean;
  emailOptIn?: boolean;
};

const SEGMENTS: Record<
  SegmentKey,
  {
    label: string;
    sub: string;
    monthsMin: number;
    monthsMax?: number;
    pillClass: string;
    tileClass: string;
  }
> = {
  active: {
    label: "Active Customers",
    sub: "0–8 months since last service",
    monthsMin: 0,
    monthsMax: 8,
    pillClass: "bg-emerald-50 text-emerald-700",
    tileClass: "bg-emerald-50/60 border-emerald-100",
  },
  retained: {
    label: "Retained Customers",
    sub: "9–12 months since last service",
    monthsMin: 9,
    monthsMax: 12,
    pillClass: "bg-sky-50 text-sky-700",
    tileClass: "bg-sky-50/60 border-sky-100",
  },
  lapsed: {
    label: "Lapsed Customers",
    sub: "13–18 months since last service",
    monthsMin: 13,
    monthsMax: 18,
    pillClass: "bg-amber-50 text-amber-700",
    tileClass: "bg-amber-50/60 border-amber-100",
  },
  inactive: {
    label: "Inactive Customers",
    sub: "19–24 months since last service",
    monthsMin: 19,
    monthsMax: 24,
    pillClass: "bg-orange-50 text-orange-700",
    tileClass: "bg-orange-50/60 border-orange-100",
  },
  lost: {
    label: "Lost Customers",
    sub: "25+ months since last service",
    monthsMin: 25,
    monthsMax: undefined,
    pillClass: "bg-rose-50 text-rose-700",
    tileClass: "bg-rose-50/60 border-rose-100",
  },
};

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function toISODateOnly(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseISODateOnly(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function subMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

function subDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

function downloadCSV(filename: string, rows: Record<string, string>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (val: string) => `"${(val ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getOilTypePillClass(oilType: string): string {
  const lower = oilType.toLowerCase();
  if (lower.includes("synthetic") || lower.includes("syn")) return "bg-emerald-50 text-emerald-700";
  if (lower.includes("high mileage")) return "bg-amber-50 text-amber-700";
  if (lower.includes("conventional")) return "bg-sky-50 text-sky-700";
  if (lower.includes("pennzoil")) return "bg-indigo-50 text-indigo-700";
  if (lower.includes("mobil")) return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

type VisitAverages = {
  avgMileageInterval: number | null;
  avgDaysBetweenVisits: number | null;
};

function computeVisitAverages(visits: { date: string; mileage: number }[]): VisitAverages {
  if (!visits || visits.length < 2) {
    return { avgMileageInterval: null, avgDaysBetweenVisits: null };
  }

  const sorted = [...visits].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const mileageDiffs: number[] = [];
  const dayDiffs: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    if (prev.mileage != null && curr.mileage != null) {
      const diff = curr.mileage - prev.mileage;
      if (diff > 0) mileageDiffs.push(diff);
    }

    const prevDate = new Date(prev.date).getTime();
    const currDate = new Date(curr.date).getTime();
    const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
    if (dayDiff > 0) dayDiffs.push(dayDiff);
  }

  const avgMileageInterval =
    mileageDiffs.length > 0
      ? mileageDiffs.reduce((s, v) => s + v, 0) / mileageDiffs.length
      : null;

  const avgDaysBetweenVisits =
    dayDiffs.length > 0
      ? dayDiffs.reduce((s, v) => s + v, 0) / dayDiffs.length
      : null;

  return { avgMileageInterval, avgDaysBetweenVisits };
}

const Pill: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}>
    {children}
  </span>
);

const SegmentTile: React.FC<{
  active?: boolean;
  title: string;
  subtitle: string;
  value: number;
  className?: string;
  onClick?: () => void;
}> = ({ active, title, subtitle, value, className, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left rounded-2xl border p-4 shadow-sm transition w-full
      ${className ?? "bg-white border-slate-200"}
      ${active ? "ring-2 ring-slate-400" : "hover:border-slate-300"}
    `}
  >
    <div className="text-[11px] font-medium text-slate-600">{title}</div>
    <div className="mt-1 text-2xl font-semibold text-slate-900 tracking-tight">{value.toLocaleString()}</div>
    <div className="mt-1 text-[11px] text-slate-500">{subtitle}</div>
  </button>
);

const CopyButton: React.FC<{
  label: string;
  disabledLabel?: string;
  icon: React.ReactNode;
  onCopy: () => void;
  disabled?: boolean;
}> = ({ label, disabledLabel, icon, onCopy, disabled }) => {
  const [copied, setCopied] = React.useState(false);

  const handleClick = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      className={`rounded-full transition-all ${
        disabled 
          ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200" 
          : copied 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
            : ""
      }`}
      onClick={handleClick}
      disabled={disabled}
    >
      {copied ? <Check className="mr-2 h-4 w-4" /> : icon}
      {disabled ? (disabledLabel ?? label) : copied ? "Copied" : label}
    </Button>
  );
};

const CustomerDetailDialog: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customer: CustomerRecord | null;
}> = ({ open, onOpenChange, customer }) => {
const [expandedInvoices, setExpandedInvoices] = React.useState<Set<number>>(new Set());
  const [newNoteText, setNewNoteText] = React.useState("");
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = React.useState("");
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [localNotes, setLocalNotes] = React.useState<CustomerNote[]>([]);
  const [notesExpanded, setNotesExpanded] = React.useState(false);

  // Sync localNotes when customer changes
  React.useEffect(() => {
    if (customer?.notes) {
      setLocalNotes(customer.notes);
    } else {
      setLocalNotes([]);
    }
    setNewNoteText("");
    setEditingNoteId(null);
  }, [customer]);

  // Generate invoice history with at least 3 invoices - must be before any early return
  const invoiceHistory = React.useMemo(() => {
    if (!customer) return [];
    const baseInvoice = parseInt(customer.lastInvoiceNumber ?? "318000");
    const baseMileage = customer.vehicleMileage ?? 45000;
    const invoices = [];
    
    for (let i = 0; i < Math.max(3, customer.totalVisits ?? 3); i++) {
      const date = new Date(parseISODateOnly(customer.lastServiceDate));
      date.setMonth(date.getMonth() - (i * 3));
      const mileage = Math.max(5000, baseMileage - (i * 3500));
      
      const laborLines: LaborLine[] = [
        { description: OIL_TYPES[i % OIL_TYPES.length], code: LABOR_CODES[i % LABOR_CODES.length], qty: 1.00, price: 49.99 + (i * 5) }
      ];
      
      const numParts = 1 + (i % 3);
      const partLines: PartLine[] = [];
      for (let p = 0; p < numParts; p++) {
        partLines.push({
          description: PART_DESCRIPTIONS[p % PART_DESCRIPTIONS.length],
          code: PART_CODES[p % PART_CODES.length],
          qty: 1 + (p % 3),
          price: 8 + (p * 4)
        });
      }

      const laborTotal = laborLines.reduce((sum, l) => sum + (l.qty * l.price), 0);
      const partsTotal = partLines.reduce((sum, p) => sum + (p.qty * p.price), 0);
      const total = laborTotal + partsTotal;

      invoices.push({
        invoiceNum: String(baseInvoice - i),
        date: toISODateOnly(date),
        mileage,
        location: customer.lastLocationVisited,
        total,
        laborLines,
        partLines,
        oilType: OIL_TYPES[i % OIL_TYPES.length]
      });
    }
    return invoices;
  }, [customer]);

  if (!customer) return null;
  const seg = SEGMENTS[customer.segment];

  const fullAddress = customer.address
    ? `${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zip}`
    : null;

  const vehicleDesc = [customer.vehicleYear, customer.vehicleMake, customer.vehicleModel].filter(Boolean).join(" ");

  const toggleInvoice = (idx: number) => {
    setExpandedInvoices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold text-slate-900">
              {customer.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Copy buttons */}
        <div className="flex flex-wrap gap-2">
          <CopyButton
            label="Copy phone"
            disabledLabel="No Phone"
            icon={<Phone className="mr-2 h-4 w-4" />}
            onCopy={() => customer.phone && navigator.clipboard.writeText(customer.phone)}
            disabled={!customer.phone}
          />
          <CopyButton
            label="Copy email"
            disabledLabel="No Email"
            icon={<Mail className="mr-2 h-4 w-4" />}
            onCopy={() => customer.email && navigator.clipboard.writeText(customer.email)}
            disabled={!customer.email}
          />
          <CopyButton
            label="Copy summary"
            icon={<ClipboardCopy className="mr-2 h-4 w-4" />}
            onCopy={() => {
              const summary = [
                `Customer: ${customer.name}`,
                `License Plate: ${customer.licensePlate ?? "—"}`,
                `Phone: ${customer.phone ?? "—"}`,
                `Email: ${customer.email ?? "—"}`,
                `Address: ${fullAddress ?? "—"}`,
                `Vehicle: ${vehicleDesc || "—"}`,
                `Last visit: ${customer.lastServiceDate}${customer.lastInvoiceNumber ? ` (Inv ${customer.lastInvoiceNumber})` : ""}`,
                `Location: ${customer.lastLocationVisited}`,
              ].join("\n");
              navigator.clipboard.writeText(summary);
            }}
          />
        </div>

        {/* Two-column layout matching reference image */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Left column - Customer Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-900 mb-3">
              <User className="h-4 w-4 text-sky-600" />
              Customer Information
            </div>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium text-slate-500">Customer ID:</span> <span className="text-sky-600">{customer.licensePlate ?? "—"}</span></div>
              <div className="text-slate-900">{customer.name}</div>
              {customer.address && (
                <>
                  <div className="text-slate-900">{customer.address.street}</div>
                  <div className="text-slate-900">{customer.address.city}, {customer.address.state} {customer.address.zip}</div>
                </>
              )}
              <div className="pt-1">
                <span className="text-slate-900">{customer.phone ?? "—"}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sky-600">{customer.email ?? "—"}</span>
                {customer.emailVerified && <Check className="h-4 w-4 text-emerald-500" />}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 mt-3">
              <Pill className={seg.pillClass}>{seg.label}</Pill>
              {customer.doNotCall && <Pill className="bg-slate-100 text-slate-700">Do not call</Pill>}
              {customer.preferredContact && (
                <Pill className="bg-slate-100 text-slate-700">Prefers {customer.preferredContact}</Pill>
              )}
            </div>
            
            {/* Visit interval stats */}
            {(() => {
              const { avgMileageInterval, avgDaysBetweenVisits } = computeVisitAverages(
                invoiceHistory.map(inv => ({ date: inv.date, mileage: inv.mileage }))
              );
              return (
                <div className="mt-3 space-y-1 text-[11px] text-slate-600">
                  {avgMileageInterval != null && avgDaysBetweenVisits != null ? (
                    <>
                      <div>
                        <span className="font-medium text-slate-700">Avg mileage interval:</span>{" "}
                        {Math.round(avgMileageInterval).toLocaleString()} miles
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Avg days between visits:</span>{" "}
                        {Math.round(avgDaysBetweenVisits)} days
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500">
                      Not enough visit history yet to calculate average mileage or days between visits.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Right column - Vehicle Info + Last Service Summary */}
          <div className="space-y-4">
            {/* Vehicle Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-900 mb-3">
                <Car className="h-4 w-4 text-sky-600" />
                Vehicle Information
              </div>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium text-slate-500">License Plate:</span> <span className="text-sky-600">{customer.licensePlate ?? "—"}</span></div>
                <div><span className="font-medium text-slate-500">VIN:</span> <span className="text-slate-900">{customer.vin ?? "(none)"}</span></div>
                <div className="text-slate-900">{vehicleDesc || "—"}</div>
              </div>
            </div>

            {/* Last Service Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-900 mb-3">
                <Wrench className="h-4 w-4 text-sky-600" />
                Last Service Summary
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium text-slate-500">Last Oil Change:</span>{" "}
                  <span className="text-amber-600">{fmtDate(parseISODateOnly(customer.lastServiceDate))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Pill className={getOilTypePillClass(customer.lastOilType ?? "Conventional")}>{customer.lastOilType ?? "Oil Change"}</Pill>
                  <span className="text-slate-500">@ {customer.vehicleMileage?.toLocaleString() ?? "—"} miles</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500">Invoice Total:</span>{" "}
                  <span className="text-slate-900">${invoiceHistory[0]?.total.toFixed(2) ?? "0.00"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Notes - moved above Activity Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
            <MessageSquare className="h-4 w-4 text-sky-600" />
            Customer Notes
          </div>
          
          {/* New Customer Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] text-slate-500 uppercase font-medium">New Customer Note</div>
              <button
                type="button"
                onClick={() => {
                  if (!newNoteText.trim()) return;
                  const newNote: CustomerNote = {
                    id: `n${Date.now()}`,
                    text: newNoteText.trim(),
                    timestamp: new Date().toISOString()
                  };
                  setLocalNotes(prev => [newNote, ...prev]);
                  setNewNoteText("");
                  console.log("Saved new note:", newNote);
                }}
                className="rounded-full bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 px-3 py-1 text-xs"
              >
                Save
              </button>
            </div>
            <textarea
              className="w-full min-h-[80px] text-sm text-slate-900 border border-slate-200 rounded-lg p-2 resize-y focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add a new note about this customer..."
            />
            {/* Quick note buttons */}
            <div className="flex flex-wrap gap-2 mt-2">
              {["Scheduled appointment", "No answer", "Left VM", "Not interested"].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setNewNoteText(`${label}: `)}
                  className="rounded-full bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 px-3 py-1 text-[11px]"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* All Customer Notes - collapsible */}
          {localNotes.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setNotesExpanded(!notesExpanded)}
                className="flex items-center gap-2 text-[11px] text-slate-500 uppercase font-medium hover:text-slate-700 transition-colors"
              >
                All Customer Notes ({localNotes.length})
                {notesExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              {notesExpanded && (
                <div className="space-y-2 mt-2">
                  {localNotes.map((note) => (
                    <div key={note.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      {editingNoteId === note.id ? (
                        <div className="space-y-2">
                          <textarea
                            className="w-full min-h-[60px] text-sm text-slate-900 border border-slate-200 rounded-lg p-2 resize-y focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setLocalNotes(prev => prev.map(n => n.id === note.id ? { ...n, text: editingNoteText.trim() } : n));
                                setEditingNoteId(null);
                              }}
                              className="rounded-full bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 px-3 py-1 text-xs"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="rounded-full bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 px-3 py-1 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-sm text-slate-900">{note.text}</div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {new Date(note.timestamp).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit"
                              })}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button type="button" className="p-1 hover:bg-slate-200 rounded">
                                <MoreVertical className="h-4 w-4 text-slate-400" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setEditingNoteText(note.text);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteConfirmId(note.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-900 mb-2">
            <MapPin className="h-4 w-4 text-sky-600" />
            Activity Timeline
          </div>
          <div className="text-[11px] text-slate-500 mb-3">Click on an invoice to see more details.</div>
          
          <div className="space-y-2">
            {invoiceHistory.map((invoice, idx) => {
              const isExpanded = expandedInvoices.has(idx);
              return (
                <div key={idx} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleInvoice(idx)}
                    className="w-full flex items-center px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-sm min-w-[100px]">
                      <FileText className="h-4 w-4 text-sky-600" />
                      <span className="text-slate-900">{fmtDate(parseISODateOnly(invoice.date))}</span>
                    </div>
                    <div className="flex-1 grid grid-cols-4 gap-2 text-sm">
                      <span>
                        <span className="text-slate-500">Inv #:</span>{" "}
                        <span className="text-sky-600">{invoice.invoiceNum}</span>
                      </span>
                      <span>
                        <span className="text-slate-500">Mileage:</span>{" "}
                        <span className="text-teal-600">{invoice.mileage.toLocaleString()}</span>
                      </span>
                      <span>
                        <span className="text-slate-500">Total:</span>{" "}
                        <span className="text-slate-900">${invoice.total.toFixed(2)}</span>
                      </span>
                      <span className="flex justify-end">
                        <Pill className={getOilTypePillClass(invoice.oilType)}>{invoice.oilType.split(" ").slice(-2).join(" ")}</Pill>
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 ml-2" />
                    )}
                  </button>
                  {/* Labor and Parts details - only when expanded */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-3 space-y-4 border-t border-slate-100">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500 uppercase mb-2">Labor</div>
                        <div className="grid grid-cols-3 text-[11px] text-slate-500 font-medium border-b border-slate-200 pb-1 mb-1">
                          <span>Description</span>
                          <span className="text-center">Quantity</span>
                          <span className="text-right">Price</span>
                        </div>
                        {invoice.laborLines.map((l, li) => (
                          <div key={li} className="grid grid-cols-3 text-sm py-0.5 items-center">
                            <span className="flex items-center gap-2">
                              <Pill className={getOilTypePillClass(l.description)}>{l.description}</Pill>
                            </span>
                            <span className="text-sky-600 text-center">{l.qty.toFixed(2)}</span>
                            <span className="text-slate-900 text-right">${l.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500 uppercase mb-2">Parts</div>
                        <div className="grid grid-cols-3 text-[11px] text-slate-500 font-medium border-b border-slate-200 pb-1 mb-1">
                          <span>Description</span>
                          <span className="text-center">Quantity</span>
                          <span className="text-right">Price</span>
                        </div>
                        {invoice.partLines.map((p, pi) => (
                          <div key={pi} className="grid grid-cols-3 text-sm py-0.5">
                            <span className="text-amber-600">{p.description}</span>
                            <span className="text-sky-600 text-center">{p.qty.toFixed(2)}</span>
                            <span className="text-slate-900 text-right">${p.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>


        {/* Delete confirmation dialog */}
        <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this note?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The note will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteConfirmId) {
                    setLocalNotes(prev => prev.filter(n => n.id !== deleteConfirmId));
                  }
                  setDeleteConfirmId(null);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

// Helper to generate mock customers
const FIRST_NAMES = ["Bob", "Jane", "Sarah", "Michael", "Emily", "David", "Lisa", "James", "Maria", "John", "Ashley", "Robert", "Jennifer", "William", "Linda", "Christopher", "Barbara", "Daniel", "Elizabeth", "Matthew", "Susan", "Anthony", "Jessica", "Mark", "Karen"];
const LAST_NAMES = ["GoodFellow", "Driver", "Mitchell", "Torres", "Chen", "Williams", "Johnson", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson"];
const LOCATIONS = ["Vallejo, CA", "Napa, CA", "Fairfield, CA", "Benicia, CA", "American Canyon, CA", "Vacaville, CA"];
const STORE_CODES = ["7040", "7041", "7042", "7043", "7044", "7045"];
const STREETS = ["106 Maher Ct", "234 Main St", "567 Oak Ave", "890 Pine Rd", "123 Elm Blvd", "456 Cedar Ln"];
const OIL_TYPES = ["Chevron High Mileage", "Pennzoil Synthetic", "Valvoline Conventional", "Mobil 1 Full Synthetic", "Castrol GTX"];
const VEHICLE_MAKES = ["ACURA", "HONDA", "TOYOTA", "FORD", "CHEVROLET", "BMW", "NISSAN", "SUBARU"];
const VEHICLE_MODELS = ["ACCORD", "CIVIC", "CAMRY", "F-150", "MALIBU", "3-SERIES", "ALTIMA", "OUTBACK"];
const LABOR_CODES = ["Chevron High Mileage", "Pennzoil Platinum", "Valvoline MaxLife", "Mobil 1 Extended"];
const PART_DESCRIPTIONS = ["Oil Filter", "Air Filter", "Cabin Filter", "Wiper Blades", "Drain Plug Gasket"];
const PART_CODES = ["OF4459", "AF2341", "CF8899", "WB1234", "DPG567"];

const DEMO_NOTES = [
  "Customer prefers morning appointments.",
  "Left voicemail, will call back tomorrow.",
  "Requested synthetic oil upgrade on next visit.",
  "Mentioned car making squeaking noise - check brakes.",
  "Wife usually brings in the car.",
  "Prefers text message reminders over phone calls.",
  "Asked about fleet pricing for business vehicles.",
  "Customer travels frequently, flexible scheduling needed.",
  "Referred by neighbor - gave 10% discount coupon.",
  "Vehicle has aftermarket exhaust - note for future reference.",
];

function generateDemoNotes(): CustomerNote[] {
  const noteCount = 2 + Math.floor(Math.random() * 4); // 2-5 notes
  const notes: CustomerNote[] = [];
  const shuffled = [...DEMO_NOTES].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < noteCount; i++) {
    const daysAgo = Math.floor(Math.random() * 180) + 1;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
    
    notes.push({
      id: `n${i + 1}`,
      text: shuffled[i % shuffled.length],
      timestamp: date.toISOString()
    });
  }
  
  return notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateMockCustomers(): CustomerRecord[] {
  const customers: CustomerRecord[] = [];
  const segmentCounts: Record<SegmentKey, number> = {
    active: Math.floor(Math.random() * 8) + 12, // 12-19
    retained: Math.floor(Math.random() * 6) + 8, // 8-13
    lapsed: Math.floor(Math.random() * 5) + 6,  // 6-10
    inactive: Math.floor(Math.random() * 4) + 4, // 4-7
    lost: Math.floor(Math.random() * 5) + 5,    // 5-9
  };

  let id = 1;
  const now = new Date();

  (Object.keys(segmentCounts) as SegmentKey[]).forEach((segment) => {
    const count = segmentCounts[segment];
    const seg = SEGMENTS[segment];

    for (let i = 0; i < count; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const name = `${firstName} ${lastName}`;
      const customerId = `CA-${firstName.toUpperCase()}${lastName.toUpperCase()}`;
      
      // Calculate a date within the segment's range
      const minMonths = seg.monthsMin;
      const maxMonths = seg.monthsMax ?? 36;
      const monthsAgo = minMonths + Math.floor(Math.random() * (maxMonths - minMonths + 1));
      const lastDate = new Date(now);
      lastDate.setMonth(lastDate.getMonth() - monthsAgo);
      lastDate.setDate(Math.floor(Math.random() * 28) + 1);

      const hasPhone = Math.random() > 0.15;
      const hasEmail = Math.random() > 0.1;
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const storeCode = STORE_CODES[Math.floor(Math.random() * STORE_CODES.length)];
      const vehicleYear = 2000 + Math.floor(Math.random() * 24);
      const vehicleMake = VEHICLE_MAKES[Math.floor(Math.random() * VEHICLE_MAKES.length)];
      const vehicleModel = VEHICLE_MODELS[Math.floor(Math.random() * VEHICLE_MODELS.length)];
      const vehicleMileage = 15000 + Math.floor(Math.random() * 135000); // Cap at 150K
      
      // Generate realistic CA license plate format: 7ABC123 or 8XYZ456
      const plateNum = Math.floor(Math.random() * 10);
      const plateLetters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                          String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                          String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const plateDigits = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
      const licensePlate = `${plateNum}${plateLetters}${plateDigits}`;
      const invoiceSubtotal = 50 + Math.floor(Math.random() * 150);
      const oilType = OIL_TYPES[Math.floor(Math.random() * OIL_TYPES.length)];

      // Generate labor and parts
      const laborLines: LaborLine[] = [
        { description: oilType, code: LABOR_CODES[Math.floor(Math.random() * LABOR_CODES.length)], qty: 1.00, price: 49.99 + Math.floor(Math.random() * 30) }
      ];
      
      const numParts = 1 + Math.floor(Math.random() * 3);
      const partLines: PartLine[] = [];
      for (let p = 0; p < numParts; p++) {
        partLines.push({
          description: PART_DESCRIPTIONS[p % PART_DESCRIPTIONS.length],
          code: PART_CODES[p % PART_CODES.length],
          qty: 1 + Math.floor(Math.random() * 5),
          price: 4 + Math.floor(Math.random() * 15)
        });
      }

      customers.push({
        id: `c${id++}`,
        customerId,
        name,
        segment,
        address: {
          street: STREETS[Math.floor(Math.random() * STREETS.length)],
          city: location.split(", ")[0],
          state: "CA",
          zip: String(94500 + Math.floor(Math.random() * 100))
        },
        lastServiceDate: toISODateOnly(lastDate),
        lastInvoiceNumber: String(318000 + Math.floor(Math.random() * 1000)),
        lastLocationVisited: location,
        storeCode,
        phone: hasPhone ? `(${String(Math.floor(Math.random() * 900) + 100)}) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}` : undefined,
        email: hasEmail ? `${firstName.toLowerCase()}${lastName.toLowerCase().charAt(0)}${Math.floor(Math.random() * 100)}@${["gmail.com", "yahoo.com", "hotmail.com"][Math.floor(Math.random() * 3)]}` : undefined,
        emailVerified: hasEmail && Math.random() > 0.3,
        licensePlate,
        vehicleId: licensePlate,
        vin: `1HGBH41JXMN${String(Math.floor(Math.random() * 100000)).padStart(6, "0")}`,
        vehicleYear,
        vehicleMake,
        vehicleModel: `${vehicleModel} ${["LX", "EX", "SE", "Limited"][Math.floor(Math.random() * 4)]}`,
        vehicleMileage,
        totalVisits: Math.floor(Math.random() * 15) + 1,
        reminderInterval: [60, 90, 120][Math.floor(Math.random() * 3)],
        lastOilType: oilType,
        invoiceSubtotal,
        laborLines,
        partLines,
        notes: generateDemoNotes(),
        preferredContact: Math.random() > 0.5 ? "Phone" : "Email",
        emailOptIn: Math.random() > 0.2,
        doNotCall: Math.random() > 0.95,
      });
    }
  });

  return customers;
}

const mockCustomers = generateMockCustomers();

type SortKey = "name" | "lastServiceDate" | "location" | "phone" | "email";
type SortDir = "asc" | "desc";

export default function CallbackReportPage() {
  const [selectedSegment, setSelectedSegment] = React.useState<SegmentKey>("lost");
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const [search, setSearch] = React.useState("");
  const [onlyReachable, setOnlyReachable] = React.useState(true);
  const [sortKey, setSortKey] = React.useState<SortKey>("lastServiceDate");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerRecord | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);
  const [customDateMode, setCustomDateMode] = React.useState(false);

  React.useEffect(() => {
    if (customDateMode) return; // Don't auto-update dates when in custom mode
    const now = new Date();
    const seg = SEGMENTS[selectedSegment];
    const end = subMonths(now, seg.monthsMin);
    const start = seg.monthsMax === undefined ? undefined : subMonths(now, seg.monthsMax);
    setEndDate(toISODateOnly(end));
    setStartDate(start ? toISODateOnly(start) : "");
    setShowAll(false); // Reset to collapsed when segment changes
  }, [selectedSegment, customDateMode]);

  const handleSegmentClick = (k: SegmentKey) => {
    setCustomDateMode(false);
    setSelectedSegment(k);
  };

  const handleProcessCustomDates = () => {
    setCustomDateMode(true);
    setShowAll(false);
  };

  const counts = React.useMemo(() => {
    const base = { active: 0, retained: 0, lapsed: 0, inactive: 0, lost: 0 } as Record<SegmentKey, number>;
    mockCustomers.forEach((c) => (base[c.segment] += 1));
    return base;
  }, []);

  const filtered = React.useMemo(() => {
    const s = startDate ? parseISODateOnly(startDate) : null;
    const e = endDate ? parseISODateOnly(endDate) : null;

    const inRange = (last: Date) => {
      if (!e) return true;
      if (!s) return last.getTime() <= e.getTime();
      return last.getTime() >= s.getTime() && last.getTime() <= e.getTime();
    };

    return mockCustomers
      .filter((c) => customDateMode ? true : c.segment === selectedSegment)
      .filter((c) => {
        if (!onlyReachable) return true;
        return Boolean(c.phone || c.email);
      })
      .filter((c) => {
        const last = parseISODateOnly(c.lastServiceDate);
        return inRange(last);
      })
      .filter((c) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q) ||
          (c.phone ?? "").toLowerCase().includes(q) ||
          c.lastLocationVisited.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        const get = (c: CustomerRecord) => {
          switch (sortKey) {
            case "name":
              return c.name.toLowerCase();
            case "lastServiceDate":
              return c.lastServiceDate;
            case "location":
              return c.lastLocationVisited.toLowerCase();
            case "phone":
              return (c.phone ?? "").toLowerCase();
            case "email":
              return (c.email ?? "").toLowerCase();
          }
        };
        const va = get(a);
        const vb = get(b);
        return va < vb ? -1 * dir : va > vb ? 1 * dir : 0;
      });
  }, [customDateMode, selectedSegment, startDate, endDate, search, onlyReachable, sortKey, sortDir]);

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "lastServiceDate" ? "asc" : "asc");
    }
  };

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return null;
    return <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>;
  };

  const exportRows = React.useMemo(() => {
    return filtered.map((c) => ({
      "Customer Name": c.name,
      "Cust Ph": c.phone ?? "",
      "Cust Email": c.email ?? "",
      "Last Service Date": fmtDate(parseISODateOnly(c.lastServiceDate)),
      "Last Invoice #": c.lastInvoiceNumber ?? "",
      "# of Previous Visits": String(c.totalVisits ?? 0),
      "License Plate": c.licensePlate ?? "",
      "Last Location Visited": c.lastLocationVisited,
    }));
  }, [filtered]);

  const selectedSeg = SEGMENTS[selectedSegment];

  return (
    <ShellLayout breadcrumb={[{ label: "Home", to: "/" }, { label: "Callback Report" }]}>
      {/* Header - outside the grid */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Callback Report</h1>
        <p className="mt-1 text-sm text-slate-600">
          Click a colored database segment below to pull customer information or choose a custom date range.
        </p>
      </div>

      {/* Main content */}
      <ReportPageLayout
        kpis={
          <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
            {(Object.keys(SEGMENTS) as SegmentKey[]).map((k) => (
              <SegmentTile
                key={k}
                active={!customDateMode && selectedSegment === k}
                title={SEGMENTS[k].label}
                subtitle={SEGMENTS[k].sub}
                value={counts[k]}
                className={`border ${SEGMENTS[k].tileClass}`}
                onClick={() => handleSegmentClick(k)}
              />
            ))}
          </div>
        }
        ai={
          <AIInsightsTile
            bullets={[
              "Lost customers represent 20% of your database—prioritize callback campaigns.",
              "Customers with email have 3× higher reactivation rate than phone-only.",
              "Lapsed segment shows highest callback conversion potential.",
            ]}
          />
        }
        mobileAiPlacement="top"
      >
        {/* Segment mix visualization */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[13px] font-semibold text-slate-900">Mix by segment</div>
          <div className="text-[11px] text-slate-500">% of customers by recency</div>
          
          {/* Stacked bar */}
          <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full">
            {(Object.keys(SEGMENTS) as SegmentKey[]).map((k) => {
              const total = Object.values(counts).reduce((sum, v) => sum + v, 0);
              const pct = total > 0 ? (counts[k] / total) * 100 : 0;
              const barColors: Record<SegmentKey, string> = {
                active: "bg-emerald-200",
                retained: "bg-sky-200",
                lapsed: "bg-amber-200",
                inactive: "bg-orange-200",
                lost: "bg-rose-200",
              };
              return (
                <div
                  key={k}
                  className={`${barColors[k]} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            {(Object.keys(SEGMENTS) as SegmentKey[]).map((k) => {
              const total = Object.values(counts).reduce((sum, v) => sum + v, 0);
              const pct = total > 0 ? (counts[k] / total) * 100 : 0;
              const dotColors: Record<SegmentKey, string> = {
                active: "bg-emerald-200",
                retained: "bg-sky-200",
                lapsed: "bg-amber-200",
                inactive: "bg-orange-200",
                lost: "bg-rose-200",
              };
              return (
                <div key={k} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className={`h-2 w-2 rounded-full ${dotColors[k]}`} />
                  {SEGMENTS[k].label.replace(" Customers", "")} · {pct.toFixed(0)}%
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls row */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="text-[13px] font-semibold text-slate-900">Custom date range</div>
          
          {/* First row: Start date, End date, Process button, Checkbox */}
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <div className="text-[11px] font-medium text-slate-500 mb-1">Start date</div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[150px] rounded-xl"
                placeholder="(optional)"
              />
            </div>

            <div>
              <div className="text-[11px] font-medium text-slate-500 mb-1">End date</div>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[150px] rounded-xl"
              />
            </div>

            <Button
              className="rounded-full bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              variant="ghost"
              onClick={handleProcessCustomDates}
            >
              Process
            </Button>

            <div className="flex items-center gap-2">
              <input
                id="reachable"
                type="checkbox"
                checked={onlyReachable}
                onChange={(e) => setOnlyReachable(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-600"
              />
              <label htmlFor="reachable" className="text-[11px] text-teal-600">
                Only show customers with phone or email
              </label>
          </div>

            <div className="flex items-center gap-3">
              {customDateMode ? (
                <Pill className="bg-indigo-50 text-indigo-700">Custom Dates</Pill>
              ) : (
                <Pill className={selectedSeg.pillClass}>{selectedSeg.label}</Pill>
              )}
              <Button
                className="rounded-full bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                variant="ghost"
                onClick={() => downloadCSV(`callback-report-${selectedSegment}-${endDate}.csv`, exportRows)}
                disabled={!exportRows.length}
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Customers table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* LEFT: title + subtitle */}
            <div>
              <div className="text-[13px] font-semibold text-slate-900">Customers to call back</div>
              <div className="text-[11px] text-slate-500">
                Click any row for last-visit details, notes, invoice items and coupons.
              </div>
            </div>

            {/* RIGHT: search + Show all */}
            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
              {/* Search bar */}
              <div className="md:w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 rounded-xl"
                    placeholder="Name, email, phone, location..."
                  />
                </div>
              </div>

              {/* Show all button */}
              {filtered.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="self-end inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors md:self-auto"
                >
                  {showAll ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {showAll ? "Show less" : `Show all ${filtered.length}`}
                </button>
              )}
            </div>
          </header>

          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-xs table-fixed">
              <colgroup>
                <col className="w-[35%]" />
                <col className="w-[22%]" />
                <col className="w-[22%]" />
                <col className="w-[21%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-200 bg-white text-[11px] text-slate-500">
                  <th className="px-4 py-3 text-left font-medium">
                    <button type="button" onClick={() => onSort("name")} className="hover:text-slate-700">
                      Customer name{sortArrow("name")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    <button type="button" onClick={() => onSort("lastServiceDate")} className="hover:text-slate-700">
                      Last service{sortArrow("lastServiceDate")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    <button type="button" onClick={() => onSort("location")} className="hover:text-slate-700">
                      Last loc visited{sortArrow("location")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    <button type="button" onClick={() => onSort("phone")} className="hover:text-slate-700">
                      Cust ph{sortArrow("phone")}
                    </button>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {(showAll ? filtered : filtered.slice(0, 5)).map((c) => {
                  const seg = SEGMENTS[c.segment];
                  const last = fmtDate(parseISODateOnly(c.lastServiceDate));
                  const missingPhone = !c.phone;
                  const missingEmail = !c.email;

                  return (
                    <tr
                      key={c.id}
                      className="cursor-pointer bg-white hover:bg-slate-50"
                      onClick={() => {
                        setSelectedCustomer(c);
                        setDetailOpen(true);
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-semibold text-slate-900">{c.name}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <Pill className={seg.pillClass}>{seg.label.replace(" Customers", "")}</Pill>
                          {missingPhone && <Pill className="bg-slate-100 text-slate-700">Phone missing</Pill>}
                          {missingEmail && <Pill className="bg-slate-100 text-slate-700">Email missing</Pill>}
                          {c.doNotCall && <Pill className="bg-slate-100 text-slate-700">Do not call</Pill>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-900 whitespace-nowrap">
                        <div className="font-medium">{last}</div>
                        <div className="text-[11px] text-slate-500">
                          {c.lastInvoiceNumber ? `Inv ${c.lastInvoiceNumber}` : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-900 truncate">{c.lastLocationVisited}</td>
                      <td className="px-4 py-3 text-right text-slate-900 truncate">{c.phone ?? "—"}</td>
                    </tr>
                  );
                })}

                {!filtered.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                      No customers match this timeframe and filter selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>


        <CustomerDetailDialog open={detailOpen} onOpenChange={setDetailOpen} customer={selectedCustomer} />
      </ReportPageLayout>
    </ShellLayout>
  );
}
