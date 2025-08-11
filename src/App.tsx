import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutomaticBadges } from './hooks/useAutomaticBadges';
import Header from './components/Header';
import Hero from './components/Hero';
import TokenCreator from './components/TokenCreator';
import Dashboard from './components/Dashboard';
import NameGenerator from './components/NameGenerator';
import SocialBadges from './components/SocialBadges';
import TelegramBot from './components/TelegramBot';
import Footer from './components/Footer';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  
  // Initialize automatic badge monitoring
  useAutomaticBadges();

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return <TokenCreator />;
      case 'dashboard':
        return <Dashboard tokens={[]} />;
      case 'generator':
        return <NameGenerator />;
      case 'badges':
        return <SocialBadges />;
      case 'telegram':
        return <TelegramBot />;
      default:
        return <Hero onGetStarted={() => setActiveTab('create')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.02%22%3E%3Cpath%20d=%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />
      
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;