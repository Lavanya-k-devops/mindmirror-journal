import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Menu, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Lightbulb, 
  ArrowUpRight,
  BookOpen,
  Edit2,
  Check,
  Compass,
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  Download
} from 'lucide-react';
import Markdown from 'react-markdown';
import type { JournalInteraction, ChatMessage, JournalLocation } from '../types';
import { ReflectionCompassView } from './ReflectionCompassView';
import { LocationAttachModal } from './LocationAttachModal';

interface JournalChatProps {
  interaction: JournalInteraction;
  onSendMessage: (text: string) => Promise<void>;
  onUpdateTitle: (title: string) => Promise<void>;
  onGenerateCompass: () => Promise<void>;
  onAttachLocation: (location: JournalLocation) => Promise<void>;
  onRemoveLocation: () => Promise<void>;
  isGenerating: boolean;
  isGeneratingCompass: boolean;
  compassError: string | null;
  onDismissCompassError: () => void;
  isSaving: boolean;
  saveError: string | null;
  onRetryLast: () => void;
  onToggleSidebarMobile: () => void;
  onOpenExport?: () => void;
}

const STARTER_PROMPTS = [
  {
    title: 'Daily Reflection',
    prompt: 'I want to reflect on how today went, what brought me energy, and what challenged me.',
  },
  {
    title: 'Unpack a Decision',
    prompt: 'I have a decision I need to make and want to weigh the pros, cons, and emotional stakes.',
  },
  {
    title: 'Process Overwhelm',
    prompt: 'I am feeling a bit overwhelmed right now. Help me untangle my thoughts and prioritize.',
  },
  {
    title: 'Creative Brainstorm',
    prompt: 'I have a seed of an idea and want to brainstorm possibilities, directions, and next steps.',
  },
];

export const JournalChat: React.FC<JournalChatProps> = ({
  interaction,
  onSendMessage,
  onUpdateTitle,
  onGenerateCompass,
  onAttachLocation,
  onRemoveLocation,
  isGenerating,
  isGeneratingCompass,
  compassError,
  onDismissCompassError,
  isSaving,
  saveError,
  onRetryLast,
  onToggleSidebarMobile,
  onOpenExport,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'compass'>('chat');
  const [inputText, setInputText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(interaction.title);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditedTitle(interaction.title);
  }, [interaction.title]);

  const scrollToBottom = () => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [interaction.messages, isGenerating, activeTab]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isGenerating) return;

    setInputText('');
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveTitle = async () => {
    if (editedTitle.trim() && editedTitle !== interaction.title) {
      await onUpdateTitle(editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const hasMessages = interaction.messages.length > 0;
  const hasCompass = !!interaction.reflectionCompass;

  // Handle clicking the Reflection Compass tab
  const handleCompassTabClick = () => {
    if (activeTab === 'compass') {
      // If already on the Reflection Compass view, clicking the tab triggers a fresh refresh/synthesis
      if (!isGeneratingCompass && hasMessages) {
        onGenerateCompass();
      }
    } else {
      // Switch view to Reflection Compass
      setActiveTab('compass');
      // If the compass hasn't been generated yet and messages exist, automatically synthesize it
      if (!hasCompass && hasMessages && !isGeneratingCompass) {
        onGenerateCompass();
      }
    }
  };

  const formatCoordinates = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(3)}° ${latDir}, ${Math.abs(lng).toFixed(3)}° ${lngDir}`;
  };

  const mapsUrl = interaction.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${interaction.location.latitude},${interaction.location.longitude}`)}`
    : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-1 flex-col bg-stone-100/40">
      {/* Top Session Header */}
      <div className="border-b border-stone-200 bg-white px-4 py-3 sm:px-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left Title & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSidebarMobile}
              className="lg:hidden rounded-lg border border-stone-200 p-1.5 text-stone-600 hover:bg-stone-50 cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  autoFocus
                  className="rounded-md border border-stone-300 px-2 py-1 text-sm font-semibold text-stone-900 focus:border-stone-900 focus:outline-none"
                />
                <button
                  onClick={handleSaveTitle}
                  className="rounded p-1 text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                  title="Save Title"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-base font-bold text-stone-900 tracking-tight">
                  {interaction.title || 'New Reflection'}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-stone-400 hover:text-stone-600 cursor-pointer p-0.5"
                  title="Rename Title"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Center/Right View Switcher Tabs & Status */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* View Mode Tabs */}
            <div className="flex items-center rounded-xl bg-stone-100 p-1 border border-stone-200/90 shadow-2xs">
              <button
                id="tab-conversation"
                onClick={() => setActiveTab('chat')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 text-stone-500" />
                <span>Conversation</span>
                {interaction.messages.length > 0 && (
                  <span className="ml-1 rounded-full bg-stone-200 px-1.5 py-0.2 text-[10px] font-medium text-stone-700">
                    {interaction.messages.length}
                  </span>
                )}
              </button>

              <button
                id="tab-reflection-compass"
                onClick={handleCompassTabClick}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'compass'
                    ? 'bg-amber-100/80 text-amber-950 border border-amber-300/80 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title={
                  activeTab === 'compass'
                    ? 'Click to refresh/update Reflection Compass'
                    : hasCompass
                    ? 'View 6-facet Reflection Compass'
                    : 'Synthesize 6-facet Reflection Compass'
                }
              >
                <Compass className={`h-3.5 w-3.5 ${activeTab === 'compass' ? 'text-amber-800' : 'text-amber-600'}`} />
                <span>Reflection Compass</span>
                {hasCompass ? (
                  <span className="flex h-2 w-2 rounded-full bg-amber-500" title="Compass Generated" />
                ) : (
                  <span className="rounded bg-amber-200/60 px-1 py-0.2 text-[9px] font-semibold text-amber-800">
                    6-Facet
                  </span>
                )}
              </button>
            </div>

            {/* Quick Export Trigger */}
            {onOpenExport && (
              <button
                id="header-export-button"
                onClick={onOpenExport}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 transition-colors cursor-pointer"
                title="Export this reflection as Markdown or backup"
              >
                <Download className="h-3.5 w-3.5 text-stone-500" />
                <span>Export</span>
              </button>
            )}

            {/* Sync & Isolation Status */}
            <div className="flex items-center gap-1.5 text-xs text-stone-500 pl-1">
              {isSaving ? (
                <span className="flex items-center gap-1 text-amber-600">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-[11px] hidden sm:inline">Saving...</span>
                </span>
              ) : saveError ? (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span className="text-[11px] hidden sm:inline">Sync failed</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="text-[11px] hidden md:inline">Isolated in Firestore</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Location & Metadata Sub-bar */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
          {interaction.location ? (
            <div className="inline-flex items-center flex-wrap gap-2 rounded-xl bg-amber-50/80 border border-amber-200/90 px-3 py-1.5 text-xs text-stone-800 shadow-2xs">
              <MapPin className="h-3.5 w-3.5 text-amber-800 shrink-0" />
              <span className="font-semibold text-stone-900">
                {interaction.location.label || 'Attached Location'}:
              </span>
              <span className="font-mono text-stone-600 text-[11px]">
                {formatCoordinates(interaction.location.latitude, interaction.location.longitude)}
              </span>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2 ml-1"
                  title="View in Google Maps (opens safely in new tab)"
                >
                  <span>View in Google Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="ml-1 text-[11px] font-medium text-stone-500 hover:text-stone-900 underline cursor-pointer"
                title="Manage or remove attached location"
              >
                Manage
              </button>
            </div>
          ) : (
            <button
              id="attach-location-header-button"
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600 hover:border-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
              title="Attach optional location to this reflection"
            >
              <MapPin className="h-3.5 w-3.5 text-stone-500" />
              <span>Attach Location</span>
            </button>
          )}

          {/* Dynamic Summary pill if present */}
          {interaction.summary && (
            <div className="flex-1 min-w-[200px] text-xs text-stone-600 truncate">
              <span className="font-semibold text-stone-800">Summary: </span>
              <span>{interaction.summary}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main View Area (Conversation or Reflection Compass) */}
      {activeTab === 'compass' ? (
        /* DEDICATED REFLECTION COMPASS VIEW */
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-4">
            {/* Top Navigation Back to Chat */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('chat')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Conversation</span>
              </button>

              <span className="text-xs text-stone-400">
                {hasMessages ? `${interaction.messages.length} messages in conversation` : 'No messages yet'}
              </span>
            </div>

            {/* Reflection Compass View Component */}
            <ReflectionCompassView
              compass={interaction.reflectionCompass || null}
              hasMessages={hasMessages}
              isGeneratingCompass={isGeneratingCompass}
              compassError={compassError}
              onGenerateCompass={onGenerateCompass}
              onDismissError={onDismissCompassError}
              onSwitchToChat={() => setActiveTab('chat')}
            />
          </div>
        </div>
      ) : (
        /* CONVERSATION VIEW */
        <>
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Compass Quick-Access Banner when messages exist */}
            {hasMessages && (
              <div className="mx-auto max-w-2xl rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-stone-900">
                      {hasCompass ? 'Reflection Compass Ready' : 'Synthesize Your Reflection'}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {hasCompass
                        ? '6-facet orientation map is available for this session'
                        : 'Untangle facts, feelings, and next steps into a 6-facet map'}
                    </p>
                  </div>
                </div>

                <button
                  id="banner-open-compass"
                  onClick={handleCompassTabClick}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-semibold text-amber-50 hover:bg-amber-950 transition-all cursor-pointer shrink-0"
                >
                  <span>{hasCompass ? 'View Compass' : 'Generate Compass'}</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}

            {interaction.messages.length === 0 ? (
              <div className="mx-auto max-w-2xl text-center py-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-800 shadow-2xs mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  What's on your mind today?
                </h2>
                <p className="mt-1 text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  Speak freely. This conversation is private, isolated to your account, and designed to help you think through emotions, goals, and reflections.
                </p>

                {/* Starter Prompts */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {STARTER_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(p.prompt);
                        textareaRef.current?.focus();
                      }}
                      className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs hover:border-stone-400 hover:shadow-xs transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-900 group-hover:text-amber-800">
                          {p.title}
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-stone-700" />
                      </div>
                      <p className="mt-1 text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                        {p.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              interaction.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    {msg.role === 'model' ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-800">
                        <Sparkles className="h-3 w-3 text-amber-600" />
                        Gemini
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-stone-500">
                        You
                      </span>
                    )}
                    <span className="text-[10px] text-stone-400">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                  </div>

                  {msg.role === 'user' ? (
                    <div className="max-w-2xl rounded-2xl rounded-tr-xs bg-stone-900 px-4 py-3 text-xs sm:text-sm text-white shadow-xs leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="max-w-2xl rounded-2xl rounded-tl-xs border border-stone-200 bg-white px-4 py-3.5 text-xs sm:text-sm text-stone-800 shadow-xs leading-relaxed space-y-2">
                      <div className="markdown-body prose prose-stone prose-xs max-w-none">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Live Generating Animation */}
            {isGenerating && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-800">
                    <Sparkles className="h-3 w-3 text-amber-600" />
                    Gemini
                  </span>
                  <span className="text-[10px] text-stone-400">Reflecting...</span>
                </div>
                <div className="rounded-2xl rounded-tl-xs border border-stone-200 bg-white px-4 py-3 text-xs text-stone-600 shadow-xs flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Formulating insights & synthesis...</span>
                </div>
              </div>
            )}

            {/* Reflection Follow-Up Suggestion */}
            {interaction.reflectionPrompt && !isGenerating && (
              <div className="mx-auto max-w-2xl rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-amber-900">
                      Follow-up Reflection:
                    </h4>
                    <p className="mt-0.5 text-xs text-amber-800 leading-relaxed">
                      {interaction.reflectionPrompt}
                    </p>
                    <button
                      onClick={() => {
                        setInputText(interaction.reflectionPrompt || '');
                        textareaRef.current?.focus();
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2 cursor-pointer"
                    >
                      <span>Answer this reflection</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error and Recovery Banner */}
            {saveError && (
              <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{saveError}</span>
                </div>
                <button
                  onClick={onRetryLast}
                  className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800 hover:bg-red-200 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bottom Form */}
          <div className="border-t border-stone-200 bg-white p-3 sm:p-4">
            <div className="mx-auto max-w-3xl">
              <form onSubmit={handleSend} className="relative flex flex-col rounded-2xl border border-stone-300 bg-stone-50/50 p-2 focus-within:border-stone-800 focus-within:bg-white transition-all shadow-2xs">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Reflect on your day, explore an idea, or ask for guidance... (Shift+Enter for newline)"
                  rows={2}
                  maxLength={8000}
                  className="w-full resize-none bg-transparent px-2 py-1 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />

                <div className="flex items-center justify-between pt-2 px-1 border-t border-stone-200/60">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400">
                      {inputText.length > 0 ? `${inputText.length} / 8000` : 'Protected multi-turn dialogue'}
                    </span>

                    {/* Quick Location Indicator/Trigger in Composer */}
                    {interaction.location ? (
                      <span 
                        onClick={() => setIsLocationModalOpen(true)}
                        className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 cursor-pointer hover:bg-amber-100 transition-colors"
                        title="Click to manage attached location"
                      >
                        <MapPin className="h-2.5 w-2.5 text-amber-700" />
                        <span className="truncate max-w-[110px]">{interaction.location.label || 'Location attached'}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsLocationModalOpen(true)}
                        className="inline-flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                        title="Attach optional location to this reflection"
                      >
                        <MapPin className="h-2.5 w-2.5" />
                        <span>Add Location</span>
                      </button>
                    )}
                  </div>

                  <button
                    id="send-message-button"
                    type="submit"
                    disabled={!inputText.trim() || isGenerating}
                    className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <span>Send</span>
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Location Attachment & Management Modal */}
      <LocationAttachModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onAttachLocation={onAttachLocation}
        onRemoveLocation={onRemoveLocation}
        currentLocation={interaction.location}
      />
    </div>
  );
};
