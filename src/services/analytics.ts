// Analytics Service for Real-time Token Data
import { createClient } from '@supabase/supabase-js';

// Supabase is optional - set to null to disable
export const supabase = null;

// To enable Supabase, uncomment and configure:
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// export const supabase = supabaseUrl && supabaseKey 
//   ? createClient(supabaseUrl, supabaseKey) 
//   : null;

export interface TokenAnalytics {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  liquidity: number;
  socialScore: number;
  lastUpdated: number;
}

export interface SocialMetrics {
  tokenAddress: string;
  twitterMentions: number;
  telegramMembers: number;
  discordMembers: number;
  redditMentions: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  trendingScore: number;
  lastUpdated: number;
}

export interface UserStats {
  address: string;
  tokensCreated: number;
  totalVolume: number;
  totalHolders: number;
  badgesEarned: string[];
  reputation: number;
  lastActive: number;
}

class AnalyticsService {
  // Track token creation
  async trackTokenCreation(tokenData: {
    address: string;
    name: string;
    symbol: string;
    creator: string;
    initialLiquidity: number;
    totalSupply: string;
  }) {
    if (!supabase) {
      // Store locally when Supabase is disabled
      const tokens = JSON.parse(localStorage.getItem('created_tokens') || '[]');
      tokens.push({
        ...tokenData,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('created_tokens', JSON.stringify(tokens));
      return;
    }

    try {
      const { error } = await supabase
        .from('tokens')
        .insert({
          address: tokenData.address,
          name: tokenData.name,
          symbol: tokenData.symbol,
          creator: tokenData.creator,
          initial_liquidity: tokenData.initialLiquidity,
          total_supply: tokenData.totalSupply,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      console.log('Token creation tracked');
    } catch (error) {
      console.error('Error tracking token creation:', error);
    }
  }

  // Update token analytics
  async updateTokenAnalytics(analytics: TokenAnalytics) {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('token_analytics')
        .upsert({
          address: analytics.address,
          price: analytics.price,
          price_change_24h: analytics.priceChange24h,
          volume_24h: analytics.volume24h,
          market_cap: analytics.marketCap,
          holders: analytics.holders,
          liquidity: analytics.liquidity,
          social_score: analytics.socialScore,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating token analytics:', error);
    }
  }

  // Get token analytics
  async getTokenAnalytics(address: string): Promise<TokenAnalytics | null> {
    if (!supabase) {
      // Return mock data when Supabase is disabled
      const tokens = JSON.parse(localStorage.getItem('created_tokens') || '[]');
      const token = tokens.find((t: any) => t.address === address);
      
      if (token) {
        return {
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          price: Math.random() * 0.01,
          priceChange24h: (Math.random() - 0.5) * 20,
          volume24h: Math.random() * 100000,
          marketCap: Math.random() * 1000000,
          holders: Math.floor(Math.random() * 1000) + 10,
          liquidity: parseFloat(token.initialLiquidity || '0'),
          socialScore: Math.random() * 100,
          lastUpdated: Date.now(),
        };
      }
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('token_analytics')
        .select('*')
        .eq('address', address)
        .single();

      if (error) throw error;
      
      return {
        address: data.address,
        name: data.name,
        symbol: data.symbol,
        price: data.price,
        priceChange24h: data.price_change_24h,
        volume24h: data.volume_24h,
        marketCap: data.market_cap,
        holders: data.holders,
        liquidity: data.liquidity,
        socialScore: data.social_score,
        lastUpdated: new Date(data.updated_at).getTime(),
      };
    } catch (error) {
      console.error('Error fetching token analytics:', error);
      return null;
    }
  }

  // Track user activity
  async trackUserActivity(address: string, activity: string, metadata?: any) {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('user_activity')
        .insert({
          user_address: address,
          activity,
          metadata,
          timestamp: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  }

  // Update social metrics
  async updateSocialMetrics(metrics: SocialMetrics) {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('social_metrics')
        .upsert({
          token_address: metrics.tokenAddress,
          twitter_mentions: metrics.twitterMentions,
          telegram_members: metrics.telegramMembers,
          discord_members: metrics.discordMembers,
          reddit_mentions: metrics.redditMentions,
          sentiment: metrics.sentiment,
          trending_score: metrics.trendingScore,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating social metrics:', error);
    }
  }

  // Get user stats
  async getUserStats(address: string): Promise<UserStats | null> {
    if (!supabase) {
      // Return local stats when Supabase is disabled
      const tokens = JSON.parse(localStorage.getItem('created_tokens') || '[]');
      const userTokens = tokens.filter((t: any) => t.creator === address);
      
      return {
        address,
        tokensCreated: userTokens.length,
        totalVolume: userTokens.reduce((sum: number, t: any) => sum + parseFloat(t.initialLiquidity || '0'), 0),
        totalHolders: userTokens.length * Math.floor(Math.random() * 100 + 10),
        badgesEarned: [],
        reputation: Math.min(userTokens.length * 10, 100),
        lastActive: Date.now(),
      };
    }

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('address', address)
        .single();

      if (error) throw error;

      return {
        address: data.address,
        tokensCreated: data.tokens_created,
        totalVolume: data.total_volume,
        totalHolders: data.total_holders,
        badgesEarned: data.badges_earned || [],
        reputation: data.reputation,
        lastActive: new Date(data.last_active).getTime(),
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  // Badge progress tracking
  async updateBadgeProgress(address: string, badgeType: string, progress: number) {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('badge_progress')
        .upsert({
          user_address: address,
          badge_type: badgeType,
          progress,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating badge progress:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();