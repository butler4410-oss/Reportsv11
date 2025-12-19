import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Share2, X, FileText, Download } from "lucide-react";
import { toast } from "sonner";

export interface ShareReportContext {
  reportName: string;
  dateRangeLabel: string;
  storeCount: number;
}

interface ShareReportModalProps {
  open: boolean;
  onClose: () => void;
  context: ShareReportContext;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  open,
  onClose,
  context,
}) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [draftEmail, setDraftEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachPdf, setAttachPdf] = useState(true);
  const [includeLink, setIncludeLink] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setEmails([]);
      setDraftEmail("");
      setSubject(
        `${context.reportName} | ${context.dateRangeLabel} | ${context.storeCount} store${context.storeCount !== 1 ? "s" : ""}`
      );
      setMessage("");
      setAttachPdf(true);
      setIncludeLink(false);
      setEmailError("");
    }
  }, [open, context]);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddEmail = () => {
    const value = draftEmail.trim();
    if (!value) return;

    if (!validateEmail(value)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (emails.includes(value)) {
      setEmailError("This email is already added");
      return;
    }

    if (emails.length >= 20) {
      setEmailError("Maximum 20 recipients allowed");
      return;
    }

    setEmails((prev) => [...prev, value]);
    setDraftEmail("");
    setEmailError("");
  };

  const handleRemoveEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
    if (e.key === "Backspace" && !draftEmail && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  };

  const handleSend = async () => {
    if (!emails.length) return;

    // For now, just show a success toast since there's no backend
    toast.success(`Report shared with ${emails.length} recipient${emails.length !== 1 ? "s" : ""}`, {
      description: "Email will be sent with PDF attachment",
    });
    onClose();
  };

  const handleDownloadPdf = () => {
    // For now, just show a toast since there's no PDF generation yet
    toast.success("Downloading PDF...", {
      description: "PDF generation will be available soon",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="p-4 pb-3 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-sky-600" />
                Share {context.reportName}
              </DialogTitle>
              <p className="text-[11px] text-slate-500 mt-1">
                {context.dateRangeLabel} · {context.storeCount} store
                {context.storeCount !== 1 && "s"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Recipients */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              To
            </label>
            <div className="rounded-xl border border-slate-200 p-2 focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500">
              <div className="flex flex-wrap gap-1.5">
                {emails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="ml-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="email"
                  value={draftEmail}
                  onChange={(e) => {
                    setDraftEmail(e.target.value);
                    setEmailError("");
                  }}
                  onKeyDown={handleKeyDown}
                  onBlur={() => draftEmail && handleAddEmail()}
                  placeholder={emails.length === 0 ? "Type email and press Enter" : "Add another..."}
                  className="flex-1 min-w-[150px] border-none text-[11px] outline-none bg-transparent placeholder:text-slate-400"
                />
              </div>
            </div>
            {emailError && (
              <p className="text-[10px] text-rose-500 mt-1">{emailError}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Message <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal note to your recipients..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[11px] resize-none focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-400"
            />
          </div>

          {/* Options */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={attachPdf}
                onChange={(e) => setAttachPdf(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-[11px] text-slate-600 flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-slate-400" />
                Attach PDF snapshot of this report
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLink}
                onChange={(e) => setIncludeLink(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-[11px] text-slate-600">
                Include link to live report (if recipient has access)
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 border border-slate-200"
          >
            <Download className="h-3 w-3" />
            Download PDF
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!emails.length}
              className="rounded-full bg-sky-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Email
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Share button component for report headers
export const ShareReportButton: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
  >
    <Share2 className="h-3 w-3" />
    <span className="hidden sm:inline">Share</span>
  </button>
);

export default ShareReportModal;
