import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Twitter, Github, MessageCircle, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: MessageCircle, href: '#', label: 'Discord' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { label: 'Create Token', href: '#' },
        { label: 'Dashboard', href: '#' },
        { label: 'Name Generator', href: '#' },
        { label: 'Telegram Bots', href: '#' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: 'https://docs.memecoin-toolkit.com' },
        { label: 'API Reference', href: 'https://api.memecoin-toolkit.com' },
        { label: 'Tutorials', href: 'https://learn.memecoin-toolkit.com' },
        { label: 'Support', href: 'https://support.memecoin-toolkit.com' },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'Discord', href: '#' },
        { label: 'Twitter', href: '#' },
        { label: 'Telegram', href: '#' },
        { label: 'Reddit', href: '#' },
      ],
    },
  ];

  return (
    <footer className="relative mt-20 border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div 
              className="flex items-center space-x-2 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">MemeCoin Toolkit</h3>
                <p className="text-xs text-blue-300">Powered by Base</p>
              </div>
            </motion.div>
            
            <p className="text-gray-400 mb-6 max-w-md">
              The most powerful platform for creating, launching, and managing meme coins on Base network. 
              Join thousands of creators building the future of meme finance.
            </p>
            
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <motion.a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                      whileHover={{ x: 4 }}
                    >
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-white/10">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 MemeCoin Toolkit. All rights reserved. Built on Base Network.
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <motion.a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
              whileHover={{ y: -2 }}
            >
              Privacy Policy
            </motion.a>
            <motion.a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
              whileHover={{ y: -2 }}
            >
              Terms of Service
            </motion.a>
            <motion.a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
              whileHover={{ y: -2 }}
            >
              Cookie Policy
            </motion.a>
          </div>
        </div>

        {/* Base Network Badge */}
        <div className="flex justify-center mt-8">
          <motion.div
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse" />
            <span className="text-blue-300 text-xs font-medium">Built on Base • Superchain Network</span>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;