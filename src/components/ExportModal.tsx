import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Archive, 
  Code, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Lock
} from 'lucide-react';
import type { JournalInteraction } from '../types';
import { 
  exportSingleInteractionAsMarkdown, 
  exportAllInteractionsAsMarkdownArchive, 
  exportAllInteractionsAsJson 
} from '../lib/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInteraction: JournalInteraction | null;
  allInteractions: JournalInteraction[];
  userEmail?: string | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  currentInteraction,
  allInteractions,
  userEmail,
}) => {
  const [downloadedAction, setDownloadedAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerDownload = (actionKey: string, fn: () => void) => {
    fn();
    setDownloadedAction(actionKey);
    setTimeout(() => setDownloadedAction(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-stone-900">
                Export & Data Portability Center
              </h2>
              <p className="text-xs text-stone-500">
                Own your data. Export individual entries or your entire journal archive.
              </p>
            </div>
          </div>

          <button
            id="close-export-modal-button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200/70 hover:text-stone-700 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Privacy & Zero Exfiltration Note */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 flex items-start gap-2.5 text-xs text-emerald-950">
            <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Client-Side Privacy Guarantee</p>
              <p className="mt-0.5 text-emerald-800 leading-relaxed">
                All exports are compiled directly in your browser memory. Your entries are never sent to third-party file converters or analytics servers.
              </p>
            </div>
          </div>

          {/* Option 1: Export Current Entry as Markdown */}
          {currentInteraction && (
            <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-2xs hover:border-stone-300 transition-all flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-800 shrink-0 mt-0.5">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">
                    Active Reflection (Markdown)
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Export "{currentInteraction.title}" with YAML frontmatter, transcript, and Reflection Compass.
                  </p>
                  <span className="inline-block mt-1 text-[11px] text-stone-400">
                    Format: .md • Obsidian / Notion compatible
                  </span>
                </div>
              </div>

              <button
                id="export-active-markdown-button"
                onClick={() => triggerDownload('current-md', () => exportSingleInteractionAsMarkdown(currentInteraction))}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
              >
                {downloadedAction === 'current-md' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Option 2: Export Full Journal Archive as Markdown */}
          <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-2xs hover:border-stone-300 transition-all flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-900 shrink-0 mt-0.5">
                <Archive className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  Full Journal Master Archive (Markdown)
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  All {allInteractions.length} reflections compiled into a single master journal with a clickable Table of Contents.
                </p>
                <span className="inline-block mt-1 text-[11px] text-stone-400">
                  Format: .md • Comprehensive personal journal binder
                </span>
              </div>
            </div>

            <button
              id="export-all-markdown-button"
              disabled={allInteractions.length === 0}
              onClick={() => triggerDownload('all-md', () => exportAllInteractionsAsMarkdownArchive(allInteractions, userEmail))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            >
              {downloadedAction === 'all-md' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>

          {/* Option 3: Export Raw Structured JSON Backup */}
          <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-2xs hover:border-stone-300 transition-all flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-800 shrink-0 mt-0.5">
                <Code className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  Structured JSON Database Backup
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Complete machine-readable JSON archive containing all transcripts, metadata, locations, and timestamps.
                </p>
                <span className="inline-block mt-1 text-[11px] text-stone-400">
                  Format: .json • Ideal for programmatic migrations and backups
                </span>
              </div>
            </div>

            <button
              id="export-json-backup-button"
              disabled={allInteractions.length === 0}
              onClick={() => triggerDownload('all-json', () => exportAllInteractionsAsJson(allInteractions, userEmail))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 shadow-2xs hover:bg-stone-50 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            >
              {downloadedAction === 'all-json' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>Download JSON</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 bg-stone-50 px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
