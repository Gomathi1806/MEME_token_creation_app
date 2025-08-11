import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACTS, BADGE_NFT_ABI } from '../config/wagmi';

export enum BadgeType {
  TOKEN_CREATOR = 0,
  LAUNCH_MASTER = 1,
  VOLUME_KING = 2,
  COMMUNITY_BUILDER = 3,
  DIAMOND_HANDS = 4,
  VIRAL_SENSATION = 5,
  WHALE_CALLER = 6,
  PERFECT_SHOT = 7,
}

export function useBadgeNFT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintBadge = async (badgeType: BadgeType, tokenAddress: `0x${string}`, achievementValue: bigint = BigInt(1)) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      await writeContract({
        address: CONTRACTS.BADGE_NFT,
        abi: BADGE_NFT_ABI,
        functionName: 'mintBadge',
        args: [address, badgeType, tokenAddress, achievementValue],
      });
    } catch (err) {
      console.error('Badge minting failed:', err);
      throw err;
    }
  };

  const checkBadgeEligibility = async (badgeType: BadgeType, achievementValue: bigint) => {
    if (!address) return false;
    
    try {
      // This would need to be implemented in the contract
      // For now, return true for demonstration
      return true;
      
      /* When contract method exists:
      const data = await readContract({
        address: CONTRACTS.BADGE_NFT,
        abi: BADGE_NFT_ABI,
        functionName: 'isEligibleForBadge',
        args: [address, badgeType, achievementValue],
      });
      return data as boolean;
      */
    } catch (error) {
      console.error('Error checking badge eligibility:', error);
      return false;
    }
  };
  return {
    mintBadge,
    checkBadgeEligibility,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useUserBadges(address?: `0x${string}`) {
  const { data: badges, isLoading, error } = useReadContract({
    address: CONTRACTS.BADGE_NFT,
    abi: BADGE_NFT_ABI,
    functionName: 'getBadges',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    badges: badges as bigint[] | undefined,
    isLoading,
    error,
  };
}