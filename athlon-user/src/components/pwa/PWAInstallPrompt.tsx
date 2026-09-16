'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_STORAGE_KEY = 'athlon_pwa_install_dismissed';
const DISMISS_DURATION_DAYS = 3;

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // 2. Check if dismissed recently
    const dismissedTimestamp = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissedTimestamp) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedTimestamp, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < DISMISS_DURATION_DAYS) {
        return;
      }
    }

    // 3. Check for iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // 4. Handle Chromium / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay so user has seen the landing page first
      setTimeout(() => setShowPrompt(true), 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setShowIOSGuide(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS, if not standalone and not recently dismissed, show banner after 3 seconds
    if (isIOSDevice && !isStandaloneMode) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback: If browser supports direct install or omnibox
      alert('To install Athlon, tap your browser menu (⋮ or ...) and select "Install Athlon" or "Add to Home Screen".');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Error triggering PWA prompt:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
  };

  if (isStandalone || isInstalled || (!showPrompt && !showIOSGuide)) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom / Banner Prompt */}
      <AnimatePresence>
        {showPrompt && !showIOSGuide && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-5 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[9999]"
          >
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0E1420]/95 backdrop-blur-xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
              {/* Subtle top accent gradient */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

              <div className="flex items-start gap-3.5">
                {/* Logo Icon */}
                <div className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-950 to-[#0A0F18] border border-emerald-500/30 flex items-center justify-center shadow-inner">
                  <Image
                    src="/icons/icon-192x192.png"
                    alt="Athlon App Icon"
                    width={48}
                    height={48}
                    className="object-contain p-1"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-white tracking-wide">
                      Install Athlon App
                    </h4>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                      <Sparkles className="w-2.5 h-2.5" /> Fast
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-300 line-clamp-2">
                    Get instant access, full-screen live scores, and offline support right from your home screen.
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleDismiss}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Dismiss install banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-center"
                >
                  Not now
                </button>
                <button
                  onClick={handleInstallClick}
                  className="flex-1 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Installation Instruction Modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl border border-emerald-500/30 bg-[#0E1420] p-6 shadow-2xl text-white"
            >
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/icons/icon-192x192.png"
                    alt="Athlon"
                    width={48}
                    height={48}
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Install Athlon on iOS</h3>
                  <p className="text-xs text-slate-400">Add to your iPhone / iPad Home Screen</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    1
                  </div>
                  <p className="pt-0.5">
                    Tap the <strong className="text-white inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-white/10"><Share className="w-3 h-3 text-emerald-400 inline" /> Share</strong> button in Safari toolbar.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    2
                  </div>
                  <p className="pt-0.5">
                    Scroll down and tap <strong className="text-white inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-white/10"><PlusSquare className="w-3 h-3 text-emerald-400 inline" /> Add to Home Screen</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    3
                  </div>
                  <p className="pt-0.5">
                    Tap <strong className="text-white">Add</strong> in the top right corner to enjoy full-screen Athlon experience!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
