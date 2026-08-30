import React, { useState, useEffect, useCallback } from 'react';
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  onAuthStateChanged,
  type User 
} from './lib/firebase';
import { 
  subscribeToUserInteractions, 
  persistJournalInteraction, 
  removeJournalInteraction, 
  requestGeminiReflection,
  requestReflectionCompass
} from './services/journalService';
import type { JournalInteraction, UserProfile, ChatMessage, ReflectionCompass, JournalLocation } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { HistorySidebar } from './components/HistorySidebar';
import { JournalChat } from './components/JournalChat';
import { SecurityModal } from './components/SecurityModal';
import { InsightsModal } from './components/InsightsModal';
import { ExportModal } from './components/ExportModal';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const [interactions, setInteractions] = useState<JournalInteraction[]>([]);
  const [activeInteraction, setActiveInteraction] = useState<JournalInteraction | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCompass, setIsGeneratingCompass] = useState(false);
  const [compassError, setCompassError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Initialize a fresh blank interaction template
  const createBlankInteraction = useCallback((userId: string): JournalInteraction => {
    const timestamp = Date.now();
    return {
      id: `interaction_${timestamp}_${Math.random().toString(36).substring(2, 8)}`,
      userId,
      title: 'New Reflection',
      summary: '',
      tags: ['Journal', 'Reflection'],
      messages: [],
      reflectionPrompt: null,
      reflectionCompass: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }, []);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
        setInteractions([]);
        setActiveInteraction(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to user's isolated Firestore interactions when authenticated
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserInteractions(
      user.uid,
      (fetchedInteractions) => {
        setInteractions(fetchedInteractions);
        
        // If no active interaction yet or current active was updated
        setActiveInteraction((prev) => {
          if (!prev) {
            return fetchedInteractions.length > 0
              ? fetchedInteractions[0]
              : createBlankInteraction(user.uid);
          }
          // Sync changes from Firestore if already selected
          const updated = fetchedInteractions.find((i) => i.id === prev.id);
          return updated || prev;
        });
      },
      (err) => {
        console.error('Failed to subscribe to interactions:', err);
        setSaveError('Unable to connect to your isolated Firestore collection.');
      }
    );

    return () => unsubscribe();
  }, [user, createBlankInteraction]);

  // Handle Google Sign-in
  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setSignInError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setSignInError(
        err?.message?.includes('popup-closed')
          ? 'Sign-in popup was closed before completing.'
          : 'Failed to sign in with Google. Please try again.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Sign-out
  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  // Start a new reflection session
  const handleNewReflection = () => {
    if (!user) return;
    const newSession = createBlankInteraction(user.uid);
    setActiveInteraction(newSession);
    setSaveError(null);
    setCompassError(null);
    setLastFailedPrompt(null);
  };

  // Select an existing reflection
  const handleSelectInteraction = (interaction: JournalInteraction) => {
    setActiveInteraction(interaction);
    setSaveError(null);
    setCompassError(null);
    setLastFailedPrompt(null);
  };

  // Send message to Gemini and persist interaction
  const handleSendMessage = async (promptText: string) => {
    if (!user || !activeInteraction) return;

    setIsGenerating(true);
    setSaveError(null);
    setLastFailedPrompt(null);

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: promptText,
      timestamp: new Date().toISOString(),
    };

    // Optimistically show user message in the active conversation
    const updatedMessages = [...activeInteraction.messages, userMessage];
    const optimisticInteraction: JournalInteraction = {
      ...activeInteraction,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };
    setActiveInteraction(optimisticInteraction);

    try {
      // Send conversation context to server-side Gemini endpoint
      const geminiResponse = await requestGeminiReflection({
        prompt: promptText,
        history: activeInteraction.messages.map((m) => ({
          role: m.role,
          text: m.text,
        })),
        currentSummary: activeInteraction.summary,
      });

      const modelMessage: ChatMessage = {
        id: `msg_gemini_${Date.now()}`,
        role: 'model',
        text: geminiResponse.reply,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, modelMessage];
      
      // Auto-title if still default
      let updatedTitle = activeInteraction.title;
      if (
        updatedTitle === 'New Reflection' ||
        updatedTitle === 'Untitled Reflection'
      ) {
        if (geminiResponse.summary) {
          updatedTitle = geminiResponse.summary.slice(0, 45).replace(/[.,!?]+$/, '');
        } else {
          updatedTitle = promptText.slice(0, 40);
        }
      }

      const completedInteraction: JournalInteraction = {
        ...activeInteraction,
        title: updatedTitle,
        summary: geminiResponse.summary || activeInteraction.summary,
        tags: geminiResponse.tags.length > 0 ? geminiResponse.tags : activeInteraction.tags,
        reflectionPrompt: geminiResponse.reflectionPrompt || null,
        messages: finalMessages,
        updatedAt: Date.now(),
      };

      // Persist to Cloud Firestore
      setIsSaving(true);
      await persistJournalInteraction(completedInteraction);
      setActiveInteraction(completedInteraction);
      setIsSaving(false);

    } catch (err: any) {
      console.error('Interaction failure:', err);
      setSaveError(err?.message || 'Failed to complete reflection.');
      setLastFailedPrompt(promptText);
    } finally {
      setIsGenerating(false);
      setIsSaving(false);
    }
  };

  // Generate / Refresh Reflection Compass
  const handleGenerateCompass = async () => {
    if (!user) {
      setCompassError('Please sign in to generate a Reflection Compass.');
      return;
    }
    if (!activeInteraction || activeInteraction.messages.length === 0) {
      setCompassError('Please share at least one reflection message before generating a Reflection Compass.');
      return;
    }

    setIsGeneratingCompass(true);
    setCompassError(null);

    try {
      const response = await requestReflectionCompass({
        messages: activeInteraction.messages.map((m) => ({
          role: m.role,
          text: m.text,
        })),
        summary: activeInteraction.summary,
      });

      if (response && response.compass) {
        const updatedInteraction: JournalInteraction = {
          ...activeInteraction,
          reflectionCompass: response.compass,
          updatedAt: Date.now(),
        };

        setIsSaving(true);
        await persistJournalInteraction(updatedInteraction);
        setActiveInteraction(updatedInteraction);
        setIsSaving(false);
      } else {
        throw new Error('Server did not return a valid Reflection Compass payload.');
      }
    } catch (err: any) {
      console.error('Failed to generate Reflection Compass:', err);
      setCompassError(err?.message || 'Unable to synthesize Reflection Compass at this time.');
    } finally {
      setIsGeneratingCompass(false);
      setIsSaving(false);
    }
  };

  // Retry sending last prompt
  const handleRetryLast = () => {
    if (lastFailedPrompt) {
      handleSendMessage(lastFailedPrompt);
    }
  };

  // Update reflection title
  const handleUpdateTitle = async (newTitle: string) => {
    if (!user || !activeInteraction) return;
    const updated: JournalInteraction = {
      ...activeInteraction,
      title: newTitle,
      updatedAt: Date.now(),
    };
    setActiveInteraction(updated);
    if (updated.messages.length > 0) {
      try {
        setIsSaving(true);
        await persistJournalInteraction(updated);
      } catch (err) {
        console.error('Failed to update title:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Attach location to active reflection
  const handleAttachLocation = async (location: JournalLocation) => {
    if (!user || !activeInteraction) return;
    const updated: JournalInteraction = {
      ...activeInteraction,
      location,
      updatedAt: Date.now(),
    };
    setActiveInteraction(updated);
    setIsSaving(true);
    try {
      await persistJournalInteraction(updated);
      setSaveError(null);
    } catch (err: any) {
      console.error('Failed to attach location:', err);
      setSaveError(err?.message || 'Failed to save location to Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  // Remove location from active reflection
  const handleRemoveLocation = async () => {
    if (!user || !activeInteraction) return;
    const updated: JournalInteraction = {
      ...activeInteraction,
      location: null,
      updatedAt: Date.now(),
    };
    setActiveInteraction(updated);
    setIsSaving(true);
    try {
      await persistJournalInteraction(updated);
      setSaveError(null);
    } catch (err: any) {
      console.error('Failed to remove location:', err);
      setSaveError(err?.message || 'Failed to update location in Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete an interaction
  const handleDeleteInteraction = async (id: string) => {
    if (!user) return;
    await removeJournalInteraction(user.uid, id);
    if (activeInteraction?.id === id) {
      const remaining = interactions.filter((i) => i.id !== id);
      if (remaining.length > 0) {
        setActiveInteraction(remaining[0]);
      } else {
        setActiveInteraction(createBlankInteraction(user.uid));
      }
    }
  };

  // Global loading screen during auth initialization
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-amber-300 shadow-sm animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="font-serif text-sm font-medium text-stone-700">
            Initializing Personal Gemini Journal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onSignOut={handleSignOut}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenInsights={() => setIsInsightsModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      {/* Main Viewport */}
      {!user ? (
        <LandingPage
          onSignIn={handleSignIn}
          isSigningIn={isSigningIn}
          signInError={signInError}
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        />
      ) : (
        <main className="flex flex-1 overflow-hidden">
          {/* History Sidebar */}
          <HistorySidebar
            interactions={interactions}
            selectedId={activeInteraction?.id || null}
            onSelect={handleSelectInteraction}
            onNew={handleNewReflection}
            onDelete={handleDeleteInteraction}
            isOpenMobile={isSidebarOpenMobile}
            onCloseMobile={() => setIsSidebarOpenMobile(false)}
            onOpenInsights={() => setIsInsightsModalOpen(true)}
            onOpenExport={() => setIsExportModalOpen(true)}
          />

          {/* Active Conversation & Reflection Area */}
          {activeInteraction && (
            <JournalChat
              interaction={activeInteraction}
              onSendMessage={handleSendMessage}
              onUpdateTitle={handleUpdateTitle}
              onGenerateCompass={handleGenerateCompass}
              onAttachLocation={handleAttachLocation}
              onRemoveLocation={handleRemoveLocation}
              isGenerating={isGenerating}
              isGeneratingCompass={isGeneratingCompass}
              compassError={compassError}
              onDismissCompassError={() => setCompassError(null)}
              isSaving={isSaving}
              saveError={saveError}
              onRetryLast={handleRetryLast}
              onToggleSidebarMobile={() => setIsSidebarOpenMobile(true)}
              onOpenExport={() => setIsExportModalOpen(true)}
            />
          )}
        </main>
      )}

      {/* Security & Data Isolation Architecture Modal */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* Longitudinal Insights Synthesis Modal */}
      <InsightsModal
        isOpen={isInsightsModalOpen}
        onClose={() => setIsInsightsModalOpen(false)}
        interactions={interactions}
      />

      {/* Export & Data Portability Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentInteraction={activeInteraction}
        allInteractions={interactions}
        userEmail={user?.email}
      />
    </div>
  );
}
