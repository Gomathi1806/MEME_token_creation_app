import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { analyticsService, TokenAnalytics, UserStats } from '../services/analytics';

export function useTokenAnalytics(tokenAddress?: string) {
  const [analytics, setAnalytics] = useState<TokenAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!tokenAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getTokenAnalytics(tokenAddress);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}

export function useUserStats() {
  const { address } = useAccount();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const data = await analyticsService.getUserStats(address);
      setStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const trackActivity = useCallback(async (activity: string, metadata?: any) => {
    if (!address) return;
    await analyticsService.trackUserActivity(address, activity, metadata);
    fetchStats(); // Refresh stats
  }, [address, fetchStats]);

  return {
    stats,
    isLoading,
    trackActivity,
    refetch: fetchStats,
  };
}