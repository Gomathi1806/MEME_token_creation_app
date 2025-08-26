import { useState, useEffect, useCallback } from 'react';

interface FarcasterContext {
  user?: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  };
  cast?: {
    hash: string;
    author: {
      fid: number;
      username: string;
    };
  };
  channel?: {
    id: string;
    name: string;
  };
}

interface FarcasterMiniAppSDK {
  context: FarcasterContext;
  actions: {
    openUrl: (url: string) => void;
    close: () => void;
    ready: () => void;
    shareText: (text: string) => void;
    shareCast: (text: string, embeds?: string[]) => void;
  };
}

declare global {
  interface Window {
    fc?: FarcasterMiniAppSDK;
  }
}

export function useFarcasterMiniApp() {
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if running in Farcaster
    const checkFarcasterEnvironment = () => {
      const inFarcaster = !!(
        window.fc ||
        window.parent !== window ||
        document.referrer.includes('warpcast.com') ||
        document.referrer.includes('farcaster.xyz') ||
        navigator.userAgent.includes('Warpcast')
      );
      
      setIsInFarcaster(inFarcaster);
      
      if (inFarcaster && window.fc) {
        setContext(window.fc.context);
        // Signal that the mini app is ready
        window.fc.actions.ready();
        setIsReady(true);
      }
    };

    checkFarcasterEnvironment();

    // Listen for Farcaster SDK initialization
    const handleFarcasterReady = () => {
      if (window.fc) {
        setContext(window.fc.context);
        setIsReady(true);
      }
    };

    window.addEventListener('fc:ready', handleFarcasterReady);
    
    return () => {
      window.removeEventListener('fc:ready', handleFarcasterReady);
    };
  }, []);

  const openUrl = useCallback((url: string) => {
    if (window.fc) {
      window.fc.actions.openUrl(url);
    } else {
      window.open(url, '_blank');
    }
  }, []);

  const close = useCallback(() => {
    if (window.fc) {
      window.fc.actions.close();
    }
  }, []);

  const shareText = useCallback((text: string) => {
    if (window.fc) {
      window.fc.actions.shareText(text);
    }
  }, []);

  const shareCast = useCallback((text: string, embeds?: string[]) => {
    if (window.fc) {
      window.fc.actions.shareCast(text, embeds);
    }
  }, []);

  const shareTokenCreation = useCallback((tokenData: {
    name: string;
    symbol: string;
    address: string;
  }) => {
    const text = `🚀 Just launched ${tokenData.name} ($${tokenData.symbol}) on Base! 

Create your own meme coin in 3 clicks with MemeCoin Toolkit 👇`;

    const embedUrl = `https://memecoin-toolkit.com/token/${tokenData.address}`;
    
    shareCast(text, [embedUrl]);
  }, [shareCast]);

  return {
    isInFarcaster,
    context,
    isReady,
    actions: {
      openUrl,
      close,
      shareText,
      shareCast,
      shareTokenCreation,
    },
  };
}
