'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnhancedMetaMask } from '@/hooks/useEnhancedMetaMask';
import { useAccount } from 'wagmi';
import { 
  CreditCard, 
  Shield, 
  Activity, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export function EnhancedMetaMaskStatus() {
  const { isConnected } = useAccount();
  const {
    isMetaMaskReady,
    isMetaMaskInstalled,
    cardActivity,
    delegation,
    error,
    refreshData,
    hasCardActivity,
    getAvailableRewards,
  } = useEnhancedMetaMask();

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Enhanced MetaMask Integration
        </CardTitle>
        <CardDescription>
          Advanced features for MetaMask Card users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* MetaMask Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {isMetaMaskInstalled ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-medium">MetaMask</span>
            </div>
            <Badge variant={isMetaMaskInstalled ? "default" : "destructive"}>
              {isMetaMaskInstalled ? "Installed" : "Not Found"}
            </Badge>
          </div>

          {/* Enhanced SDK Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {isMetaMaskReady ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Clock className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium">Enhanced SDK</span>
            </div>
            <Badge variant={isMetaMaskReady ? "default" : "secondary"}>
              {isMetaMaskReady ? "Ready" : "Loading"}
            </Badge>
          </div>

          {/* Card Activity Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {hasCardActivity() ? (
                <Activity className="w-4 h-4 text-blue-500" />
              ) : (
                <Activity className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm font-medium">Card Activity</span>
            </div>
            <Badge variant={hasCardActivity() ? "default" : "secondary"}>
              {hasCardActivity() ? "Active" : "No Data"}
            </Badge>
          </div>

          {/* Delegation Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {delegation ? (
                <Shield className="w-4 h-4 text-green-500" />
              ) : (
                <Settings className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm font-medium">Delegation</span>
            </div>
            <Badge variant={delegation ? "default" : "secondary"}>
              {delegation ? "Active" : "Manual"}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        {cardActivity && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Available Rewards:</span>
                <p className="font-medium">${getAvailableRewards().toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Monthly Spending:</span>
                <p className="font-medium">${parseFloat(cardActivity.monthlySpending).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Activity:</span>
                <p className="font-medium">
                  {cardActivity.lastTransaction 
                    ? cardActivity.lastTransaction.toLocaleDateString()
                    : 'None'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Integration Error</span>
            </div>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
            <Button 
              onClick={refreshData}
              size="sm"
              variant="outline"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
