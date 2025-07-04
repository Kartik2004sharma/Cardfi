'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Gift, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface Reward {
  id: string;
  type: 'yield' | 'liquidity' | 'bonus' | 'referral';
  amount: number;
  token: string;
  description: string;
  earned: boolean;
  claimable: boolean;
  timestamp: string;
  apy?: number;
}

interface RewardSummary {
  totalEarned: number;
  totalClaimable: number;
  totalClaimed: number;
  currentAPY: number;
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [summary, setSummary] = useState<RewardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [selectedTab, setSelectedTab] = useState('earned');

  useEffect(() => {
    // Mock data for rewards
    const mockRewards: Reward[] = [
      {
        id: '1',
        type: 'yield',
        amount: 125.50,
        token: 'USDC',
        description: 'Yield from Compound Strategy',
        earned: true,
        claimable: true,
        timestamp: '2024-01-15 14:30:00',
        apy: 8.5
      },
      {
        id: '2',
        type: 'liquidity',
        amount: 89.25,
        token: 'USDC',
        description: 'Liquidity Mining Rewards',
        earned: true,
        claimable: true,
        timestamp: '2024-01-15 12:15:00',
        apy: 12.3
      },
      {
        id: '3',
        type: 'bonus',
        amount: 50.00,
        token: 'CFI',
        description: 'Early Adopter Bonus',
        earned: true,
        claimable: false,
        timestamp: '2024-01-14 10:00:00'
      },
      {
        id: '4',
        type: 'referral',
        amount: 25.00,
        token: 'USDC',
        description: 'Referral Bonus - Friend A',
        earned: true,
        claimable: true,
        timestamp: '2024-01-13 16:45:00'
      },
      {
        id: '5',
        type: 'yield',
        amount: 75.80,
        token: 'USDC',
        description: 'Yield from Aave Strategy',
        earned: false,
        claimable: false,
        timestamp: '2024-01-16 00:00:00',
        apy: 7.2
      }
    ];

    const mockSummary: RewardSummary = {
      totalEarned: 365.55,
      totalClaimable: 289.75,
      totalClaimed: 1250.00,
      currentAPY: 9.8
    };

    setTimeout(() => {
      setRewards(mockRewards);
      setSummary(mockSummary);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number, token: string = 'USD') => {
    if (token === 'USD' || token === 'USDC' || token === 'USDT') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
    return `${amount.toFixed(2)} ${token}`;
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'yield':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'liquidity':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case 'bonus':
        return <Gift className="h-4 w-4 text-purple-600" />;
      case 'referral':
        return <Gift className="h-4 w-4 text-orange-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getRewardTypeColor = (type: string) => {
    switch (type) {
      case 'yield':
        return 'bg-green-100 text-green-800';
      case 'liquidity':
        return 'bg-blue-100 text-blue-800';
      case 'bonus':
        return 'bg-purple-100 text-purple-800';
      case 'referral':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClaimAll = async () => {
    setClaiming(true);
    try {
      // Mock claim process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update rewards to mark as claimed
      setRewards(prev => prev.map(reward => 
        reward.claimable ? { ...reward, claimable: false } : reward
      ));
      
      alert('All rewards claimed successfully!');
    } catch (error) {
      console.error('Claim failed:', error);
      alert('Claim failed. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const earnedRewards = rewards.filter(r => r.earned);
  const upcomingRewards = rewards.filter(r => !r.earned);
  const claimableRewards = rewards.filter(r => r.claimable);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rewards</h1>
          <p className="text-muted-foreground">
            Track and claim your yield optimization rewards
          </p>
        </div>
        <Button 
          onClick={handleClaimAll}
          disabled={claiming || claimableRewards.length === 0}
        >
          {claiming ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
              Claiming...
            </>
          ) : (
            <>
              <Gift className="mr-2 h-4 w-4" />
              Claim All ({claimableRewards.length})
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalEarned)}</div>
              <p className="text-xs text-muted-foreground">Lifetime earnings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claimable</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalClaimable)}</div>
              <p className="text-xs text-muted-foreground">Ready to claim</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claimed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalClaimed)}</div>
              <p className="text-xs text-muted-foreground">Already claimed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current APY</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.currentAPY}%</div>
              <p className="text-xs text-muted-foreground">Weighted average</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="earned">Earned ({earnedRewards.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingRewards.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="earned" className="space-y-4">
          <div className="grid gap-4">
            {earnedRewards.map((reward) => (
              <Card key={reward.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getRewardIcon(reward.type)}
                      <div>
                        <p className="font-medium">{reward.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`text-xs ${getRewardTypeColor(reward.type)}`}>
                            {reward.type}
                          </Badge>
                          {reward.apy && (
                            <Badge variant="outline" className="text-xs">
                              {reward.apy}% APY
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(reward.amount, reward.token)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(reward.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(reward.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {reward.claimable ? (
                      <Button size="sm">
                        Claim {formatCurrency(reward.amount, reward.token)}
                      </Button>
                    ) : (
                      <Badge variant="outline">
                        {reward.earned ? 'Claimed' : 'Not Available'}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4">
            {upcomingRewards.map((reward) => (
              <Card key={reward.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getRewardIcon(reward.type)}
                      <div>
                        <p className="font-medium">{reward.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`text-xs ${getRewardTypeColor(reward.type)}`}>
                            {reward.type}
                          </Badge>
                          {reward.apy && (
                            <Badge variant="outline" className="text-xs">
                              {reward.apy}% APY
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(reward.amount, reward.token)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expected: {new Date(reward.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
