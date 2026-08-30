import React, { useState } from 'react';
import { 
  MapPin, 
  X, 
  Navigation, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Loader2,
  Trash2
} from 'lucide-react';
import type { JournalLocation } from '../types';

interface LocationAttachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachLocation: (location: JournalLocation) => Promise<void>;
  onRemoveLocation: () => Promise<void>;
  currentLocation?: JournalLocation | null;
}

export const LocationAttachModal: React.FC<LocationAttachModalProps> = ({
  isOpen,
  onClose,
  onAttachLocation,
  onRemoveLocation,
  currentLocation,
}) => {
  const [step, setStep] = useState<'prompt' | 'capturing' | 'success' | 'error'>('prompt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedLoc, setCapturedLoc] = useState<JournalLocation | null>(currentLocation || null);
  const [customLabel, setCustomLabel] = useState<string>(currentLocation?.label || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('prompt');
    setErrorMessage(null);
    onClose();
  };

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setStep('error');
      setErrorMessage('Browser geolocation is not supported in this browser environment.');
      return;
    }

    setStep('capturing');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Strict boundary validation
        if (
          typeof latitude !== 'number' ||
          typeof longitude !== 'number' ||
          isNaN(latitude) ||
          isNaN(longitude) ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          setStep('error');
          setErrorMessage('Captured coordinates failed validity checks (-90..90 lat, -180..180 lng).');
          return;
        }

        const newLoc: JournalLocation = {
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          accuracy: accuracy ? Math.round(accuracy) : null,
          label: customLabel.trim() || null,
          capturedAt: new Date().toISOString(),
        };

        setCapturedLoc(newLoc);
        setStep('success');
      },
      (error) => {
        setStep('error');
        let msg = 'Location could not be retrieved.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Your reflection was not modified and you can continue journaling normally.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location position is currently unavailable. Check your network or device GPS settings.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again if you wish to attach location.';
        }
        setErrorMessage(msg);
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  };

  const handleConfirmAttach = async () => {
    if (!capturedLoc) return;
    setIsSubmitting(true);
    try {
      const finalLoc: JournalLocation = {
        ...capturedLoc,
        label: customLabel.trim() || null,
      };
      await onAttachLocation(finalLoc);
      handleClose();
    } catch (err: any) {
      setStep('error');
      setErrorMessage(err?.message || 'Failed to attach location.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    setIsSubmitting(true);
    try {
      await onRemoveLocation();
      setCapturedLoc(null);
      handleClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to remove location.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format coordinates cleanly (e.g. "37.7749° N, 122.4194° W")
  const formatCoordinates = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  };

  const mapsUrl = capturedLoc
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${capturedLoc.latitude},${capturedLoc.longitude}`)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                {currentLocation ? 'Manage Attached Location' : 'Attach Location to Reflection'}
              </h2>
              <p className="text-xs text-stone-500">
                Optional geographic context with strict user isolation
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 text-xs text-stone-700">
          
          {/* Step 1: Initial Prompt & Explanation */}
          {step === 'prompt' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 leading-relaxed">
                <p className="font-semibold text-stone-900 mb-1">
                  Attach your current location to this reflection?
                </p>
                <p className="text-stone-600 text-xs">
                  This is optional and will be stored with this journal entry. Your location is never accessed in the background and is strictly isolated to your private account.
                </p>
              </div>

              {/* Optional Place Label */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Optional Place Description or Label:
                </label>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g. Quiet Morning Cafe, Park Bench, Home Studio"
                  maxLength={100}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Existing Attached Location Notice */}
              {currentLocation && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900">Current Attached Coordinates:</span>
                    <span className="font-mono text-stone-600">
                      {formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
                    </span>
                  </div>
                  {currentLocation.label && (
                    <div className="text-stone-600">
                      Label: <span className="font-medium text-stone-900">{currentLocation.label}</span>
                    </div>
                  )}
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-800 hover:text-stone-950 underline underline-offset-2"
                    >
                      <span>View in Google Maps</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Privacy Notice Box */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3 flex items-start gap-2.5 text-[11px] text-stone-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900">Zero Secret Leakage: </span>
                  Uses verified coordinate URLs for Google Maps. No Google Maps API keys are exposed to client code or third parties.
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                {currentLocation ? (
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove Location</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestLocation}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>{currentLocation ? 'Update Location' : 'Capture Location'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Capturing State */}
          {step === 'capturing' && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-800" />
              <h3 className="font-serif text-sm font-bold text-stone-900">
                Requesting Browser Geolocation...
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                Please allow browser location access when prompted. This is used solely to record coordinates for this reflection.
              </p>
            </div>
          )}

          {/* Step 3: Success State Preview */}
          {step === 'success' && capturedLoc && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Location Captured Successfully</span>
                </div>
                
                <div className="pt-1 font-mono text-xs text-stone-800">
                  Coordinates: <span className="font-bold">{formatCoordinates(capturedLoc.latitude, capturedLoc.longitude)}</span>
                </div>

                {capturedLoc.accuracy && (
                  <div className="text-[11px] text-stone-500">
                    Accuracy: ±{capturedLoc.accuracy} meters
                  </div>
                )}

                <div className="text-[11px] text-stone-500">
                  Captured at: {new Date(capturedLoc.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>

              {/* Edit label if desired */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Place Name or Label (Optional):
                </label>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g. Quiet Morning Cafe, Park Bench"
                  maxLength={100}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* View in Google Maps test link */}
              {mapsUrl && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 flex items-center justify-between">
                  <span className="text-xs text-stone-600">Verify in Google Maps:</span>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 hover:underline"
                  >
                    <span>Open Map</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('prompt')}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAttach}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Attaching...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Confirm & Attach</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Error State */}
          {step === 'error' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 text-xs">
                    Location Not Attached
                  </h4>
                  <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                    {errorMessage || 'Unable to access your location.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Close & Continue Journaling
                </button>
                <button
                  type="button"
                  onClick={handleRequestLocation}
                  className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Retry Permission
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
