'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { enhancedMetaMaskService } from '@/lib/enhanced-metamask';

interface CardActivitySummary {
  totalSpent: string;
  lastTransaction: Date | null;
  monthlySpending: string;
  categories: Record<string, number>;
  rewardBalance: string;
  activities: Array<{
    id: string;
    amount: number;
    currency: string;
    merchant: string;
    category: string;
    timestamp: Date;
    status: 'pending' | 'completed' | 'failed';
  }>;
}

interface DelegationInfo {
  delegateAddress: string;
  canSign: boolean;
  canSpend: boolean;
  maxAmount: string;
  expiration: Date;
}

export function useEnhancedMetaMask() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const [isMetaMaskReady, setIsMetaMaskReady] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [cardActivity, setCardActivity] = useState<CardActivitySummary | null>(null);
  const [delegation, setDelegation] = useState<DelegationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check MetaMask installation status
  useEffect(() => {
    const checkInstallation = () => {
      const installed = enhancedMetaMaskService.isInstalled();
      setIsMetaMaskInstalled(installed);
    };

    checkInstallation();
    
    // Check again when window loads (in case MetaMask loads after our check)
    if (typeof window !== 'undefined') {
      window.addEventListener('load', checkInstallation);
      return () => window.removeEventListener('load', checkInstallation);
    }
  }, []);

  // Initialize enhanced MetaMask service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await enhancedMetaMaskService.initialize();
        setIsMetaMaskReady(true);
        // Recheck installation after initialization
        setIsMetaMaskInstalled(enhancedMetaMaskService.isInstalled());
      } catch (err) {
        console.error('Failed to initialize enhanced MetaMask service:', err);
        setError('Failed to initialize MetaMask integration');
      }
    };

    initializeService();
  }, []);

  // Fetch card activity when wallet is connected
  const fetchCardActivity = useCallback(async () => {
    if (!isConnected || !address || !isMetaMaskReady) return;

    setIsLoading(true);
    setError(null);

    try {
      const activities = await enhancedMetaMaskService.getCardActivity(address);
      
      // Transform the activities array into a summary
      const totalSpent = activities.reduce((sum, activity) => 
        sum + (activity.status === 'completed' ? activity.amount : 0), 0
      );
      
      const lastTransaction = activities.length > 0 
        ? activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp
        : null;
      
      // Calculate monthly spending (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const monthlySpending = activities
        .filter(activity => 
          activity.timestamp >= thirtyDaysAgo && activity.status === 'completed'
        )
        .reduce((sum, activity) => sum + activity.amount, 0);
      
      // Categorize spending
      const categories: Record<string, number> = {};
      activities.forEach(activity => {
        if (activity.status === 'completed') {
          categories[activity.category] = (categories[activity.category] || 0) + activity.amount;
        }
      });

      const activitySummary: CardActivitySummary = {
        totalSpent: totalSpent.toString(),
        lastTransaction,
        monthlySpending: monthlySpending.toString(),
        categories,
        rewardBalance: (totalSpent * 0.01).toString(), // Mock 1% rewards
        activities,
      };
      
      setCardActivity(activitySummary);
    } catch (err) {
      console.error('Failed to fetch card activity:', err);
      setError('Failed to fetch MetaMask Card activity');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, isMetaMaskReady]);

  // Fetch delegation info
  const fetchDelegation = useCallback(async () => {
    if (!isConnected || !address || !isMetaMaskReady) return;

    try {
      // Since there's no getDelegation method, we'll track delegations locally
      // In a real implementation, this would query the delegation registry
      console.log('Delegation info would be fetched here for address:', address);
    } catch (err) {
      console.error('Failed to fetch delegation info:', err);
    }
  }, [isConnected, address, isMetaMaskReady]);

  // Create delegation for yield management
  const createYieldDelegation = useCallback(async (vaultAddress: string) => {
    if (!isConnected || !address || !isMetaMaskReady) {
      throw new Error('MetaMask not ready or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const delegatePermissions = {
        canSign: true,
        canSpend: true,
        maxAmount: '10000', // Max $10,000 USDC
        expiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      };

      await enhancedMetaMaskService.createDelegate(vaultAddress, delegatePermissions);
      
      setDelegation({
        delegateAddress: vaultAddress,
        canSign: delegatePermissions.canSign,
        canSpend: delegatePermissions.canSpend,
        maxAmount: delegatePermissions.maxAmount,
        expiration: delegatePermissions.expiration,
      });

      return {
        delegateAddress: vaultAddress,
        permissions: delegatePermissions,
        description: 'CardFi Yield Manager - Automated DeFi yield optimization',
      };
    } catch (err) {
      console.error('Failed to create delegation:', err);
      setError('Failed to create yield delegation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, isMetaMaskReady]);

  // Revoke delegation
  const revokeDelegation = useCallback(async (delegateAddress: string) => {
    if (!isConnected || !address || !isMetaMaskReady) {
      throw new Error('MetaMask not ready or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      await enhancedMetaMaskService.revokeDelegate(delegateAddress);
      setDelegation(null); // Clear delegation info
    } catch (err) {
      console.error('Failed to revoke delegation:', err);
      setError('Failed to revoke delegation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, isMetaMaskReady]);

  // Get spending-based yield recommendations
  const getYieldRecommendations = useCallback(async () => {
    if (!cardActivity) return null;

    try {
      const monthlySpend = parseFloat(cardActivity.monthlySpending);
      const rewardBalance = parseFloat(cardActivity.rewardBalance);
      
      // Calculate recommended allocation based on spending patterns
      const recommendedAmount = Math.min(monthlySpend * 3, rewardBalance);
      
      return {
        recommendedAmount: recommendedAmount.toString(),
        reasoning: `Based on your monthly spending of $${monthlySpend.toLocaleString()}, we recommend allocating $${recommendedAmount.toLocaleString()} to yield generation.`,
        expectedMonthlyYield: (recommendedAmount * 0.08 / 12).toFixed(2), // 8% APY
        categories: cardActivity.categories,
      };
    } catch (err) {
      console.error('Failed to calculate yield recommendations:', err);
      return null;
    }
  }, [cardActivity]);

  // Check if user has sufficient card activity for yield optimization
  const hasCardActivity = useCallback(() => {
    return cardActivity && parseFloat(cardActivity.totalSpent) > 0;
  }, [cardActivity]);

  // Get Card rewards that can be used for yield
  const getAvailableRewards = useCallback(() => {
    return cardActivity ? parseFloat(cardActivity.rewardBalance) : 0;
  }, [cardActivity]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchCardActivity(),
      fetchDelegation(),
    ]);
  }, [fetchCardActivity, fetchDelegation]);

  // Auto-refresh data when wallet connects
  useEffect(() => {
    if (isConnected && isMetaMaskReady) {
      refreshData();
    }
  }, [isConnected, isMetaMaskReady, refreshData]);

  return {
    // State
    isMetaMaskReady,
    cardActivity,
    delegation,
    isLoading,
    error,
    
    // Actions
    fetchCardActivity,
    fetchDelegation,
    createYieldDelegation,
    revokeDelegation,
    refreshData,
    
    // Computed values
    getYieldRecommendations,
    hasCardActivity,
    getAvailableRewards,
    
    // Status
    isConnected: isConnected && isMetaMaskReady,
    isMetaMaskInstalled,
  };
}
