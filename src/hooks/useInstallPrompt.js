import { useState, useEffect } from 'react';

export const useInstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  });
  const [isLocallyInstalled, setIsLocallyInstalled] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('pwa_installed') === '1';
  });
  const [isAppleOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  });
  const [isInAppBrowser] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    const inAppRules = ['instagram', 'fban', 'fbav', 'tiktok', 'snapchat'];
    return inAppRules.some(rule => userAgent.includes(rule));
  });

  useEffect(() => {
    // Detect Standalone (already installed)
    const checkStandalone = () => {
      const isStandaloneQuery = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = window.navigator.standalone === true;
      setIsStandalone(isStandaloneQuery || isIOSStandalone);
    };
    checkStandalone();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setIsInstallable(true);
      
      // If the browser fires this event, the app is definitely not installed.
      // Clear any stale local storage flags from previous installations.
      if (localStorage.getItem('pwa_installed') === '1') {
        localStorage.removeItem('pwa_installed');
        setIsLocallyInstalled(false);
      }
      if (localStorage.getItem('pwa_dismissed') === '1') {
        localStorage.removeItem('pwa_dismissed');
      }
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsStandalone(true);
      setInstallPromptEvent(null);
      localStorage.setItem('pwa_installed', '1');
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    // Also listen for media query changes for standalone
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setIsStandalone(true);
    }
    setInstallPromptEvent(null);
  };

  return { isInstallable, promptInstall, isStandalone, isAppleOS, isInAppBrowser, isLocallyInstalled };
};
