import { useState, useCallback } from 'react';
import { ipfsService, TokenMetadata, UserProfile, BadgeProgress } from '../services/ipfs';

export function useIPFS() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadTokenMetadata = useCallback(async (metadata: TokenMetadata): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const hash = await ipfsService.uploadTokenMetadata(metadata);
      return hash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadUserProfile = useCallback(async (profile: UserProfile): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const hash = await ipfsService.uploadUserProfile(profile);
      return hash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const url = await ipfsService.uploadImage(file);
      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Image upload failed';
      setUploadError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const getData = useCallback(async (hash: string): Promise<any> => {
    try {
      return await ipfsService.getData(hash);
    } catch (error) {
      console.error('Error fetching IPFS data:', error);
      return null;
    }
  }, []);

  return {
    uploadTokenMetadata,
    uploadUserProfile,
    uploadImage,
    getData,
    isUploading,
    uploadError,
  };
}

export function useTokenRegistry() {
  const [tokens, setTokens] = useState<Array<{ address: string; metadataHash: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addToken = useCallback(async (address: string, metadataHash: string) => {
    const newTokens = [...tokens, { address, metadataHash }];
    setTokens(newTokens);
    
    try {
      const registryHash = await ipfsService.createTokenRegistry(newTokens);
      localStorage.setItem('tokenRegistryHash', registryHash);
    } catch (error) {
      console.error('Error updating token registry:', error);
    }
  }, [tokens]);

  const loadTokenRegistry = useCallback(async () => {
    setIsLoading(true);
    try {
      const registryHash = localStorage.getItem('tokenRegistryHash');
      if (registryHash) {
        const registry = await ipfsService.getData(registryHash);
        setTokens(registry.tokens || []);
      }
    } catch (error) {
      console.error('Error loading token registry:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tokens,
    addToken,
    loadTokenRegistry,
    isLoading,
  };
}