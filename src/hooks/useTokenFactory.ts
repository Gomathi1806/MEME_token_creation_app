import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACTS, TOKEN_FACTORY_ABI } from '../config/wagmi';
import { useBadgeNFT, BadgeType } from './useBadgeNFT';
import { useUserStats } from './useAnalytics';

export interface TokenCreationParams {
  name: string;
  symbol: string;
  totalSupply: string;
  initialLiquidity: string;
  lockPeriod: string;
}

export function useTokenFactory() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { mintBadge } = useBadgeNFT();
  const { trackActivity } = useUserStats();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    onSuccess: async (receipt) => {
      // Automatic badge minting trigger
      if (receipt.from) {
        try {
          // Mint Token Creator badge
          await mintBadge(BadgeType.TOKEN_CREATOR, receipt.to || '0x0', BigInt(1));
          
          // Track analytics
          await trackActivity('token_created', {
            tokenAddress: receipt.to,
            transactionHash: receipt.transactionHash,
          });
        } catch (error) {
          console.error('Auto badge minting failed:', error);
        }
      }
    },
  });

  // Enhanced token creation with validation
  const createToken = async (params: TokenCreationParams) => {
    if (CONTRACTS.TOKEN_FACTORY === 'YOUR_DEPLOYED_CONTRACT_ADDRESS') {
      throw new Error('Please update TOKEN_FACTORY address in src/config/wagmi.ts with your deployed contract address');
    }
    
    // Validation logic
    if (!params.name || params.name.length < 2) {
      throw new Error('Token name must be at least 2 characters');
    }
    if (!params.symbol || params.symbol.length < 2) {
      throw new Error('Token symbol must be at least 2 characters');
    }
    if (parseFloat(params.totalSupply) <= 0) {
      throw new Error('Total supply must be greater than 0');
    }
    if (parseFloat(params.initialLiquidity) < 0.001) {
      throw new Error('Minimum 0.001 ETH required (platform fee)');
    }

    try {
      const totalSupplyWei = parseEther(params.totalSupply);
      const liquidityWei = parseEther(params.initialLiquidity);
      const lockPeriodSeconds = BigInt(parseInt(params.lockPeriod) * 24 * 60 * 60); // Convert days to seconds

      console.log('Creating token with params:', {
        name: params.name,
        symbol: params.symbol,
        totalSupply: totalSupplyWei.toString(),
        initialLiquidity: liquidityWei.toString(),
        lockPeriod: lockPeriodSeconds.toString()
      });
      await writeContract({
        address: CONTRACTS.TOKEN_FACTORY,
        abi: TOKEN_FACTORY_ABI,
        functionName: 'createToken',
        args: [
          params.name,
          params.symbol,
          totalSupplyWei,
          liquidityWei,
          lockPeriodSeconds
        ],
        value: liquidityWei, // Send ETH for initial liquidity
      });
    } catch (err) {
      console.error('Token creation failed:', err);
      throw err;
    }
  };

  return {
    createToken,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useCreatedTokens(address?: `0x${string}`) {
  const { data: tokens, isLoading, error } = useReadContract({
    address: CONTRACTS.TOKEN_FACTORY,
    abi: TOKEN_FACTORY_ABI,
    functionName: 'getCreatedTokens',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    tokens: tokens as `0x${string}`[] | undefined,
    isLoading,
    error,
  };
}