'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useEnhancedMetaMask } from '@/hooks/useEnhancedMetaMask';
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ArrowUpRight,
  Settings,
  Clock,
  Star
} from 'lucide-react';

export function MetaMaskCardDashboard() {
  const {
    cardActivity,
    delegation,
    isLoading,
    error,
    hasCardActivity,
    getAvailableRewards,
    getYieldRecommendations,
    createYieldDelegation,
    revokeDelegation,
    refreshData,
    isMetaMaskReady,
    isConnected,
  } = useEnhancedMetaMask();

  const [recommendations, setRecommendations] = useState<any>(null);

  // Load recommendations when card activity changes
  useEffect(() => {
    const loadRecommendations = async () => {
      const recs = await getYieldRecommendations();
      setRecommendations(recs);
    };

    if (cardActivity) {
      loadRecommendations();
    }
  }, [cardActivity, getYieldRecommendations]);

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            MetaMask Card Integration
          </CardTitle>
          <CardDescription>
            Connect your wallet to access MetaMask Card features
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isMetaMaskReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            MetaMask Card Integration
          </CardTitle>
          <CardDescription>
            Initializing MetaMask integration...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <CreditCard className="w-5 h-5" />
            MetaMask Card Error
          </CardTitle>
          <CardDescription>
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refreshData} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const availableRewards = getAvailableRewards();

  return (
    <div className="space-y-6">
      {/* MetaMask Card Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Card Rewards</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${availableRewards.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for yield generation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${cardActivity ? parseFloat(cardActivity.monthlySpending).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yield Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={delegation ? "default" : "secondary"}>
                {delegation ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {delegation ? "Automated yield optimization enabled" : "Manual management"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Spending Categories */}
      {cardActivity && Object.keys(cardActivity.categories).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Spending by Category
            </CardTitle>
            <CardDescription>
              Your MetaMask Card activity breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(cardActivity.categories).map(([category, amount]) => {
              const percentage = (amount / parseFloat(cardActivity.totalSpent)) * 100;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{category}</span>
                    <span className="font-medium">${amount.toFixed(2)}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Yield Recommendations */}
      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Yield Recommendations
            </CardTitle>
            <CardDescription>
              Based on your MetaMask Card spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm mb-3">{recommendations.reasoning}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Recommended Amount:</span>
                  <p className="font-medium">${parseFloat(recommendations.recommendedAmount).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expected Monthly Yield:</span>
                  <p className="font-medium text-green-600">+${recommendations.expectedMonthlyYield}</p>
                </div>
              </div>
            </div>
            
            {!delegation && (
              <Button 
                onClick={() => createYieldDelegation('0x1234567890123456789012345678901234567890')}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Setting up...' : '⚡ Auto-Invest Now (v1)'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {cardActivity && cardActivity.activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Card Activity <Badge variant="outline" className="ml-2 text-xs">Sample Data</Badge>
            </CardTitle>
            <CardDescription>
              Your latest MetaMask Card transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cardActivity.activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">{activity.merchant}</p>
                    <p className="text-xs text-muted-foreground">{activity.category}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-medium">
                      ${activity.amount.toFixed(2)}
                    </p>
                    <Badge 
                      variant={activity.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delegation Management */}
      {delegation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Delegation Settings
            </CardTitle>
            <CardDescription>
              Manage your automated yield delegation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Delegate Address:</span>
                <p className="font-mono text-xs">{delegation.delegateAddress}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Max Amount:</span>
                <p className="font-medium">${delegation.maxAmount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Permissions:</span>
                <p className="font-medium">
                  {delegation.canSign && delegation.canSpend ? 'Full Access' : 'Limited'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Expires:</span>
                <p className="font-medium">{delegation.expiration.toLocaleDateString()}</p>
              </div>
            </div>
            
            <Separator />
            
            <Button 
              onClick={() => revokeDelegation(delegation.delegateAddress)}
              disabled={isLoading}
              variant="destructive"
              size="sm"
            >
              {isLoading ? 'Revoking...' : 'Revoke Delegation'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Card Activity State */}
      {!hasCardActivity() && (
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              No Card Activity Found
            </CardTitle>
            <CardDescription>
              Start using your MetaMask Card to see spending insights and yield recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshData} variant="outline">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Refresh Activity
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
