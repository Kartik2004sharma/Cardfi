'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  BarChart3,
  ArrowUpRight,
  Wallet,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalBalance: number;
  totalYield: number;
  monthlyYield: number;
  activeStrategies: number;
  cardBalance: number;
  pendingRewards: number;
  currentAPY: number;
}

interface RecentActivity {
  id: string;
  type: 'deposit' | 'withdraw' | 'yield' | 'rebalance' | 'card';
  description: string;
  amount: number;
  timestamp: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for dashboard
    const mockStats: DashboardStats = {
      totalBalance: 25750.80,
      totalYield: 2145.50,
      monthlyYield: 187.25,
      activeStrategies: 3,
      cardBalance: 245.80,
      pendingRewards: 89.25,
      currentAPY: 8.7
    };

    const mockActivities: RecentActivity[] = [
      {
        id: '1',
        type: 'yield',
        description: 'Compound Strategy Yield',
        amount: 125.50,
        timestamp: '2024-01-15 14:30:00'
      },
      {
        id: '2',
        type: 'card',
        description: 'MetaMask Card Auto Top-up',
        amount: 500.00,
        timestamp: '2024-01-15 10:15:00'
      },
      {
        id: '3',
        type: 'rebalance',
        description: 'Portfolio Rebalanced',
        amount: 0,
        timestamp: '2024-01-14 16:45:00'
      },
      {
        id: '4',
        type: 'deposit',
        description: 'USDC Deposit',
        amount: 5000.00,
        timestamp: '2024-01-14 09:20:00'
      }
    ];

    setTimeout(() => {
      setStats(mockStats);
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'yield':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'card':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'rebalance':
        return <BarChart3 className="h-4 w-4 text-purple-600" />;
      case 'deposit':
        return <Wallet className="h-4 w-4 text-green-600" />;
      case 'withdraw':
        return <Wallet className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'yield':
        return 'text-green-600';
      case 'card':
        return 'text-blue-600';
      case 'rebalance':
        return 'text-purple-600';
      case 'deposit':
        return 'text-green-600';
      case 'withdraw':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your CardFi yield optimization performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/strategies">View Strategies</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/swap">Quick Swap</Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              +{((stats.monthlyYield / stats.totalBalance) * 100).toFixed(2)}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentAPY}%</div>
            <p className="text-xs text-muted-foreground">
              Weighted average across strategies
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Yield</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyYield)}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.activeStrategies} active strategies
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Card Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.cardBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Auto top-up enabled
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-20 flex-col space-y-2" variant="outline" asChild>
                <Link href="/dashboard/strategies">
                  <BarChart3 className="h-6 w-6" />
                  <span>Manage Strategies</span>
                </Link>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline" asChild>
                <Link href="/dashboard/liquidity">
                  <DollarSign className="h-6 w-6" />
                  <span>Add Liquidity</span>
                </Link>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline" asChild>
                <Link href="/dashboard/swap">
                  <ArrowUpRight className="h-6 w-6" />
                  <span>Cross-chain Swap</span>
                </Link>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline" asChild>
                <Link href="/dashboard/rewards">
                  <TrendingUp className="h-6 w-6" />
                  <span>Claim Rewards</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/contracts">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                    {activity.amount > 0 ? formatCurrency(activity.amount) : '-'}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Strategy Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Strategy Performance</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/strategies">Manage Strategies</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Compound USDC Strategy</p>
                  <p className="text-sm text-muted-foreground">Ethereum • Active</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(12500)}</p>
                <Badge variant="outline" className="text-xs">8.5% APY</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Aave USDC Pool</p>
                  <p className="text-sm text-muted-foreground">Polygon • Active</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(8750)}</p>
                <Badge variant="outline" className="text-xs">7.2% APY</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Uniswap V3 USDC/USDT</p>
                  <p className="text-sm text-muted-foreground">Arbitrum • Active</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(4500)}</p>
                <Badge variant="outline" className="text-xs">12.1% APY</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
