// Badge Automation Service - Monitors blockchain events and triggers badge minting
import { createPublicClient, http, parseAbiItem, getContract, parseEther } from 'viem';
import { base } from 'viem/chains';
import { CONTRACTS, TOKEN_FACTORY_ABI, ERC20_ABI, BADGE_NFT_ABI } from '../config/wagmi';

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

interface BadgeRequirement {
  type: BadgeType;
  threshold: bigint;
  checkFunction: (address: string, tokenAddress?: string) => Promise<boolean>;
}

class BadgeAutomationService {
  private client = createPublicClient({
    chain: base,
    transport: http(),
  });

  private badgeRequirements: BadgeRequirement[] = [
    {
      type: BadgeType.TOKEN_CREATOR,
      threshold: BigInt(1),
      checkFunction: this.checkTokenCreator.bind(this),
    },
    {
      type: BadgeType.LAUNCH_MASTER,
      threshold: parseEther('1'),
      checkFunction: this.checkLaunchMaster.bind(this),
    },
    {
      type: BadgeType.VOLUME_KING,
      threshold: parseEther('100000'),
      checkFunction: this.checkVolumeKing.bind(this),
    },
    {
      type: BadgeType.COMMUNITY_BUILDER,
      threshold: BigInt(1000),
      checkFunction: this.checkCommunityBuilder.bind(this),
    },
  ];

  // Start monitoring blockchain events
  async startMonitoring() {
    console.log('Starting badge automation monitoring...');

    // Monitor token creation events
    this.client.watchEvent({
      address: CONTRACTS.TOKEN_FACTORY,
      event: parseAbiItem('event TokenCreated(address indexed creator, address indexed tokenAddress, string name, string symbol, uint256 totalSupply, uint256 initialLiquidity, uint256 lockPeriod)'),
      onLogs: (logs) => {
        logs.forEach(async (log) => {
          const { creator, tokenAddress, initialLiquidity } = log.args;
          if (creator && tokenAddress) {
            await this.checkAndMintBadges(creator, tokenAddress, { initialLiquidity });
          }
        });
      },
    });

    // Monitor large transactions for volume badges
    this.client.watchEvent({
      event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
      onLogs: (logs) => {
        logs.forEach(async (log) => {
          if (log.args.value && log.args.value > parseEther('10')) {
            // Check for whale transactions
            await this.checkWhaleActivity(log.address, log.args.to!, log.args.value);
          }
        });
      },
    });
  }

  // Check and mint badges for a user
  async checkAndMintBadges(userAddress: string, tokenAddress?: string, metadata?: any) {
    if (!userAddress) return;
    
    for (const requirement of this.badgeRequirements) {
      try {
        const eligible = await requirement.checkFunction(userAddress, tokenAddress);
        if (eligible) {
          await this.mintBadgeIfNotExists(userAddress, requirement.type, tokenAddress || '0x0', requirement.threshold);
        }
      } catch (error) {
        console.error(`Error checking badge ${requirement.type}:`, error);
        // Continue with other badges even if one fails
      }
    }
  }

  // Check if user already has badge, mint if not
  private async mintBadgeIfNotExists(
    userAddress: string, 
    badgeType: BadgeType, 
    tokenAddress: string, 
    achievementValue: bigint
  ) {
    try {
      const badgeContract = getContract({
        address: CONTRACTS.BADGE_NFT,
        abi: BADGE_NFT_ABI,
        client: this.client,
      });

      // Check if user already has this badge
      const hasBadge = await badgeContract.read.hasBadge([userAddress, badgeType]);
      
      if (!hasBadge) {
        // This would need to be called from a backend service with minter role
        console.log(`User ${userAddress} eligible for badge ${badgeType}`);
        // Store in queue for backend processing
        await this.queueBadgeMinting(userAddress, badgeType, tokenAddress, achievementValue);
      }
    } catch (error) {
      console.error('Error minting badge:', error);
    }
  }

  // Badge checking functions
  private async checkTokenCreator(userAddress: string): Promise<boolean> {
    try {
      const factoryContract = getContract({
        address: CONTRACTS.TOKEN_FACTORY,
        abi: TOKEN_FACTORY_ABI,
        client: this.client,
      });

      const tokens = await factoryContract.read.getCreatedTokens([userAddress]);
      return tokens.length > 0;
    } catch {
      return false;
    }
  }

  private async checkLaunchMaster(userAddress: string, tokenAddress?: string): Promise<boolean> {
    if (!tokenAddress) return false;
    
    try {
      const factoryContract = getContract({
        address: CONTRACTS.TOKEN_FACTORY,
        abi: TOKEN_FACTORY_ABI,
        client: this.client,
      });

      const tokenInfo = await factoryContract.read.getTokenInfo([tokenAddress]);
      return tokenInfo.creator === userAddress && tokenInfo.initialLiquidity >= parseEther('1');
    } catch {
      return false;
    }
  }

  private async checkVolumeKing(userAddress: string, tokenAddress?: string): Promise<boolean> {
    // This would need to integrate with DEX APIs or subgraphs
    // For now, return false - implement with real volume data
    return false;
  }

  private async checkCommunityBuilder(userAddress: string, tokenAddress?: string): Promise<boolean> {
    // This would need to check holder count from token contract or indexer
    // For now, return false - implement with real holder data
    return false;
  }

  private async checkWhaleActivity(tokenAddress: string, userAddress: string, amount: bigint) {
    if (amount >= parseEther('10')) {
      await this.queueBadgeMinting(userAddress, BadgeType.WHALE_CALLER, tokenAddress, amount);
    }
  }

  // Queue badge minting for backend processing
  private async queueBadgeMinting(
    userAddress: string,
    badgeType: BadgeType,
    tokenAddress: string,
    achievementValue: bigint
  ) {
    // Store in localStorage for now, in production use a proper queue
    const queue = JSON.parse(localStorage.getItem('badgeQueue') || '[]');
    queue.push({
      userAddress,
      badgeType,
      tokenAddress,
      achievementValue: achievementValue.toString(),
      timestamp: Date.now(),
    });
    localStorage.setItem('badgeQueue', JSON.stringify(queue));
    
    console.log(`Queued badge ${badgeType} for user ${userAddress}`);
  }

  // Process badge queue (call this periodically)
  async processBadgeQueue() {
    const queue = JSON.parse(localStorage.getItem('badgeQueue') || '[]');
    
    for (const item of queue) {
      try {
        // In production, this would call your backend API
        console.log('Processing badge:', item);
        // Remove from queue after processing
      } catch (error) {
        console.error('Error processing badge:', error);
      }
    }
    
    // Clear processed items
    localStorage.setItem('badgeQueue', '[]');
  }
}

export const badgeAutomationService = new BadgeAutomationService();