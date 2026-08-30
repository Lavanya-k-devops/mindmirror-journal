import React, { useState, useMemo } from 'react';
import { 
  X, 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  HelpCircle, 
  Compass, 
  Download, 
  Copy, 
  Check, 
  AlertCircle,
  Tag,
  Calendar,
  MessageSquare,
  FileText,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import type { JournalInteraction, JournalInsightsSynthesis, JournalStats } from '../types';
import { requestJournalInsightsSynthesis } from '../services/journalService';
import { exportInsightsSynthesisAsMarkdown } from '../lib/exportUtils';

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  interactions: JournalInteraction[];
}

export const InsightsModal: React.FC<InsightsModalProps> = ({
  isOpen,
  onClose,
  interactions,
}) => {
  const [synthesis, setSynthesis] = useState<JournalInsightsSynthesis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Compute stats client-side across the user's private reflections
  const stats: JournalStats = useMemo(() => {
    let totalMessages = 0;
    let totalWords = 0;
    let locationsCount = 0;
    let compassesCount = 0;
    const tagMap: Record<string, number> = {};

    for (const item of interactions) {
      if (item.location) locationsCount++;
      if (item.reflectionCompass) compassesCount++;
      
      for (const m of item.messages || []) {
        totalMessages++;
        totalWords += (m.text || '').split(/\s+/).filter(Boolean).length;
      }

      for (const t of item.tags || []) {
        tagMap[t] = (tagMap[t] || 0) + 1;
      }
    }

    const topTags = Object.entries(tagMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      totalReflections: interactions.length,
      totalMessages,
      totalWordsEstimated: totalWords,
      locationsCount,
      compassesCount,
      topTags,
    };
  }, [interactions]);

  if (!isOpen) return null;

  const handleGenerateSynthesis = async () => {
    if (interactions.length === 0) {
      setError('You need at least one journal reflection to synthesize insights.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await requestJournalInsightsSynthesis(interactions);
      setSynthesis(result.synthesis);
    } catch (err: any) {
      setError(err?.message || 'Failed to synthesize insights with Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!synthesis) return;
    const text = `Journal Theme & Growth Synthesis (${synthesis.timeframe})
Mindset Overview: ${synthesis.mindsetSummary}

Core Themes:
${synthesis.coreThemes.map((t) => `• ${t.theme}: ${t.description}`).join('\n')}

Growth Indicators:
${synthesis.growthIndicators.map((g) => `• ${g}`).join('\n')}

Ongoing Inquiries:
${synthesis.ongoingInquiries.map((i) => `• ${i}`).join('\n')}

Reflection Prompt:
${synthesis.suggestedForwardPrompt}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (synthesis) {
      exportInsightsSynthesisAsMarkdown(synthesis);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-stone-900">
                Journal Insights & Longitudinal Synthesis
              </h2>
              <p className="text-xs text-stone-500">
                Cross-session reflection patterns, recurring themes, and personal agency
              </p>
            </div>
          </div>

          <button
            id="close-insights-modal-button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200/70 hover:text-stone-700 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-3.5">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                <FileText className="h-3.5 w-3.5" />
                <span>Total Reflections</span>
              </div>
              <p className="text-xl font-bold text-stone-900">{stats.totalReflections}</p>
            </div>

            <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-3.5">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Message Turns</span>
              </div>
              <p className="text-xl font-bold text-stone-900">{stats.totalMessages}</p>
            </div>

            <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-3.5">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                <Compass className="h-3.5 w-3.5 text-amber-700" />
                <span>Reflection Compasses</span>
              </div>
              <p className="text-xl font-bold text-stone-900">{stats.compassesCount}</p>
            </div>

            <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-3.5">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                <span>Geotagged Entries</span>
              </div>
              <p className="text-xl font-bold text-stone-900">{stats.locationsCount}</p>
            </div>
          </div>

          {/* Top Themes / Tags Cloud */}
          {stats.topTags.length > 0 && (
            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-stone-700">
                <Tag className="h-3.5 w-3.5 text-stone-500" />
                <span>Active Reflection Themes & Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stats.topTags.map((t) => (
                  <span
                    key={t.tag}
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-2xs"
                  >
                    <span>{t.tag}</span>
                    <span className="text-[10px] text-stone-400 font-mono">({t.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Synthesis Trigger Area */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-semibold text-amber-950 flex items-center justify-center sm:justify-start gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-700" />
                <span>Synthesize Journal Patterns & Growth</span>
              </h3>
              <p className="text-xs text-amber-900/80 max-w-xl">
                Ask Gemini to review your recent reflections, identify recurring emotional themes, celebrate micro-steps, and surface thoughtful questions.
              </p>
            </div>

            <button
              id="synthesize-insights-button"
              onClick={handleGenerateSynthesis}
              disabled={isLoading || interactions.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="h-4 w-4 text-amber-300" />
                  <span>{synthesis ? 'Re-synthesize Patterns' : 'Generate Synthesis'}</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Rendered Synthesis Results */}
          {synthesis && (
            <div className="space-y-4 pt-2 border-t border-stone-200 animate-fade-in">
              {/* Header & Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-800">
                    {synthesis.timeframe}
                  </span>
                  <span className="text-xs text-stone-500">
                    Based on {synthesis.totalReflectionsAnalyzed} reflections • Generated {new Date(synthesis.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                    title="Copy synthesis text"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                    title="Export synthesis as markdown"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export (.md)</span>
                  </button>
                </div>
              </div>

              {/* Mindset Overview Card */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  🌟 Mindset & Cognitive Landscape
                </h4>
                <p className="text-sm text-stone-800 leading-relaxed">
                  {synthesis.mindsetSummary}
                </p>
              </div>

              {/* Core Themes Grid */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  🔍 Recurring Reflection Themes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {synthesis.coreThemes.map((theme, i) => (
                    <div key={i} className="rounded-xl border border-stone-200/90 bg-white p-3.5 shadow-2xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="font-semibold text-xs text-stone-900">{theme.theme}</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth & Ongoing Inquiries Split Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Growth Indicators */}
                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-900">
                    <TrendingUp className="h-4 w-4 text-emerald-700" />
                    <span>Agency & Growth Indicators</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {synthesis.growthIndicators.map((g, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ongoing Inquiries */}
                <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-900">
                    <HelpCircle className="h-4 w-4 text-amber-700" />
                    <span>Ongoing Inquiries & Curiosities</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {synthesis.ongoingInquiries.map((inq, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{inq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Forward-Looking Prompt */}
              {synthesis.suggestedForwardPrompt && (
                <div className="rounded-xl border border-stone-200 bg-stone-900 p-4 text-white">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Forward-Looking Reflection Question</span>
                  </div>
                  <p className="text-sm font-serif italic text-stone-200">
                    "{synthesis.suggestedForwardPrompt}"
                  </p>
                </div>
              )}

              {/* Constitutional Notice Banner */}
              <div className="flex items-center gap-2 rounded-lg bg-stone-100 p-2.5 text-[11px] text-stone-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Grounded Synthesis Notice:</strong> This analysis is derived exclusively from your private journal collection. It is intended for constructive self-reflection, not automated decisions.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
