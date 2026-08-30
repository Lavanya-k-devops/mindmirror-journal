import React from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  Database, 
  KeyRound, 
  FileCode, 
  CheckCircle,
  EyeOff
} from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                Security Architecture & Constitution
              </h2>
              <p className="text-xs text-stone-500">
                Live threat mitigation and data isolation guarantees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs text-stone-700 leading-relaxed">
          {/* Item 1 */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-stone-900 mb-1.5">
              <Database className="h-4 w-4 text-emerald-600" />
              <span>1. Strict Cloud Firestore Data Isolation</span>
            </div>
            <p className="text-stone-600 mb-2">
              Every journal document is isolated under <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">/users/{'{userId}'}/interactions/{'{interactionId}'}</code>. Firestore Security Rules enforce that <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">request.auth.uid == userId</code> on all reads, lists, creates, updates, and deletes.
            </p>
            <div className="rounded bg-stone-900 p-2.5 text-[11px] font-mono text-stone-200 overflow-x-auto">
              match /users/{'{userId}'}/interactions/{'{interactionId}'} &#123;<br/>
              &nbsp;&nbsp;allow get, list, delete: if request.auth != null && request.auth.uid == userId;<br/>
              &nbsp;&nbsp;allow create, update: if request.auth != null && request.auth.uid == userId;<br/>
              &#125;
            </div>
          </div>

          {/* Item 2 */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-stone-900 mb-1.5">
              <KeyRound className="h-4 w-4 text-amber-600" />
              <span>2. Server-Side Secret Protection</span>
            </div>
            <p className="text-stone-600">
              The <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">GEMINI_API_KEY</code> is never shipped to the frontend or bundled into JavaScript client code. All AI operations are proxied through a secured Node.js backend using authenticated Firebase ID tokens.
            </p>
          </div>

          {/* Item 3 */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-stone-900 mb-1.5">
              <Lock className="h-4 w-4 text-blue-600" />
              <span>3. Token-Verified Backend Boundary</span>
            </div>
            <p className="text-stone-600">
              API requests to <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">/api/gemini/journal-chat</code> must provide a valid Firebase Bearer token in the <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">Authorization</code> header. Unauthenticated requests are immediately rejected with HTTP 401.
            </p>
          </div>

          {/* Item 4 */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-stone-900 mb-1.5">
              <EyeOff className="h-4 w-4 text-indigo-600" />
              <span>4. Prompt Injection & Privacy Safeguards</span>
            </div>
            <p className="text-stone-600">
              Gemini system prompts are strictly partitioned from user input turns. System prompts explicitly instruct the model to maintain confidentiality, never reveal system secrets, and validate markdown safely without unsafe HTML rendering.
            </p>
          </div>

          {/* Item 5 - Reflection Compass & User Autonomy */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-stone-900 mb-1.5">
              <FileCode className="h-4 w-4 text-amber-600" />
              <span>5. Reflection Compass & Non-Prescriptive AI</span>
            </div>
            <p className="text-stone-600">
              The Reflection Compass strictly reflects data directly expressed by the user. If context is absent, it returns <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">"Not enough context yet"</code> rather than hallucinating facts. It provides supportive perspective without ever making high-impact decisions for the user.
            </p>
          </div>

          {/* Item 6 - Location Privacy & Zero-Key Exposure */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-stone-900 mb-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>6. Location Privacy & Zero-Key Exposure Architecture</span>
            </div>
            <p className="text-stone-600 mb-2">
              Geographic location is strictly opt-in, user-initiated, and never requested on page load or automatically. Coordinates are validated to valid ranges (-90..90 lat, -180..180 lng) and stored solely inside the user's isolated Firestore collection.
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1 text-[11px]">
              <li><span className="font-semibold text-stone-800">Zero Client Secrets:</span> Uses direct Google Maps URL navigation without embedding API keys in frontend bundles.</li>
              <li><span className="font-semibold text-stone-800">User Control:</span> Users can view, verify on Google Maps, or delete attached location at any time.</li>
              <li><span className="font-semibold text-stone-800">No Silent AI Ingestion:</span> Geolocation is not sent silently to Gemini models.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-stone-900 px-5 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
