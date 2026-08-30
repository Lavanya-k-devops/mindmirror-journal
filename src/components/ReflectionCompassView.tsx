import React from 'react';
import { 
  Compass, 
  Sparkles, 
  RefreshCw, 
  HelpCircle, 
  Target, 
  Heart, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  Calendar,
  MessageSquarePlus,
  RotateCcw
} from 'lucide-react';
import type { ReflectionCompass } from '../types';

interface ReflectionCompassViewProps {
  compass: ReflectionCompass | null;
  hasMessages: boolean;
  isGeneratingCompass: boolean;
  compassError: string | null;
  onGenerateCompass: () => void;
  onDismissError?: () => void;
  onSwitchToChat?: () => void;
}

export const ReflectionCompassView: React.FC<ReflectionCompassViewProps> = ({
  compass,
  hasMessages,
  isGeneratingCompass,
  compassError,
  onGenerateCompass,
  onDismissError,
  onSwitchToChat,
}) => {
  const isNotEnough = (val?: string) => {
    if (!val) return true;
    const lower = val.toLowerCase().trim();
    return (
      lower === 'not enough context yet' ||
      lower === 'not enough context' ||
      lower === 'none provided' ||
      lower === 'unclear'
    );
  };

  const formatGeneratedDate = (isoStr?: string) => {
    if (!isoStr) return '';
    try {
      return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' +
        new Date(isoStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div id="reflection-compass-container" className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs transition-all">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/90 text-amber-900 border border-amber-300/80 shadow-2xs">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold text-stone-900 tracking-tight">
                Reflection Compass
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 border border-amber-200">
                <Sparkles className="h-3 w-3 text-amber-700" />
                6-Facet Synthesis
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Structured orientation mapping facts, feelings, tensions, agency, and next steps
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {compass && (
            <button
              id="refresh-compass-button"
              onClick={onGenerateCompass}
              disabled={isGeneratingCompass || !hasMessages}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 shadow-2xs hover:bg-stone-50 hover:text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingCompass ? 'animate-spin text-amber-600' : 'text-stone-500'}`} />
              <span>{isGeneratingCompass ? 'Synthesizing...' : 'Update Compass'}</span>
            </button>
          )}

          {onSwitchToChat && (
            <button
              id="compass-back-to-chat-button"
              onClick={onSwitchToChat}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-all cursor-pointer"
            >
              <MessageSquarePlus className="h-3.5 w-3.5 text-stone-500" />
              <span>Chat View</span>
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {compassError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
            <span className="font-medium">{compassError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onGenerateCompass}
              className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-900 hover:bg-red-200 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
            {onDismissError && (
              <button
                onClick={onDismissError}
                className="text-stone-400 hover:text-stone-600 text-xs px-1 cursor-pointer"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State / Prompt to Generate */}
      {!compass && !isGeneratingCompass && (
        <div className="my-6 py-8 px-4 text-center rounded-2xl bg-stone-50/80 border border-dashed border-stone-300">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 shadow-2xs mb-3">
            <Compass className="h-7 w-7" />
          </div>
          <h3 className="font-serif text-base font-bold text-stone-900">
            Untangle Your Reflection into 6 Key Facets
          </h3>
          <p className="mt-1.5 text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            The Reflection Compass reviews your conversation to structure what happened, how you feel, what's causing tension, what you want, what's within your control, and one practical micro-step forward.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="generate-compass-button"
              onClick={onGenerateCompass}
              disabled={!hasMessages}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Generate Reflection Compass</span>
            </button>

            {!hasMessages && onSwitchToChat && (
              <button
                onClick={onSwitchToChat}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-all cursor-pointer"
              >
                <MessageSquarePlus className="h-4 w-4 text-stone-600" />
                <span>Start by Writing in Chat</span>
              </button>
            )}
          </div>

          {!hasMessages && (
            <p className="mt-2 text-[11px] text-stone-400">
              Share a thought or journal entry in the Conversation first so the Compass has context to synthesize.
            </p>
          )}
        </div>
      )}

      {/* Generating Skeleton State */}
      {isGeneratingCompass && (
        <div className="my-6 py-10 px-4 text-center space-y-4 rounded-2xl bg-amber-50/40 border border-amber-200/60">
          <div className="flex justify-center items-center gap-2.5 text-amber-800">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-sm font-bold">Synthesizing Reflection Compass...</span>
          </div>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Extracting facts, emotional tone, core friction, and your direct sphere of control...
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-6 text-left max-w-4xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl border border-stone-200/90 bg-white p-4 animate-pulse space-y-2.5 shadow-2xs">
                <div className="h-4 w-28 bg-stone-200 rounded" />
                <div className="h-3.5 w-full bg-stone-100 rounded" />
                <div className="h-3.5 w-4/5 bg-stone-100 rounded" />
                <div className="h-3 w-1/2 bg-stone-100 rounded pt-2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Populated 6-Facet Compass Grid */}
      {compass && !isGeneratingCompass && (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. What Happened */}
            <div id="facet-what-happened" className="rounded-xl border border-stone-200 bg-stone-50/40 p-4 shadow-2xs flex flex-col justify-between hover:border-stone-300 transition-all">
              <div>
                <div className="flex items-center gap-2 text-stone-600 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-stone-900 tracking-tight">1. What Happened?</span>
                </div>
                <div className="text-xs text-stone-700 leading-relaxed font-normal">
                  {isNotEnough(compass.whatHappened) ? (
                    <span className="italic text-stone-400">Not enough context yet</span>
                  ) : (
                    <span>{compass.whatHappened}</span>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-stone-200/70 flex items-center justify-between text-[10px] text-stone-400">
                <span>Facts & Events</span>
              </div>
            </div>

            {/* 2. What Am I Feeling */}
            <div id="facet-what-im-feeling" className="rounded-xl border border-stone-200 bg-stone-50/40 p-4 shadow-2xs flex flex-col justify-between hover:border-stone-300 transition-all">
              <div>
                <div className="flex items-center gap-2 text-stone-600 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                    <Heart className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-stone-900 tracking-tight">2. What Am I Feeling?</span>
                </div>
                <div className="text-xs text-stone-700 leading-relaxed font-normal">
                  {isNotEnough(compass.whatImFeeling) ? (
                    <span className="italic text-stone-400">Not enough context yet</span>
                  ) : (
                    <span>{compass.whatImFeeling}</span>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-stone-200/70 flex items-center justify-between text-[10px] text-stone-400">
                <span>Emotional Awareness</span>
              </div>
            </div>

            {/* 3. What Is Bothering Me */}
            <div id="facet-whats-bothering-me" className="rounded-xl border border-stone-200 bg-stone-50/40 p-4 shadow-2xs flex flex-col justify-between hover:border-stone-300 transition-all">
              <div>
                <div className="flex items-center gap-2 text-stone-600 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-stone-900 tracking-tight">3. What Is Bothering Me?</span>
                </div>
                <div className="text-xs text-stone-700 leading-relaxed font-normal">
                  {isNotEnough(compass.whatsBotheringMe) ? (
                    <span className="italic text-stone-400">Not enough context yet</span>
                  ) : (
                    <span>{compass.whatsBotheringMe}</span>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-stone-200/70 flex items-center justify-between text-[10px] text-stone-400">
                <span>Core Tension & Friction</span>
              </div>
            </div>

            {/* 4. What Do I Actually Want */}
            <div id="facet-what-i-want" className="rounded-xl border border-stone-200 bg-stone-50/40 p-4 shadow-2xs flex flex-col justify-between hover:border-stone-300 transition-all">
              <div>
                <div className="flex items-center gap-2 text-stone-600 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                    <Target className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-stone-900 tracking-tight">4. What Do I Actually Want?</span>
                </div>
                <div className="text-xs text-stone-700 leading-relaxed font-normal">
                  {isNotEnough(compass.whatIWant) ? (
                    <span className="italic text-stone-400">Not enough context yet</span>
                  ) : (
                    <span>{compass.whatIWant}</span>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-stone-200/70 flex items-center justify-between text-[10px] text-stone-400">
                <span>Aspiration & Desired Outcome</span>
              </div>
            </div>

            {/* 5. What Can I Control */}
            <div id="facet-what-i-control" className="rounded-xl border border-stone-200 bg-stone-50/40 p-4 shadow-2xs flex flex-col justify-between hover:border-stone-300 transition-all">
              <div>
                <div className="flex items-center gap-2 text-stone-600 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-stone-900 tracking-tight">5. What Can I Control?</span>
                </div>
                <div className="text-xs text-stone-700 leading-relaxed font-normal">
                  {isNotEnough(compass.whatICanControl) ? (
                    <span className="italic text-stone-400">Not enough context yet</span>
                  ) : (
                    <span>{compass.whatICanControl}</span>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-stone-200/70 flex items-center justify-between text-[10px] text-stone-400">
                <span>Direct Sphere of Agency</span>
              </div>
            </div>

            {/* 6. One Practical Next Step */}
            <div id="facet-next-step" className="rounded-xl border border-amber-300/80 bg-gradient-to-br from-white to-amber-50/60 p-4 shadow-2xs flex flex-col justify-between hover:border-amber-400 transition-all">
              <div>
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-200 text-amber-900 font-bold">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-stone-900 tracking-tight">6. Practical Next Step</span>
                </div>
                <div className="text-xs text-stone-900 font-medium leading-relaxed">
                  {isNotEnough(compass.nextStep) ? (
                    <span className="italic font-normal text-stone-400">Not enough context yet</span>
                  ) : (
                    <span>{compass.nextStep}</span>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-amber-200/70 flex items-center justify-between text-[10px] text-amber-800">
                <span>Gentle Micro-Action</span>
              </div>
            </div>
          </div>

          {/* AI Disclaimer and Agency Notice */}
          <div className="rounded-xl bg-stone-100/80 border border-stone-200 p-3 text-xs text-stone-600 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <span className="font-semibold text-stone-800">Reflective Orientation: </span>
              Synthesized strictly from your conversation to assist your reflective process. It is not formal advice or objective truth. You retain complete agency over your decisions.
              {compass.generatedAt && (
                <span className="ml-2 text-stone-400">
                  (Synthesized: {formatGeneratedDate(compass.generatedAt)})
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
