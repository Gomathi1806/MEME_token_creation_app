import React, { useState } from 'react';
import { Bot, Send, Settings, Users } from 'lucide-react';

interface TelegramBotProps {
  className?: string;
}

export default function TelegramBot({ className = '' }: TelegramBotProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [botToken, setBotToken] = useState('');

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Bot className="w-8 h-8 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800">Telegram Bot</h2>
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Connect your Telegram bot to automatically promote your tokens and engage with your community.
          </p>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Bot Token
            </label>
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Enter your Telegram bot token"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setIsConnected(true)}
            disabled={!botToken}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Connect Bot
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Bot Connected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Members</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Send className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Messages</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Status</span>
              </div>
              <p className="text-sm font-medium text-green-600">Active</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
              Configure
            </button>
            <button 
              onClick={() => setIsConnected(false)}
              className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}