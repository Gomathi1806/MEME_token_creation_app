import React from 'react';
import { TrendingUp, Users, DollarSign, Trophy, BarChart3, Activity } from 'lucide-react';

interface DashboardProps {
  tokens: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ tokens = [] }) => {
  const totalTokens = tokens.length;
  const totalValue = 0;
  const totalHolders = 0;

  const stats = [
    {
      title: 'Total Tokens Created',
      value: totalTokens.toString(),
      icon: Trophy,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Market Cap',
      value: '$0',
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Holders',
      value: '0',
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Success Rate',
      value: '0%',
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tokens */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Recent Tokens
          </h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            View All
          </button>
        </div>

        {tokens.length > 0 ? (
          <div className="space-y-4">
            {tokens.slice(0, 5).map((token: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {token.symbol?.charAt(0) || 'T'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{token.name}</h4>
                    <p className="text-gray-400 text-sm">{token.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    {token.address ? `${token.address.slice(0, 6)}...${token.address.slice(-4)}` : 'Pending'}
                  </p>
                  <p className="text-blue-400 text-sm flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Active
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No tokens created yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Create your first meme token to see it here
            </p>
          </div>
        )}
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Performance Overview
        </h3>
        <div className="h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Chart visualization coming soon</p>
            <p className="text-gray-500 text-sm mt-1">
              Real-time analytics and performance metrics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;