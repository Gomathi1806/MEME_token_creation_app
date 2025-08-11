// IPFS Configuration
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// Validate Pinata configuration
const validatePinataConfig = () => {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error('Pinata credentials not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY in your .env file');
  }
};

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  totalSupply: string;
  initialLiquidity: string;
  lockPeriod: string;
  createdAt: number;
  creator: string;
  liquidityModel: 'hybrid-social';
  socialMetrics: {
    holders: number;
    volume24h: string;
    marketCap: string;
    socialScore: number;
  };
}

export interface UserProfile {
  address: string;
  username?: string;
  avatar?: string;
  bio?: string;
  social: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  stats: {
    tokensCreated: number;
    totalVolume: string;
    badgesEarned: string[];
    reputation: number;
  };
  createdAt: number;
}

export interface BadgeProgress {
  address: string;
  badgeType: string;
  progress: number;
  requirement: number;
  achieved: boolean;
  achievedAt?: number;
  tokenAddress?: string;
}

class IPFSService {
  // Upload token metadata to IPFS
  async uploadTokenMetadata(metadata: TokenMetadata): Promise<string> {
    try {
      validatePinataConfig();

      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY!,
          'pinata_secret_api_key': PINATA_SECRET_KEY!,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `Token-${metadata.name}-${Date.now()}`,
            keyvalues: {
              type: 'token-metadata',
              creator: metadata.creator,
              symbol: metadata.symbol
            }
          },
          pinataOptions: {
            cidVersion: 1
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Token metadata uploaded to IPFS:', result.IpfsHash);
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading token metadata:', error);
      throw error;
    }
  }

  // Upload user profile to IPFS
  async uploadUserProfile(profile: UserProfile): Promise<string> {
    try {
      validatePinataConfig();

      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY!,
          'pinata_secret_api_key': PINATA_SECRET_KEY!,
        },
        body: JSON.stringify({
          pinataContent: profile,
          pinataMetadata: {
            name: `Profile-${profile.address}-${Date.now()}`,
            keyvalues: {
              type: 'user-profile',
              address: profile.address
            }
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('User profile uploaded to IPFS:', result.IpfsHash);
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading user profile:', error);
      throw error;
    }
  }

  // Upload image to IPFS
  async uploadImage(file: File): Promise<string> {
    try {
      validatePinataConfig();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('pinataMetadata', JSON.stringify({
        name: `Image-${Date.now()}`,
        keyvalues: {
          type: 'token-logo'
        }
      }));
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1
      }));

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': PINATA_API_KEY!,
          'pinata_secret_api_key': PINATA_SECRET_KEY!,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Image uploaded to IPFS:', result.IpfsHash);
      return `${PINATA_GATEWAY}${result.IpfsHash}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Retrieve data from IPFS
  async getData(hash: string): Promise<any> {
    try {
      // Try Pinata gateway first, fallback to public IPFS gateway
      let response = await fetch(`${PINATA_GATEWAY}${hash}`);
      
      if (!response.ok) {
        console.log('Pinata gateway failed, trying public IPFS gateway...');
        response = await fetch(`${IPFS_GATEWAY}${hash}`);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data from IPFS: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error retrieving data from IPFS:', error);
      throw error;
    }
  }

  // Pin existing hash to Pinata
  async pinByHash(hash: string): Promise<void> {
    try {
      validatePinataConfig();
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY!,
          'pinata_secret_api_key': PINATA_SECRET_KEY!,
        },
        body: JSON.stringify({
          hashToPin: hash,
          pinataMetadata: {
            name: `Pinned-${Date.now()}`,
          },
        }),
      });

      if (response.ok) {
        console.log('Hash pinned successfully to Pinata');
      } else {
        console.warn('Failed to pin hash to Pinata');
      }
    } catch (error) {
      console.error('Error pinning hash to Pinata:', error);
    }
  }

  // Create token registry entry
  async createTokenRegistry(tokens: { address: string; metadataHash: string }[]): Promise<string> {
    try {
      validatePinataConfig();

      const registry = {
        version: '1.0.0',
        timestamp: Date.now(),
        totalTokens: tokens.length,
        tokens,
      };

      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY!,
          'pinata_secret_api_key': PINATA_SECRET_KEY!,
        },
        body: JSON.stringify({
          pinataContent: registry,
          pinataMetadata: {
            name: `TokenRegistry-${Date.now()}`,
            keyvalues: {
              type: 'token-registry',
              count: tokens.length.toString()
            }
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error('Error creating token registry:', error);
      throw error;
    }
  }
}

export const ipfsService = new IPFSService();