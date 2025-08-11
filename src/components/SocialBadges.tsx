import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useUserBadges, BadgeType, useBadgeNFT } from '../hooks/useBadgeNFT';
import { 
  Award, Trophy, Star, Crown, Shield, Zap, 
  Users, TrendingUp, Target, Flame, Download, Share2 
} from 'lucide-react';

const SocialBadges: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { badges, isLoading: badgesLoading } = useUserBadges(address);
  const { mintBadge, isPending } = useBadgeNFT();
  
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const badgeTypes = [
    {
      id: 'creator',
      name: 'Token Creator',
      description: 'Successfully launched your first meme token',
      icon: Award,
      color: 'from-blue-500 to-purple-600',
      rarity: 'Common',
      requirement: 'Create 1 token',
    },
    {
      id: 'launch',
      name: 'Launch Master',
      description: 'Launched a token with proper liquidity',
      icon: Trophy,
      color: 'from-green-500 to-emerald-600',
      rarity: 'Common',
      requirement: 'Add liquidity > 1 ETH',
    },
    {
      id: 'volume',
      name: 'Volume King',
      description: 'Generated over $100K in trading volume',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-600',
      rarity: 'Rare',
      requirement: '$100K+ volume',
    },
    {
      id: 'community',
      name: 'Community Builder',
      description: 'Attracted 1000+ token holders',
      icon: Users,
      color: 'from-pink-500 to-rose-600',
      rarity: 'Rare',
      requirement: '1000+ holders',
    },
    {
      id: 'diamond',
      name: 'Diamond Hands',
      description: 'Held tokens for 6+ months',
      icon: Shield,
      color: 'from-cyan-500 to-blue-600',
      rarity: 'Epic',
      requirement: 'Hold 6+ months',
    },
    {
      id: 'viral',
      name: 'Viral Sensation',
      description: 'Token mentioned 10K+ times on social media',
      icon: Flame,
      color: 'from-yellow-500 to-orange-600',
      rarity: 'Epic',
      requirement: '10K+ mentions',
    },
    {
      id: 'whale',
      name: 'Whale Caller',
      description: 'Attracted whales with 10+ ETH investments',
      icon: Crown,
      color: 'from-purple-500 to-pink-600',
      rarity: 'Legendary',
      requirement: 'Whale investors',
    },
    {
      id: 'perfectshot',
      name: 'Perfect Shot',
      description: 'Token reached 1000x from launch price',
      icon: Target,
      color: 'from-indigo-500 to-purple-600',
      rarity: 'Legendary',
      requirement: '1000x price increase',
    },
  ];

  const rarityColors = {
    Common: 'text-gray-400',
    Rare: 'text-blue-400',
    Epic: 'text-purple-400',
    Legendary: 'text-yellow-400',
  };

  const getUserBadge = (badgeType: BadgeType) => {
    return badges?.includes(BigInt(badgeType));
  };

  const handleMintBadge = async (badgeType: BadgeType) => {
    if (!address) return;
    try {
      await mintBadge(badgeType, address);
    } catch (error) {
      console.error('Failed to mint badge:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-300 text-lg">Please connect your wallet to view your badges</p>
        </div>
      </div>
    );
  }

  const achievements = [
    { label: 'Tokens Created', value: 0, max: 1 },
    { label: 'Total Volume', value: 0, max: 1, format: '$' },
    { label: 'Total Holders', value: 0, max: 1 },
    { label: 'Success Rate', value: 0, max: 1, format: '%' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-600/20 border border-yellow-500/30 mb-6"
        >
          <Trophy className="w-4 h-4 text-yellow-300 mr-2" />
          <span className="text-yellow-300 text-sm font-medium">Achievement System</span>
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Social Badge
          <span className="bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent">
            {" "}NFTs
          </span>
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Earn exclusive NFT badges for your achievements and show off your meme coin success to the community.
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {achievements.map((achievement, index) => (
          <motion.div
            key={index}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{achievement.label}</span>
                <span className="text-white">
                  {achievement.format === '$' 
                    ? `$${achievement.value.toLocaleString()}`
                    : achievement.format === '%'
                    ? `${achievement.value}%`
                    : achievement.value.toLocaleString()
                  }
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((achievement.value / achievement.max) * 100, 100)}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Badge Collection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {badgeTypes.map((badge, index) => {
          const badgeTypeEnum = BadgeType[badge.id.toUpperCase() as keyof typeof BadgeType];
          const isEarned = getUserBadge(badgeTypeEnum);
          const progress = 0; // Would need to calculate based on actual metrics

          return (
            <motion.div
              key={badge.id}
              className={`backdrop-blur-xl border rounded-2xl p-6 cursor-pointer transition-all ${
                isEarned 
                  ? 'bg-white/10 border-white/20 hover:bg-white/15' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => setSelectedBadge(badge)}
            >
              <div className="text-center">
                <motion.div
                  className={`p-4 bg-gradient-to-r ${badge.color} rounded-xl w-fit mx-auto mb-4 ${
                    !isEarned ? 'grayscale opacity-50' : ''
                  }`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <badge.icon className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className={`font-bold mb-2 ${isEarned ? 'text-white' : 'text-gray-400'}`}>
                  {badge.name}
                </h3>
                
                <p className={`text-xs mb-3 ${isEarned ? 'text-gray-300' : 'text-gray-500'}`}>
                  {badge.description}
                </p>
                
                <div className={`text-xs font-medium ${rarityColors[badge.rarity as keyof typeof rarityColors]}`}>
                  {badge.rarity}
                </div>

                {!isEarned && progress > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{progress}% complete</div>
                  </div>
                )}

                {isEarned && (
                  <div className="flex justify-center space-x-2 mt-4">
                    <motion.button
                      onClick={() => handleMintBadge(badgeTypeEnum)}
                      disabled={isPending}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Download className={`w-4 h-4 ${isPending ? 'text-gray-400' : 'text-white'}`} />
                    </motion.button>
                    <motion.button
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Badge Details Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="backdrop-blur-xl bg-gray-900/90 border border-white/20 rounded-3xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  className={`p-6 bg-gradient-to-r ${selectedBadge.color} rounded-2xl w-fit mx-auto mb-6`}
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <selectedBadge.icon className="w-12 h-12 text-white" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-white mb-2">{selectedBadge.name}</h2>
                <div className={`text-sm font-medium mb-4 ${rarityColors[selectedBadge.rarity as keyof typeof rarityColors]}`}>
                  {selectedBadge.rarity} Badge
                </div>
                
                <p className="text-gray-300 mb-6">{selectedBadge.description}</p>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  <div className="text-sm text-gray-400 mb-1">Requirement:</div>
                  <div className="text-white font-medium">{selectedBadge.requirement}</div>
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => selectedBadge && handleMintBadge(BadgeType[selectedBadge.id.toUpperCase() as keyof typeof BadgeType])}
                    disabled={isPending}
                    className={`flex-1 py-3 font-medium rounded-xl ${
                      isPending 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isPending ? 'Minting...' : 'Mint as NFT'}
                  </motion.button>
                  <motion.button
                    onClick={() => setSelectedBadge(null)}
                    className="px-6 py-3 border border-white/20 text-white font-medium rounded-xl hover:bg-white/5"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Tips */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">How to Earn Badges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-3 bg-blue-500/20 rounded-xl w-fit mx-auto mb-3">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Create Tokens</h3>
            <p className="text-gray-400 text-sm">Launch successful meme coins to earn creator badges</p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-green-500/20 rounded-xl w-fit mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Drive Volume</h3>
            <p className="text-gray-400 text-sm">Generate trading activity to unlock volume badges</p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-purple-500/20 rounded-xl w-fit mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Build Community</h3>
            <p className="text-gray-400 text-sm">Attract holders and build communities around your tokens</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialBadges;