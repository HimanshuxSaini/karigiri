import { useState, useEffect } from 'react';

export const useInstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isAppleOS, setIsAppleOS] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    // Detect Standalone (already installed)
    const checkStandalone = () => {
      const isStandaloneQuery = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = window.navigator.standalone === true;
      setIsStandalone(isStandaloneQuery || isIOSStandalone);
    };
    checkStandalone();

    // Detect Apple OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsAppleOS(isIOS);

    // Detect In-App Browsers (Instagram, Facebook, TikTok)
    const inAppRules = [
      'instagram',
      'fban', // Facebook
      'fbav', // Facebook
      'tiktok',
      'snapchat'
    ];
    const isApp = inAppRules.some(rule => userAgent.includes(rule));
    setIsInAppBrowser(isApp);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsStandalone(true);
      setInstallPromptEvent(null);
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

  return { isInstallable, promptInstall, isStandalone, isAppleOS, isInAppBrowser };
};
