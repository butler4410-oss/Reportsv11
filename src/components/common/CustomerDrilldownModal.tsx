import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CustomerNotesTile from "@/components/common/CustomerNotesTile";
import useCustomerNotes from "@/hooks/useCustomerNotes";

export type CustomerDrilldown = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  licensePlate?: string;

  lastServiceDate?: string;
  lastInvoiceNumber?: string;
  lastLocationVisited?: string;

  totalVisits?: number;
  lastVisitServices?: string;

  couponsApplied?: string[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerDrilldown | null;
};

const pillBase =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium";

function ContactPills({ customer }: { customer: CustomerDrilldown }) {
  const missingPhone = !customer.phone || customer.phone.trim() === "—";
  const missingEmail = !customer.email || customer.email.trim() === "—";

  return (
    <div className="flex flex-wrap gap-2">
      {missingPhone ? (
        <span className={pillBase + " border-rose-200 bg-rose-50 text-rose-700"}>Phone missing</span>
      ) : (
        <span className={pillBase + " border-emerald-200 bg-emerald-50 text-emerald-700"}>Phone on file</span>
      )}
      {missingEmail ? (
        <span className={pillBase + " border-rose-200 bg-rose-50 text-rose-700"}>Email missing</span>
      ) : (
        <span className={pillBase + " border-emerald-200 bg-emerald-50 text-emerald-700"}>Email on file</span>
      )}
    </div>
  );
}

const CustomerDrilldownModal: React.FC<Props> = ({ open, onOpenChange, customer }) => {
  const { notes, addNote } = useCustomerNotes(customer?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-2xl p-0">
        {customer ? (
          <>
            <DialogHeader className="border-b border-slate-200 px-4 py-3">
              <DialogTitle className="text-sm font-semibold text-slate-900">
                Customer details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 px-4 py-4 text-xs text-slate-800">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Customer name
                  </div>
                  <div className="text-base font-semibold text-slate-900">{customer.name}</div>
                </div>
                <ContactPills customer={customer} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Phone</div>
                  <div className="text-sm text-slate-900">{customer.phone ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Email</div>
                  <div className="text-sm text-emerald-700 underline">{customer.email ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">License plate</div>
                  <div className="text-sm text-slate-900">{customer.licensePlate ?? "—"}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Last service</div>
                  <div className="text-sm text-slate-900">{customer.lastServiceDate ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Last invoice #</div>
                  <div className="text-sm text-slate-900">{customer.lastInvoiceNumber ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Last location visited</div>
                  <div className="text-sm text-slate-900">{customer.lastLocationVisited ?? "—"}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Total visits</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {typeof customer.totalVisits === "number" ? customer.totalVisits.toLocaleString() : "—"}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Services performed at last visit
                  </div>
                  <div className="mt-1 text-xs leading-snug text-slate-800">
                    {customer.lastVisitServices ?? "—"}
                  </div>
                </div>
              </div>

              {customer.couponsApplied?.length ? (
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Coupons applied</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {customer.couponsApplied.map((c) => (
                      <span key={c} className={pillBase + " border-sky-200 bg-sky-50 text-sky-800"}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="px-4 pb-4">
              <CustomerNotesTile notes={notes} onAddNote={addNote} />
            </div>
          </>
        ) : (
          <div className="px-4 py-6 text-sm text-slate-600">No customer selected.</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDrilldownModal;
