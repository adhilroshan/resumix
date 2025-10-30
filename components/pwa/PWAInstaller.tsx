'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install button
      setShowInstallButton(true);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      // Log install to analytics
      console.log('PWA was installed');
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      // Hide the install button
      setShowInstallButton(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowInstallButton(false);

    console.log(`User response to the install prompt: ${outcome}`);
  };

  if (!showInstallButton) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-8 md:right-8">
      <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-xs mx-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Install Resumix</h3>
            <p className="text-xs opacity-90 mt-1">Install our app for a better experience</p>
          </div>
          <button
            onClick={handleInstallClick}
            className="bg-white text-blue-600 px-3 py-2 rounded font-medium text-sm hover:bg-blue-50 transition-colors"
          >
            Install
          </button>
        </div>
        <button
          onClick={() => setShowInstallButton(false)}
          className="absolute -top-2 -right-2 bg-white text-gray-400 rounded-full w-6 h-6 flex items-center justify-center hover:text-gray-600 text-sm"
        >
          ×
        </button>
      </div>
    </div>
  );
}