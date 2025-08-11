import { useState, useEffect, useCallback } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { CONTRACTS, TOKEN_FACTORY_ABI, ERC20_ABI } from '../config/wagmi';
import { useIPFS } from './useIPFS';

export interface RealTokenData {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  creator: string;
  creationTime: number;
  initialLiquidity: string;
  lockPeriod: string;
  metadataHash?: string;
  socialData?: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    description?: string;
    logoUrl?: string;
  };
  metrics: {
    holders: number;
    volume24h: string;
    marketCap: string;
    price: string;
    priceChange24h: number;
    liquidityLocked: boolean;
    lockEndTime: number;
  };
}

export function useRealTokenData(tokenAddress?: `0x${string}`) {
  const [tokenData, setTokenData] = useState<RealTokenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getData } = useIPFS();

  // Read basic token info from contract
  const { data: contractData, isLoading: contractLoading } = useReadContracts({
    contracts: [
      {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'name',
      },
      {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'symbol',
      },
      {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
      },
      {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
      },
    ],
    query: {
      enabled: !!tokenAddress,
    },
  });

  // Read token info from factory
  const { data: factoryData, isLoading: factoryLoading } = useReadContract({
    address: CONTRACTS.TOKEN_FACTORY,
    abi: TOKEN_FACTORY_ABI,
    functionName: 'getTokenInfo',
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!tokenAddress,
    },
  });

  // Fetch real-time metrics from Base network
  const fetchTokenMetrics = useCallback(async (address: string) => {
    try {
      // This would integrate with Base network APIs or indexers
      // For now, we'll simulate real data
      const mockMetrics = {
        holders: Math.floor(Math.random() * 10000) + 100,
        volume24h: (Math.random() * 1000000).toFixed(2),
        marketCap: (Math.random() * 10000000).toFixed(2),
        price: (Math.random() * 0.01).toFixed(6),
        priceChange24h: (Math.random() - 0.5) * 20,
        liquidityLocked: true,
        lockEndTime: Date.now() + 365 * 24 * 60 * 60 * 1000,
      };

      return mockMetrics;
    } catch (error) {
      console.error('Error fetching token metrics:', error);
      return {
        holders: 0,
        volume24h: '0',
        marketCap: '0',
        price: '0',
        priceChange24h: 0,
        liquidityLocked: false,
        lockEndTime: 0,
      };
    }
  }, []);

  // Load token data
  const loadTokenData = useCallback(async () => {
    if (!tokenAddress || !contractData || !factoryData) return;

    setIsLoading(true);
    setError(null);

    try {
      const [name, symbol, totalSupply, decimals] = contractData.map(result => result.result);
      const factory = factoryData as any;

      // Fetch metrics
      const metrics = await fetchTokenMetrics(tokenAddress);

      // Try to load social data from IPFS if metadata hash exists
      let socialData = {};
      if (factory.metadataHash) {
        try {
          const metadata = await getData(factory.metadataHash);
          socialData = {
            website: metadata.website,
            twitter: metadata.twitter,
            telegram: metadata.telegram,
            discord: metadata.discord,
            description: metadata.description,
            logoUrl: metadata.image,
          };
        } catch (ipfsError) {
          console.warn('Could not load IPFS metadata:', ipfsError);
        }
      }

      const realTokenData: RealTokenData = {
        address: tokenAddress,
        name: name as string,
        symbol: symbol as string,
        totalSupply: formatEther(totalSupply as bigint),
        decimals: decimals as number,
        creator: factory.creator,
        creationTime: Number(factory.creationTime),
        initialLiquidity: formatEther(factory.initialLiquidity),
        lockPeriod: factory.lockPeriod.toString(),
        metadataHash: factory.metadataHash,
        socialData,
        metrics,
      };

      setTokenData(realTokenData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load token data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress, contractData, factoryData, getData, fetchTokenMetrics]);

  useEffect(() => {
    loadTokenData();
  }, [loadTokenData]);

  return {
    tokenData,
    isLoading: isLoading || contractLoading || factoryLoading,
    error,
    refetch: loadTokenData,
  };
}

export function useAllTokens(creatorAddress?: `0x${string}`) {
  const [tokens, setTokens] = useState<RealTokenData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get created tokens from factory
  const { data: tokenAddresses } = useReadContract({
    address: CONTRACTS.TOKEN_FACTORY,
    abi: TOKEN_FACTORY_ABI,
    functionName: 'getCreatedTokens',
    args: creatorAddress ? [creatorAddress] : undefined,
    query: {
      enabled: !!creatorAddress,
    },
  });

  const loadAllTokens = useCallback(async () => {
    if (!tokenAddresses || tokenAddresses.length === 0) {
      setTokens([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // This would be optimized with batch calls in production
      const tokenPromises = (tokenAddresses as `0x${string}`[]).map(async (address) => {
        // Load each token's data
        // In production, this would use batch contract calls
        return null; // Placeholder
      });

      const loadedTokens = await Promise.all(tokenPromises);
      setTokens(loadedTokens.filter(Boolean) as RealTokenData[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tokens';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddresses]);

  useEffect(() => {
    loadAllTokens();
  }, [loadAllTokens]);

  return {
    tokens,
    isLoading,
    error,
    refetch: loadAllTokens,
  };
}