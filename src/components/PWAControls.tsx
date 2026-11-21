import React, { useState } from 'react';
import { Download, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 min-h-[36px] rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/15 px-3 py-1.5 text-xs font-medium text-[#FFD27D] hover:bg-[#F59E0B]/25 transition cursor-pointer whitespace-nowrap"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 min-h-[36px] rounded-full border border-[#F59E0B]/35 bg-[#F59E0B]/10 px-3 py-1.5 text-xs font-medium text-[#FFD27D] hover:bg-[#F59E0B]/20 transition cursor-pointer whitespace-nowrap"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#12131A] p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 id="ios-install-title" className="text-base font-semibold text-white">
                  Install FirstStep on iOS
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install guide"
                  className="text-white/50 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-[#D1D5DB] leading-relaxed">
                1. Tap the <strong>Share</strong> button in your Safari toolbar.
                <br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
                <br />
                3. Tap <strong>Add</strong> to launch FirstStep like a native app.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-full border border-white/15 py-2.5 text-xs font-medium text-white/85 hover:bg-white/5 transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-4 md:right-auto z-50 flex items-center gap-2.5 rounded-2xl border border-amber-400/35 bg-[#19120C]/95 px-4 py-2.5 text-xs text-amber-100 shadow-2xl backdrop-blur-md max-w-md"
    >
      <WifiOff className="h-4 w-4 text-[#F59E0B] shrink-0" />
      <span>
        Offline Mode — Basic app shell is available. Live AI reflections and account sync require an
        internet connection.
      </span>
    </div>
  );
};
