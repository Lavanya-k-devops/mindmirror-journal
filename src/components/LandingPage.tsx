import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  BrainCircuit, 
  MessageSquareText, 
  Database, 
  CheckCircle2, 
  ArrowRight,
  KeyRound
} from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => Promise<void>;
  isSigningIn: boolean;
  signInError: string | null;
  onOpenSecurityModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignIn,
  isSigningIn,
  signInError,
  onOpenSecurityModal,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-stone-100/60 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background ambient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-100/50 blur-3xl rounded-full" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[250px] bg-stone-200/60 blur-3xl rounded-full" />
      </div>

      <div className="mx-auto max-w-4xl w-full">
        {/* Main Hero Card */}
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-8 sm:p-12 shadow-sm backdrop-blur-sm text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-3.5 py-1.5 text-xs font-medium text-amber-900 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Secure Personal AI Thinking Companion</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 max-w-2xl mx-auto leading-tight">
            Reflect, brainstorm, and clarify your thoughts with Gemini
          </h1>

          <p className="mt-5 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            A private, multi-turn reflective journal. Have deep conversations about your day, unpack decisions, and store insights in an isolated, encrypted Cloud Firestore environment.
          </p>

          {/* Sign In CTA */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <button
              id="google-sign-in-button"
              onClick={onSignIn}
              disabled={isSigningIn}
              className="flex items-center justify-center gap-3 w-full sm:w-auto min-w-[280px] rounded-xl bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-stone-800 active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
            >
              {isSigningIn ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Connecting to Google...</span>
                </div>
              ) : (
                <>
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Sign In with Google</span>
                  <ArrowRight className="h-4 w-4 ml-1 opacity-70" />
                </>
              )}
            </button>

            {signInError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-700 max-w-md">
                {signInError}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Lock className="h-3 w-3 text-emerald-600" />
              <span>Authentication required prior to accessing any personal entries</span>
            </div>
          </div>
        </div>

        {/* 3 Core Architecture Pillars */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-stone-200/80 bg-white/90 p-5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-800 mb-3">
              <MessageSquareText className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900">Multi-Turn Thinking</h3>
            <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
              Engage in continuous dialogue. Gemini remembers conversation context within each session to help you explore deeper insights.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200/80 bg-white/90 p-5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-800 mb-3">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900">Strict User Isolation</h3>
            <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
              Every document is restricted by Firestore Security Rules to your verified user UID. Cross-user access is impossible.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200/80 bg-white/90 p-5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-800 mb-3">
              <KeyRound className="h-4.5 w-4.5 text-amber-600" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900">Zero Client Secrets</h3>
            <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
              All Gemini API operations run server-side. API keys and credentials are never exposed in browser bundles or client memory.
            </p>
          </div>
        </div>

        {/* Security Constitution Banner */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-stone-200/70 bg-stone-50/90 px-5 py-3.5 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Built according to the Secure Production AI Constitution</span>
          </div>
          <button
            onClick={onOpenSecurityModal}
            className="text-xs font-semibold text-stone-900 hover:text-amber-700 underline underline-offset-2"
          >
            Review Security & Rules Architecture →
          </button>
        </div>
      </div>

      <footer className="mt-12 text-center text-xs text-stone-400">
        Personal Gemini Journal • Cloud Firestore & Gemini API Protected
      </footer>
    </div>
  );
};
