'use client';

import { Maximize2, Minimize2 } from 'lucide-react';
import { AppsMenu } from './apps-menu';
import { SalesMenu } from './sales-menu';
import { PendingAdsMenu } from './pending-ads-menu';
import { useState, useEffect } from 'react';

export function HeaderIcons() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <AppsMenu />
      <SalesMenu />
      <PendingAdsMenu />
      <button
        onClick={toggleFullscreen}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
      >
        {isFullscreen ? (
          <Minimize2 className="h-5 w-5" />
        ) : (
          <Maximize2 className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
