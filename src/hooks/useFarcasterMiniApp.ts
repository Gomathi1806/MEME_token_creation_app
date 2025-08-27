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
    parent: Window;
  }
}

export function useFarcasterMiniApp() {
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Multiple detection methods for Farcaster
    const checkFarcasterEnvironment = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const referrer = document.referrer.toLowerCase();
      
      const inFarcaster = !!(
        // Check for Farcaster SDK
        window.fc ||
        // Check if in iframe
        window.parent !== window ||
        // Check referrer
        referrer.includes('warpcast.com') ||
        referrer.includes('farcaster.xyz') ||
        referrer.includes('fc.xyz') ||
        // Check user agent
        userAgent.includes('warpcast') ||
        userAgent.includes('farcaster') ||
        // Check for frame context
        window.location.search.includes('fc_frame') ||
        // Check for mini app context
        window.location.search.includes('fc_miniapp')
      );
      
      console.log('Farcaster detection:', {
        hasFC: !!window.fc,
        inIframe: window.parent !== window,
        referrer,
        userAgent,
        searchParams: window.location.search,
        result: inFarcaster
      });
      
      setIsInFarcaster(inFarcaster);
      
      if (inFarcaster) {
        // Initialize Farcaster SDK
        if (window.fc) {
          setContext(window.fc.context);
          window.fc.actions.ready();
          setIsReady(true);
        } else {
          // Fallback for when SDK isn't immediately available
          setTimeout(() => {
            if (window.fc) {
              setContext(window.fc.context);
              window.fc.actions.ready();
              setIsReady(true);
            } else {
              // Mock context for testing
              setIsReady(true);
            }
          }, 1000);
        }
      } else {
        setIsReady(true);
      }
    };

    checkFarcasterEnvironment();

    // Listen for Farcaster SDK initialization
    const handleFarcasterReady = () => {
      console.log('Farcaster SDK ready');
      if (window.fc) {
        setContext(window.fc.context);
        setIsReady(true);
      }
    };

    // Listen for messages from parent frame
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message:', event.data);
      if (event.data?.type === 'farcaster_frame') {
        setIsInFarcaster(true);
        setContext(event.data.context);
        setIsReady(true);
      }
    };

    window.addEventListener('fc:ready', handleFarcasterReady);
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('fc:ready', handleFarcasterReady);
      window.removeEventListener('message', handleMessage);
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
    } else if (window.parent !== window) {
      window.parent.postMessage({ type: 'close_miniapp' }, '*');
    }
  }, []);

  const shareText = useCallback((text: string) => {
    if (window.fc) {
      window.fc.actions.shareText(text);
    } else if (window.parent !== window) {
      window.parent.postMessage({ type: 'share_text', text }, '*');
    }
  }, []);

  const shareCast = useCallback((text: string, embeds?: string[]) => {
    if (window.fc) {
      window.fc.actions.shareCast(text, embeds);
    } else if (window.parent !== window) {
      window.parent.postMessage({ type: 'share_cast', text, embeds }, '*');
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
