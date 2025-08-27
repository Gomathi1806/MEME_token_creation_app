import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTokenFactory } from '../hooks/useTokenFactory';
import { useFarcasterMiniApp } from '../hooks/useFarcasterMiniApp';
import { 
  Coins, Zap, CheckCircle, AlertCircle, 
  ArrowRight, Copy, ExternalLink, Share2
} from 'lucide-react';

const MiniAppTokenCreator: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { createToken, hash, isPending, isConfirming, isSuccess, error } = useTokenFactory();
  const { actions: farcasterActions, isInFarcaster } = useFarcasterMiniApp();
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    totalSupply: '1000000000',
    initialLiquidity: '0.001',
    lockPeriod: '365',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeploy = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await createToken(formData);
    } catch (err) {
      console.error('Deployment failed:', err);
    }
  };

  const handleShare = () => {
    if (isInFarcaster && hash) {
      farcasterActions.shareTokenCreation({
        name: formData.name,
        symbol: formData.symbol,
        address: hash,
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="p-4 space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle className="w-8 h-8 text-green-400" />
        </motion.div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Token Deployed!</h3>
          <p className="text-gray-300 text-sm">Your meme coin is now live on Base</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Name:</span>
            <span className="text-white font-medium">{formData.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Symbol:</span>
            <span className="text-white font-medium">{formData.symbol}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Contract:</span>
            <div className="flex items-center space-x-2">
              <span className="text-white font-mono text-xs">
                {hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : 'Pending...'}
              </span>
              <button className="p-1 hover:bg-white/5 rounded">
                <Copy className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          {isInFarcaster && (
            <motion.button
              onClick={handleShare}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share2 className="w-4 h-4" />
              <span>Share on Farcaster</span>
            </motion.button>
          )}
          
          <motion.button
            onClick={() => hash && window.open(`https://basescan.org/tx/${hash}`, '_blank')}
            className="w-full py-3 border border-white/20 text-white font-medium rounded-xl flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on BaseScan</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Token</h2>
        <p className="text-gray-300 text-sm">Deploy in 3 clicks on Base network</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Token Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="DogeCoin 2.0"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Symbol
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
              placeholder="DOGE2"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Total Supply
          </label>
          <input
            type="number"
            value={formData.totalSupply}
            onChange={(e) => handleInputChange('totalSupply', e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Liquidity (ETH)
            </label>
            <input
              type="number"
              value={formData.initialLiquidity}
              onChange={(e) => handleInputChange('initialLiquidity', e.target.value)}
              step="0.001"
              min="0.001"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Lock Period
            </label>
            <select
              value={formData.lockPeriod}
              onChange={(e) => handleInputChange('lockPeriod', e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            >
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
              <option value="180">6 Months</option>
              <option value="365">1 Year</option>
            </select>
          </div>
        </div>

        {/* Quick Features */}
        <div className="grid grid-cols-3 gap-2 py-3">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
            <Zap className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <div className="text-xs text-blue-300">Instant</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
            <CheckCircle className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <div className="text-xs text-green-300">Verified</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-center">
            <Coins className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-xs text-purple-300">Base</div>
          </div>
        </div>

        {(isPending || isConfirming) ? (
          <div className="text-center py-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
            />
            <p className="text-white text-sm">
              {isPending ? 'Confirm in wallet...' : 'Deploying token...'}
            </p>
          </div>
        ) : !isConnected ? (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-3">Connect your wallet to create tokens</p>
              <div className="[&>div]:!bg-gradient-to-r [&>div]:!from-blue-500 [&>div]:!to-purple-600 [&>div]:!border-0 [&>div]:!rounded-xl [&>div]:!font-medium [&>div]:!px-6 [&>div]:!py-3 [&>div]:!text-sm [&>div]:!shadow-lg [&>div]:!shadow-blue-500/25 [&>div]:!w-full">
                <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
              </div>
            </div>
          </div>
        ) : (
          <motion.button
            onClick={handleDeploy}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap className="w-4 h-4" />
            <span>Deploy Token</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <div className="text-sm text-red-300">
                <p className="font-medium mb-1">Deployment Failed:</p>
                <p className="text-xs break-words">{error.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniAppTokenCreator;
