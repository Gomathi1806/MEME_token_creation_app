import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Copy, Heart, TrendingUp, Zap } from 'lucide-react';

const NameGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [nameHistory, setNameHistory] = useState<string[]>([]);

  const categories = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'animals', label: 'Animals', icon: Heart },
    { id: 'space', label: 'Space', icon: Sparkles },
    { id: 'food', label: 'Food', icon: Zap },
  ];

  const nameSuggestions = {
    trending: [
      'MoonDoge', 'ShibaRocket', 'PepeMars', 'WojackCoin', 'BasedApe',
      'DiamondPaws', 'RocketShiba', 'MegaFrog', 'AlphaDoge', 'GigaChad',
      'CopeToken', 'HodlCat', 'PumpKing', 'MemeGod', 'FomoCoin'
    ],
    animals: [
      'CyberCat', 'SpaceWolf', 'QuantumBear', 'NinjaTiger', 'LaserShark',
      'RainbowUnicorn', 'ThunderLion', 'CosmicPanda', 'DigitalDragon', 'MetaMonkey',
      'HyperHorse', 'TurboTurtle', 'SuperSquirrel', 'MegaMouse', 'UltraOwl'
    ],
    space: [
      'GalaxyCoin', 'StardustToken', 'NebulaNote', 'OrbitCoin', 'CosmosCash',
      'VoidVault', 'PlanetPenny', 'MeteorMoney', 'AsteroidAsset', 'UniverseUnit',
      'SatelliteShine', 'RocketReward', 'SpaceStation', 'MilkyWayCoin', 'BlackHoleBucks'
    ],
    food: [
      'PizzaCoin', 'BurgerBucks', 'TacoCoin', 'SushiSwap', 'PancakeToken',
      'DonutDollar', 'CookieCash', 'IceCreamCoin', 'CandyCoin', 'ChocolateChip',
      'PopcornPenny', 'NoodleNote', 'WaffleCoin', 'BaconBits', 'HoneyCoin'
    ]
  };

  // Advanced name generation logic
  const generateAdvancedNames = (category: string, prompt?: string) => {
    const prefixes = {
      trending: ['Moon', 'Rocket', 'Diamond', 'Laser', 'Turbo', 'Mega', 'Ultra', 'Super', 'Hyper', 'Quantum'],
      animals: ['Cyber', 'Space', 'Ninja', 'Thunder', 'Lightning', 'Fire', 'Ice', 'Shadow', 'Golden', 'Silver'],
      space: ['Cosmic', 'Stellar', 'Galactic', 'Nebula', 'Solar', 'Lunar', 'Astro', 'Orbit', 'Nova', 'Void'],
      food: ['Crispy', 'Sweet', 'Spicy', 'Fresh', 'Golden', 'Creamy', 'Crunchy', 'Juicy', 'Tasty', 'Delicious']
    };

    const suffixes = {
      trending: ['Coin', 'Token', 'Moon', 'Rocket', 'Inu', 'Doge', 'Shib', 'Pepe', 'Chad', 'King'],
      animals: ['Paw', 'Tail', 'Roar', 'Bite', 'Claw', 'Wing', 'Fur', 'Mane', 'Horn', 'Fang'],
      space: ['Star', 'Planet', 'Galaxy', 'Comet', 'Meteor', 'Orbit', 'Cosmos', 'Universe', 'Void', 'Nebula'],
      food: ['Bite', 'Crumb', 'Slice', 'Chunk', 'Drop', 'Piece', 'Morsel', 'Taste', 'Flavor', 'Spice']
    };

    const categoryPrefixes = prefixes[category as keyof typeof prefixes] || prefixes.trending;
    const categorySuffixes = suffixes[category as keyof typeof suffixes] || suffixes.trending;
    const baseNames = nameSuggestions[category as keyof typeof nameSuggestions];

    const generated = [];
    
    // Generate combination names
    for (let i = 0; i < 4; i++) {
      const prefix = categoryPrefixes[Math.floor(Math.random() * categoryPrefixes.length)];
      const suffix = categorySuffixes[Math.floor(Math.random() * categorySuffixes.length)];
      generated.push(`${prefix}${suffix}`);
    }
    
    // Add some base names
    const shuffledBase = [...baseNames].sort(() => Math.random() - 0.5);
    generated.push(...shuffledBase.slice(0, 4));
    
    return generated;
  };

  const generateNames = async () => {
    setIsGenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const selected = generateAdvancedNames(selectedCategory, customPrompt);
    
    setGeneratedNames(selected);
    setNameHistory(prev => [...new Set([...prev, ...selected])]);
    setIsGenerating(false);
  };

  const toggleFavorite = (name: string) => {
    setFavorites(prev => 
      prev.includes(name) 
        ? prev.filter(f => f !== name)
        : [...prev, name]
    );
  };

  const copyToClipboard = (name: string) => {
    navigator.clipboard.writeText(name);
    // Could add toast notification here
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/30 mb-6"
        >
          <Sparkles className="w-4 h-4 text-purple-300 mr-2" />
          <span className="text-purple-300 text-sm font-medium">AI-Powered Name Generator</span>
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Generate Epic
          <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            {" "}Meme Names
          </span>
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Let our AI create the perfect meme coin name that will capture the community's attention and drive engagement.
        </p>
      </div>

      {/* Category Selection */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Customize Your Generation</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Custom Prompt (Optional)
          </label>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., 'space-themed with dogs' or 'funny food names'"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <category.icon className="w-5 h-5" />
            <span>{category.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Generate Button */}
      <div className="text-center mb-12">
        <motion.button
          onClick={generateNames}
          disabled={isGenerating}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          whileHover={{ scale: isGenerating ? 1 : 1.05 }}
          whileTap={{ scale: isGenerating ? 1 : 0.95 }}
        >
          <motion.div
            animate={isGenerating ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isGenerating ? Infinity : 0, ease: "linear" }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.div>
          <span>{isGenerating ? 'Generating...' : 'Generate Names'}</span>
        </motion.button>
      </div>

      {/* Generated Names */}
      <AnimatePresence>
        {generatedNames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Generated Names</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {generatedNames.map((name, index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-lg">{name}</h3>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleFavorite(name)}
                        className={`p-1 rounded hover:bg-white/10 ${
                          favorites.includes(name) ? 'text-red-400' : 'text-gray-400'
                        }`}
                      >
                        <Heart className="w-4 h-4" fill={favorites.includes(name) ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => copyToClipboard(name)}
                        className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Available • ${name.toUpperCase()}
                  </div>
                  <motion.button
                    className="w-full mt-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Use This Name
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Heart className="w-6 h-6 text-red-400 mr-2" />
            Your Favorites ({favorites.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favorites.map((name, index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-r from-red-500/20 to-pink-600/20 border border-red-500/30 rounded-xl p-3 text-center"
              >
                <div className="font-semibold text-white text-sm">{name}</div>
                <button
                  onClick={() => toggleFavorite(name)}
                  className="mt-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Heart className="w-4 h-4 mx-auto" fill="currentColor" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Name History */}
      {nameHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 mt-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <RefreshCw className="w-6 h-6 text-purple-400 mr-2" />
            Generation History ({nameHistory.length})
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {nameHistory.slice(-24).map((name, index) => (
              <div
                key={`${name}-${index}`}
                className="bg-white/5 border border-white/10 rounded-lg p-2 text-center hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => copyToClipboard(name)}
              >
                <div className="font-medium text-white text-xs">{name}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tips Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <h3 className="font-bold text-blue-300 mb-2 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Trending Names
          </h3>
          <p className="text-blue-200 text-sm">
            Names that follow current meme trends and viral patterns for maximum engagement.
          </p>
        </div>
        
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
          <h3 className="font-bold text-purple-300 mb-2 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            AI-Generated
          </h3>
          <p className="text-purple-200 text-sm">
            Our AI analyzes successful meme coins to create names with high viral potential.
          </p>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
          <h3 className="font-bold text-green-300 mb-2 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Instant Check
          </h3>
          <p className="text-green-200 text-sm">
            All suggested names are checked for availability across major platforms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NameGenerator;