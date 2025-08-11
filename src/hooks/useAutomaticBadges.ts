import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { badgeAutomationService } from '../services/badgeAutomation';

export function useAutomaticBadges() {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      // Start monitoring for badge opportunities
      badgeAutomationService.startMonitoring();

      // Process badge queue every 30 seconds
      const interval = setInterval(() => {
        badgeAutomationService.processBadgeQueue();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Manual badge check function
  const checkBadges = async (tokenAddress?: string) => {
    if (address) {
      await badgeAutomationService.checkAndMintBadges(address, tokenAddress);
    }
  };

  return { checkBadges };
}