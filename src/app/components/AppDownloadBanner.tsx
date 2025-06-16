'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface AppDownloadBannerProps {
  appStoreUrl?: string;
  appScheme?: string; // Your app's custom URL scheme
}

export default function AppDownloadBanner({ 
  appStoreUrl = "https://apps.apple.com/gb/app/stock-track-pro/id6744621973", // Your actual App Store URL
  appScheme = "stocktrackpro://" // Replace with your app's URL scheme if you have one
}: AppDownloadBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [hasApp, setHasApp] = useState(false);

  useEffect(() => {
    // Check if user is on mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      const ios = /iphone|ipad|ipod/.test(userAgent);
      
      setIsMobile(mobile);
      setIsIOS(ios);
    };

    // Check if banner was previously dismissed
    const checkDismissed = () => {
      const dismissed = localStorage.getItem('app-banner-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      // Show banner if not dismissed or if dismissed more than 24 hours ago
      return dismissedTime < oneDayAgo;
    };

    checkMobile();
    
    // Only show banner on mobile devices and if not recently dismissed
    if (window.innerWidth <= 768 && checkDismissed()) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('app-banner-dismissed', Date.now().toString());
  };

  const handleOpenApp = () => {
    // Try to open the app
    window.location.href = appScheme;
    
    // If app doesn't open within 2 seconds, redirect to App Store
    setTimeout(() => {
      if (!document.hidden) {
        window.open(appStoreUrl, '_blank');
      }
    }, 2000);
  };

  const handleDownloadApp = () => {
    window.open(appStoreUrl, '_blank');
  };

  if (!isVisible || !isMobile) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className="bg-white/20 p-2 rounded-lg">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              Get the StockTrackPro App
            </p>
            <p className="text-xs text-white/80 truncate">
              Better experience on mobile
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleOpenApp}
            className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
          >
            <span>Open</span>
          </button>
          
          <button
            onClick={handleDownloadApp}
            className="bg-white text-primary hover:bg-white/90 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>Get</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 