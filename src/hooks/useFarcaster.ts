import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  followerCount: number;
  followingCount: number;
}

interface CastData {
  text: string;
  embeds?: string[];
  mentions?: number[];
  parent?: string;
}

export function useFarcaster() {
  const { address } = useAccount();
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is authenticated with Farcaster
  useEffect(() => {
    const checkFarcasterAuth = async () => {
      try {
        const response = await fetch('/api/farcaster/user', {
          credentials: 'include',
        });
        
        // Check if response is JSON (not HTML 404 page)
        const contentType = response.headers.get('content-type');
        if (response.ok && contentType?.includes('application/json')) {
          const userData = await response.json();
          setUser(userData);
          setIsConnected(true);
        } else if (!response.ok && response.status === 404) {
          // API endpoint not implemented yet - this is expected
          console.log('Farcaster API not yet implemented');
        } else {
          console.log('Farcaster API returned non-JSON response');
        }
      } catch (error) {
        // Silently handle errors when API endpoints don't exist yet
        console.log('Farcaster API not available yet');
      }
    };

    checkFarcasterAuth();
  }, []);

  // Connect to Farcaster
  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if API exists before redirecting
      const response = await fetch('/api/farcaster/auth', { method: 'HEAD' });
      if (response.ok || response.status !== 404) {
        window.location.href = '/api/farcaster/auth';
      } else {
        console.log('Farcaster auth API not yet implemented');
        alert('Farcaster authentication will be available after backend deployment');
      }
    } catch (error) {
      console.log('Farcaster auth API not available yet');
      alert('Farcaster authentication will be available after backend deployment');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect from Farcaster
  const disconnect = useCallback(async () => {
    try {
      const response = await fetch('/api/farcaster/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok || response.status === 404) {
        setUser(null);
        setIsConnected(false);
      }
    } catch (error) {
      // Silently handle when API doesn't exist
      setUser(null);
      setIsConnected(false);
    }
  }, []);

  // Cast to Farcaster
  const cast = useCallback(async (data: CastData) => {
    if (!isConnected) {
      throw new Error('Not connected to Farcaster');
    }

    try {
      const response = await fetch('/api/farcaster/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.status === 404) {
        console.log('Farcaster cast API not yet implemented');
        return { success: false, message: 'API not implemented' };
      } else if (!response.ok) {
        throw new Error('Failed to cast');
      }

      return await response.json();
    } catch (error) {
      console.log('Farcaster cast API not available yet');
      return { success: false, message: 'API not available' };
    }
  }, [isConnected]);

  // Share token creation
  const shareTokenCreation = useCallback(async (tokenData: {
    name: string;
    symbol: string;
    address: string;
  }) => {
    const text = `🚀 Just launched ${tokenData.name} ($${tokenData.symbol}) on Base! 

Create your own meme coin in 3 clicks 👇`;

    const embedUrl = `https://memecoin-toolkit.com/token/${tokenData.address}`;

    return cast({
      text,
      embeds: [embedUrl],
    });
  }, [cast]);

  return {
    user,
    isConnected,
    isLoading,
    connect,
    disconnect,
    cast,
    shareTokenCreation,
  };
}

export function useFarcasterFrame() {
  const [frameData, setFrameData] = useState<any>(null);
  const [isInFrame, setIsInFrame] = useState(false);

  useEffect(() => {
    // Check if running in Farcaster frame
    const checkFrame = () => {
      const inFrame = window.parent !== window || 
                     window.location !== window.parent.location ||
                     document.referrer.includes('warpcast.com');
      setIsInFrame(inFrame);
    };

    checkFrame();

    // Listen for frame messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'farcaster_frame') {
        setFrameData(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendFrameAction = useCallback((action: string, data?: any) => {
    if (isInFrame) {
      window.parent.postMessage({
        type: 'farcaster_frame_action',
        action,
        data,
      }, '*');
    }
  }, [isInFrame]);

  return {
    frameData,
    isInFrame,
    sendFrameAction,
  };
}