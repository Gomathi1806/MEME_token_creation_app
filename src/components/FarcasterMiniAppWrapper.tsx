import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useFarcasterMiniApp } from '../hooks/useFarcasterMiniApp';
import { Zap, Users, Shield, TrendingUp, Coins } from 'lucide-react';

interface FarcasterMiniAppWrapperProps {
  children: React.ReactNode;
}

const FarcasterMiniAppWrapper: React.FC<FarcasterMiniAppWrapperProps> = ({ children }) => {
  const { isInFarcaster, context, isReady } = useFarcasterMiniApp();

  // Optimize for mobile/mini app view
  useEffect(() => {
    if (isInFarcaster) {
      // Add mini app specific styles
      document.body.classList.add('farcaster-miniapp');
      
      // Prevent zoom on mobile
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }

      // Add mini app specific CSS
      const style = document.createElement('style');
      style.textContent = `
        .farcaster-miniapp {
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
        .farcaster-miniapp * {
          -webkit-tap-highlight-color: transparent;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }

    return () => {
      document.body.classList.remove('farcaster-miniapp');
    };
  }, [isInFarcaster]);

  if (isInFarcaster && !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <span className="text-white text-sm">Loading Mini App...</span>
        </div>
      </div>
    );
  }

  if (isInFarcaster) {
    return (
      <div className="farcaster-miniapp-container min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Farcaster User Context Bar */}
        {context?.user && (
          <div className="bg-purple-900/50 backdrop-blur-sm border-b border-white/10 px-4 py-2">
            <div className="flex items-center space-x-3">
              <img 
                src={context.user.pfpUrl} 
                alt={context.user.displayName}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-white text-sm font-medium">{context.user.displayName}</p>
                <p className="text-gray-400 text-xs">@{context.user.username}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mini App Optimized Header */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-sm">MemeCoin Toolkit</h1>
                <p className="text-blue-300 text-xs">Create tokens on Base</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Mini App Wallet Connect Button */}
              <div className="[&>div]:!bg-gradient-to-r [&>div]:!from-blue-500 [&>div]:!to-purple-600 [&>div]:!border-0 [&>div]:!rounded-lg [&>div]:!font-medium [&>div]:!px-3 [&>div]:!py-1.5 [&>div]:!text-xs [&>div]:!shadow-lg [&>div]:!shadow-blue-500/25">
                <ConnectButton showBalance={false} chainStatus="none" accountStatus="address" />
              </div>
              <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-300 text-xs">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats for Mini App */}
        <div className="bg-white/5 border-b border-white/10 px-4 py-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-blue-400 text-lg font-bold">3</div>
              <div className="text-gray-400 text-xs">Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 text-lg font-bold">0.001</div>
              <div className="text-gray-400 text-xs">ETH Fee</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 text-lg font-bold">Base</div>
              <div className="text-gray-400 text-xs">Network</div>
            </div>
            <div className="text-center">
              <div className="text-orange-400 text-lg font-bold">Auto</div>
              <div className="text-gray-400 text-xs">Verify</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Mini App Footer */}
        <div className="bg-white/5 border-t border-white/10 px-4 py-2">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Base Network</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>Community</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular web app view
  return <>{children}</>;
};

export default FarcasterMiniAppWrapper;
