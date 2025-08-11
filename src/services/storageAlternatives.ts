// Storage Alternatives to Supabase
import { create } from 'ipfs-http-client';

// 1. IPFS + Local Storage Hybrid
export class IPFSLocalStorage {
  private ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
  });

  async storeAnalytics(data: any) {
    // Store on IPFS for permanence
    const result = await this.ipfs.add(JSON.stringify(data));
    
    // Store hash locally for quick access
    const analytics = JSON.parse(localStorage.getItem('analytics') || '{}');
    analytics[data.tokenAddress] = {
      ipfsHash: result.path,
      lastUpdated: Date.now(),
      cachedData: data,
    };
    localStorage.setItem('analytics', JSON.stringify(analytics));
    
    return result.path;
  }

  async getAnalytics(tokenAddress: string) {
    const analytics = JSON.parse(localStorage.getItem('analytics') || '{}');
    const tokenData = analytics[tokenAddress];
    
    if (tokenData && Date.now() - tokenData.lastUpdated < 300000) { // 5 min cache
      return tokenData.cachedData;
    }
    
    // Fetch from IPFS if cache expired
    if (tokenData?.ipfsHash) {
      try {
        const chunks = [];
        for await (const chunk of this.ipfs.cat(tokenData.ipfsHash)) {
          chunks.push(chunk);
        }
        return JSON.parse(Buffer.concat(chunks).toString());
      } catch (error) {
        console.error('Error fetching from IPFS:', error);
        return tokenData.cachedData; // Fallback to cached data
      }
    }
    
    return null;
  }
}

// 2. Firebase Alternative
export class FirebaseStorage {
  private apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  private projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  async storeData(collection: string, data: any) {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/${collection}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          fields: this.convertToFirestoreFormat(data),
        }),
      }
    );
    return response.json();
  }

  private convertToFirestoreFormat(obj: any) {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        result[key] = { doubleValue: value };
      } else if (typeof value === 'boolean') {
        result[key] = { booleanValue: value };
      }
    }
    return result;
  }
}

// 3. Decentralized Storage with Arweave
export class ArweaveStorage {
  private arweave = import.meta.env.VITE_ARWEAVE_KEY;

  async storeData(data: any) {
    const response = await fetch('https://arweave.net/tx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: btoa(JSON.stringify(data)),
        target: '',
        quantity: '0',
        reward: '1000000000', // Minimum fee
      }),
    });
    return response.json();
  }
}

// 4. Simple REST API Storage
export class RestAPIStorage {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://your-api.com';

  async storeAnalytics(data: any) {
    const response = await fetch(`${this.baseUrl}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async getAnalytics(tokenAddress: string) {
    const response = await fetch(`${this.baseUrl}/analytics/${tokenAddress}`);
    return response.json();
  }

  async storeBadgeProgress(userAddress: string, progress: any) {
    const response = await fetch(`${this.baseUrl}/badges/${userAddress}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress),
    });
    return response.json();
  }
}

// Export storage service based on environment
export const storageService = new IPFSLocalStorage(); // Default to IPFS + LocalStorage