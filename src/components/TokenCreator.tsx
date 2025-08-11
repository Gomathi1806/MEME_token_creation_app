import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useTokenFactory } from '../hooks/useTokenFactory';
import { useIPFS } from '../hooks/useIPFS';
import { BadgeType, useBadgeNFT } from '../hooks/useBadgeNFT';
import { TokenMetadata } from '../services/ipfs';
import { 
  Coins, Upload, Settings, Lock, CheckCircle, AlertCircle, 
  Info, Zap, Shield, TrendingUp, ArrowRight, Copy, ExternalLink, Image
} from 'lucide-react';

const TokenCreator: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { createToken, hash, isPending, isConfirming, isSuccess, error } = useTokenFactory();
  const { uploadTokenMetadata, uploadImage, isUploading } = useIPFS();
  const { mintBadge } = useBadgeNFT();
  
  const [step, setStep] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    totalSupply: '1000000000',
    description: '',
    logoUrl: '',
    website: '',
    twitter: '',
    telegram: '',
    initialLiquidity: '1',
    lockPeriod: '365',
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const steps = [
    { id: 1, title: 'Token Details', icon: Coins },
    { id: 2, title: 'Social & Branding', icon: Upload },
    { id: 3, title: 'Liquidity Settings', icon: Settings },
    { id: 4, title: 'Deploy & Lock', icon: Lock },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeploy = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // Upload to IPFS with Pinata
      let logoUrl = formData.logoUrl;
      
      // Upload logo to IPFS if file is selected
      if (logoFile) {
        logoUrl = await uploadImage(logoFile);
      }

      // Create metadata object
      const metadata: TokenMetadata = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: logoUrl,
        website: formData.website,
        twitter: formData.twitter,
        telegram: formData.telegram,
        totalSupply: formData.totalSupply,
        initialLiquidity: formData.initialLiquidity,
        lockPeriod: formData.lockPeriod,
        createdAt: Date.now(),
        creator: address!,
        liquidityModel: 'hybrid-social',
        socialMetrics: {
          holders: 1,
          volume24h: '0',
          marketCap: '0',
          socialScore: 1,
        },
      };

      // Upload metadata to IPFS
      const metadataHash = await uploadTokenMetadata(metadata);
      
      await createToken(formData);
      
      // Mint creator badge after successful token creation
      if (address) {
        try {
          await mintBadge(BadgeType.TOKEN_CREATOR, address);
        } catch (badgeError) {
          console.warn('Badge minting failed:', badgeError);
          // Don't fail the entire process if badge minting fails
        }
      }
    } catch (err) {
      console.error('Deployment failed:', err);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., DogeCoin 2.0"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Symbol *
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                  placeholder="e.g., DOGE2"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Supply *
              </label>
              <input
                type="number"
                value={formData.totalSupply}
                onChange={(e) => handleInputChange('totalSupply', e.target.value)}
                placeholder="1000000000"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell the world about your meme coin..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Token Logo
              </label>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`flex items-center justify-center w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all cursor-pointer ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Image className="w-5 h-5 mr-2" />
                      {isUploading ? 'Uploading...' : 'Upload Logo to IPFS'}
                    </label>
                  </div>
                  {logoPreview && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="text-center text-gray-400 text-sm">OR</div>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yoursite.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter
                </label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  placeholder="@yourmemecoin"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telegram
                </label>
                <input
                  type="text"
                  value={formData.telegram}
                  onChange={(e) => handleInputChange('telegram', e.target.value)}
                  placeholder="@yourmemecoin"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">IPFS Storage:</p>
                  <p>Your token metadata and logo will be stored on IPFS for decentralized, permanent access. Social links help build trust and community.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Initial Liquidity (ETH)
              </label>
              <input
                type="number"
                value={formData.initialLiquidity}
                onChange={(e) => handleInputChange('initialLiquidity', e.target.value)}
                placeholder="0.0001"
                step="0.0001"
                min="0.001"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Minimum: 0.001 ETH (platform fee included)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lock Period (Days)
              </label>
              <select
                value={formData.lockPeriod}
                onChange={(e) => handleInputChange('lockPeriod', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="180">6 Months</option>
                <option value="365">1 Year</option>
                <option value="730">2 Years</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Hybrid Liquidity</span>
                </div>
                <p className="text-sm text-green-300">Social-driven dynamic liquidity with bonding curves</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Instant Deploy</span>
                </div>
                <p className="text-sm text-blue-300">Deploy in seconds with one click</p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 font-medium">Base Verified</span>
                </div>
                <p className="text-sm text-purple-300">Automatically verified on Base</p>
              </div>
            </div>
          </div>
        );

      case 4:
        if (isSuccess) {
          return (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-10 h-10 text-green-400" />
              </motion.div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Token Deployed Successfully!</h3>
                <p className="text-gray-300">Your meme coin is now live on Base network</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Contract Address:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono text-sm">
                      {hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : 'Pending...'}
                    </span>
                    <button className="p-1 hover:bg-white/5 rounded">
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Transaction Hash:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono text-sm">
                      {hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : 'Pending...'}
                    </span>
                    <button 
                      onClick={() => hash && window.open(`https://basescan.org/tx/${hash}`, '_blank')}
                      className="p-1 hover:bg-white/5 rounded"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => hash && window.open(`https://basescan.org/tx/${hash}`, '_blank')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View on BaseScan
                </motion.button>
                <motion.button
                  className="px-6 py-3 border border-white/20 text-white font-medium rounded-xl hover:bg-white/5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add to Dashboard
                </motion.button>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Ready to Deploy</h3>
              <p className="text-gray-300">Review your token details and deploy to Base network</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white ml-2">{formData.name || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Symbol:</span>
                  <span className="text-white ml-2">{formData.symbol || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Supply:</span>
                  <span className="text-white ml-2">{formData.totalSupply.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Liquidity:</span>
                  <span className="text-white ml-2">{formData.initialLiquidity} ETH</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-300">
                  <p className="font-medium mb-1">Important:</p>
                  <p>Once deployed, token details cannot be changed. Please review everything carefully.</p>
                </div>
              </div>
            </div>

            {(isPending || isConfirming) ? (
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-white">
                  {isPending ? 'Confirm transaction in wallet...' : 'Deploying your token...'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {isPending ? 'Check your wallet for the transaction' : 'This may take a few moments'}
                </p>
              </div>
            ) : (
              <motion.button
                onClick={handleDeploy}
                disabled={!isConnected}
                className={`w-full py-4 font-medium rounded-xl flex items-center justify-center space-x-2 ${
                  isConnected
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap className="w-5 h-5" />
                <span>
                  {!isConnected ? 'Connect Wallet to Deploy' : 'Deploy Token Now'}
                </span>
              </motion.button>
            )}
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div className="text-sm text-red-300">
                    <p className="font-medium mb-1">Deployment Failed:</p>
                    <p className="break-words">{error.message}</p>
                    {error.message.includes('contract not deployed') && (
                      <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                        <p className="text-yellow-300 text-xs">
                          <strong>Next Steps:</strong><br/>
                          1. Deploy the TokenFactory contract to Base network<br/>
                          2. Update the contract address in src/config/wagmi.ts<br/>
                          3. See DEPLOYMENT_INSTRUCTIONS.md for details
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Create Your Meme Token</h1>
        <p className="text-gray-300 text-lg">Launch your meme coin on Base in just a few steps</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex justify-between items-center">
          {steps.map((stepItem, index) => (
            <div key={stepItem.id} className="flex items-center">
              <motion.div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  step >= stepItem.id
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-white/20 text-gray-400'
                }`}
                whileHover={{ scale: 1.1 }}
              >
                <stepItem.icon className="w-5 h-5" />
              </motion.div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${step >= stepItem.id ? 'text-white' : 'text-gray-400'}`}>
                  {stepItem.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${step > stepItem.id ? 'bg-blue-500' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {!isSuccess && (
        <div className="flex justify-between">
          <motion.button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={`px-6 py-3 rounded-xl font-medium ${
              step === 1
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            whileHover={step > 1 ? { scale: 1.05 } : {}}
            whileTap={step > 1 ? { scale: 0.95 } : {}}
          >
            Previous
          </motion.button>

          {step < 4 && (
            <motion.button
              onClick={() => setStep(Math.min(4, step + 1))}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenCreator;