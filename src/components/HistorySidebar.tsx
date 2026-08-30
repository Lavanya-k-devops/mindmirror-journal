import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  MessageSquare, 
  Calendar, 
  Sparkles,
  Tag,
  AlertTriangle,
  X,
  MapPin,
  BrainCircuit,
  Download
} from 'lucide-react';
import type { JournalInteraction } from '../types';

interface HistorySidebarProps {
  interactions: JournalInteraction[];
  selectedId: string | null;
  onSelect: (interaction: JournalInteraction) => void;
  onNew: () => void;
  onDelete: (id: string) => Promise<void>;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenInsights: () => void;
  onOpenExport: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  interactions,
  selectedId,
  onSelect,
  onNew,
  onDelete,
  isOpenMobile,
  onCloseMobile,
  onOpenInsights,
  onOpenExport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredInteractions = interactions.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchesTitle = item.title?.toLowerCase().includes(term);
    const matchesSummary = item.summary?.toLowerCase().includes(term);
    const matchesTag = item.tags?.some((t) => t.toLowerCase().includes(term));
    const matchesMessage = item.messages?.some((m) => m.text.toLowerCase().includes(term));
    const matchesLocation = item.location?.label?.toLowerCase().includes(term);
    return matchesTitle || matchesSummary || matchesTag || matchesMessage || matchesLocation;
  });

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const confirmDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await onDelete(id);
      setDeletingId(null);
    } catch (err) {
      console.error('Failed to delete interaction:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-stone-200 bg-stone-50 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-stone-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-sm font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-stone-600" />
              <span>Journal History</span>
            </h2>
            <button
              onClick={onCloseMobile}
              className="lg:hidden rounded-lg p-1 text-stone-500 hover:bg-stone-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <button
            id="new-reflection-button"
            onClick={() => {
              onNew();
              onCloseMobile();
            }}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-stone-900 py-2.5 px-3 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Reflection</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search reflections & tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredInteractions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <Sparkles className="h-8 w-8 text-stone-300 mb-2" />
              <p className="text-xs font-medium text-stone-600">
                {searchTerm ? 'No matching entries found' : 'No reflections yet'}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                {searchTerm ? 'Try a different search word' : 'Start a new conversation to journal your thoughts.'}
              </p>
            </div>
          ) : (
            filteredInteractions.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onCloseMobile();
                  }}
                  className={`group relative flex flex-col gap-1.5 rounded-xl border p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-stone-900 bg-white shadow-xs'
                      : 'border-stone-200/80 bg-white/70 hover:border-stone-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-xs font-semibold line-clamp-1 ${
                      isSelected ? 'text-stone-900' : 'text-stone-800'
                    }`}>
                      {item.title || 'Untitled Reflection'}
                    </h3>
                    <span className="text-[10px] text-stone-400 shrink-0">
                      {formatDate(item.updatedAt)}
                    </span>
                  </div>

                  {item.summary && (
                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 mt-1 border-t border-stone-100">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="inline-flex items-center gap-1 text-[10px] text-stone-400">
                        <MessageSquare className="h-2.5 w-2.5" />
                        {item.messages.length}
                      </span>
                      {item.location && (
                        <span 
                          className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 text-[9px] font-medium text-amber-800 shrink-0"
                          title={item.location.label || `${item.location.latitude.toFixed(2)}, ${item.location.longitude.toFixed(2)}`}
                        >
                          <MapPin className="h-2.5 w-2.5 text-amber-700" />
                          <span className="truncate max-w-[65px]">{item.location.label || 'Location'}</span>
                        </span>
                      )}
                      {item.tags?.slice(0, item.location ? 1 : 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-md bg-stone-100 px-1.5 py-0.5 text-[9px] font-medium text-stone-600 truncate max-w-[80px]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-600 transition-opacity"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="p-3 border-t border-stone-200 bg-stone-100/70 space-y-1.5">
          <button
            id="sidebar-insights-button"
            onClick={() => {
              onOpenInsights();
              onCloseMobile();
            }}
            className="flex items-center justify-between w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-800 shadow-2xs hover:bg-stone-50 transition-colors cursor-pointer"
            title="View Journal Insights & Synthesis"
          >
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-3.5 w-3.5 text-amber-700" />
              <span>Theme Insights</span>
            </div>
            <span className="rounded bg-amber-100/80 px-1.5 py-0.2 text-[10px] font-semibold text-amber-900">
              AI Synthesis
            </span>
          </button>

          <button
            id="sidebar-export-button"
            onClick={() => {
              onOpenExport();
              onCloseMobile();
            }}
            className="flex items-center justify-between w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-800 shadow-2xs hover:bg-stone-50 transition-colors cursor-pointer"
            title="Export & Data Portability"
          >
            <div className="flex items-center gap-2">
              <Download className="h-3.5 w-3.5 text-stone-600" />
              <span>Export & Backup</span>
            </div>
            <span className="text-[10px] text-stone-400">
              Markdown / JSON
            </span>
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-stone-200">
              <div className="flex items-center gap-3 text-red-600 mb-3">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-sm font-bold text-stone-900">Delete Reflection?</h3>
              </div>
              <p className="text-xs text-stone-600 mb-5 leading-relaxed">
                This will permanently delete this conversation and its summary from your isolated Firestore storage. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeletingId(null)}
                  disabled={isDeleting}
                  className="rounded-lg border border-stone-200 px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(deletingId)}
                  disabled={isDeleting}
                  className="rounded-lg bg-red-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
