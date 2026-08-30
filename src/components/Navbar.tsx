import React from 'react';
import { Sparkles, ShieldCheck, LogOut, BookOpen, BrainCircuit, Download } from 'lucide-react';
import type { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onSignOut: () => Promise<void>;
  onOpenSecurityModal: () => void;
  onOpenInsights?: () => void;
  onOpenExport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignOut,
  onOpenSecurityModal,
  onOpenInsights,
  onOpenExport,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-amber-300 shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-semibold tracking-tight text-stone-900">
                Personal Gemini Journal
              </span>
              <span className="hidden sm:inline-flex items-center rounded-md bg-stone-200/70 px-2 py-0.5 text-xs font-medium text-stone-700">
                Encrypted & Isolated
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Private thinking companion & multi-turn reflection
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && onOpenInsights && (
            <button
              id="navbar-insights-button"
              onClick={onOpenInsights}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-amber-950 shadow-2xs hover:bg-amber-100 transition-colors cursor-pointer"
              title="View Journal Insights & Synthesis"
            >
              <BrainCircuit className="h-3.5 w-3.5 text-amber-800" />
              <span className="hidden md:inline">Theme Insights</span>
            </button>
          )}

          {user && onOpenExport && (
            <button
              id="navbar-export-button"
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 transition-colors cursor-pointer"
              title="Export & Data Portability"
            >
              <Download className="h-3.5 w-3.5 text-stone-500" />
              <span className="hidden md:inline">Export</span>
            </button>
          )}

          <button
            id="security-info-button"
            onClick={onOpenSecurityModal}
            className="hidden lg:flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
            title="View Security & Data Isolation Details"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Security Model</span>
          </button>

          {user && (
            <div className="flex items-center gap-3 border-l border-stone-200 pl-3">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-8 w-8 rounded-full border border-stone-300 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-300 text-xs font-bold text-stone-700">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-stone-900 truncate max-w-[140px]">
                    {user.displayName || 'Journaler'}
                  </p>
                  <p className="text-[10px] text-stone-500 truncate max-w-[140px]">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                id="sign-out-button"
                onClick={onSignOut}
                className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-2xs hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
