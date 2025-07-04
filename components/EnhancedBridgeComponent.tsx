'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhancedMetaMask } from '@/hooks/useEnhancedMetaMask';
import { enhancedLiFiService } from '@/lib/enhanced-lifi-v2';
import { useAccount, useChainId } from 'wagmi';
import { 
  ArrowLeftRight, 
  DollarSign, 
  Clock, 
  Zap,
  Shield,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Chain {
  id: number;
  name: string;
  key: string;
}

const SUPPORTED_CHAINS: Chain[] = [
  { id: 1, name: 'Ethereum', key: 'ETH' },
  { id: 137, name: 'Polygon', key: 'MATIC' },
  { id: 42161, name: 'Arbitrum', key: 'ARB' },
  { id: 8453, name: 'Base', key: 'BASE' },
];

export function EnhancedBridgeComponent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { cardActivity, getAvailableRewards, isMetaMaskReady } = useEnhancedMetaMask();

  const [fromChain, setFromChain] = useState<number>(chainId || 1);
  const [toChain, setToChain] = useState<number>(137);
  const [amount, setAmount] = useState('');
  const [bridgeQuote, setBridgeQuote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimalChain, setOptimalChain] = useState<any>(null);

  // Initialize LiFi service
  useEffect(() => {
    const initLiFi = async () => {
      try {
        await enhancedLiFiService.initialize();
      } catch (err) {
        console.error('Failed to initialize LiFi service:', err);
      }
    };
    initLiFi();
  }, []);

  // Get optimal chain for yield when component mounts
  useEffect(() => {
    const fetchOptimalChain = async () => {
      if (amount) {
        try {
          const optimal = await enhancedLiFiService.getOptimalChainForYield(amount);
          setOptimalChain(optimal);
        } catch (err) {
          console.error('Failed to get optimal yield chain:', err);
        }
      }
    };
    fetchOptimalChain();
  }, [amount]);

  // Get bridge quote
  const getBridgeQuote = async () => {
    if (!amount || !address) return;

    setIsLoading(true);
    setError(null);

    try {
      const quote = await enhancedLiFiService.estimateBridgeFee(
        fromChain,
        toChain,
        amount,
        address
      );
      setBridgeQuote(quote);
    } catch (err) {
      console.error('Failed to get bridge quote:', err);
      setError('Failed to get bridge quote');
    } finally {
      setIsLoading(false);
    }
  };

  // Execute bridge transaction
  const executeBridge = async () => {
    if (!amount || !address) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would need a proper signer in a real implementation
      const result = await enhancedLiFiService.bridgeUSDCWithCCTP(
        fromChain,
        toChain,
        amount,
        address,
        null // Would need proper signer
      );
      
      console.log('Bridge transaction initiated:', result);
      // Handle success (show transaction hash, monitor status, etc.)
    } catch (err) {
      console.error('Failed to execute bridge:', err);
      setError('Failed to execute bridge transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fill with card rewards
  const useCardRewards = () => {
    const rewards = getAvailableRewards();
    setAmount(rewards.toString());
  };

  const getChainName = (chainId: number) => {
    return SUPPORTED_CHAINS.find(chain => chain.id === chainId)?.name || 'Unknown';
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            Cross-Chain Bridge
          </CardTitle>
          <CardDescription>
            Connect your wallet to bridge assets across chains
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bridge Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            Enhanced Cross-Chain Bridge
          </CardTitle>
          <CardDescription>
            Bridge USDC across chains with Circle CCTP v2 integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chain Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Chain</Label>
              <Select value={fromChain.toString()} onValueChange={(value) => setFromChain(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CHAINS.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To Chain</Label>
              <Select value={toChain.toString()} onValueChange={(value) => setToChain(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CHAINS.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Amount (USDC)</Label>
              {isMetaMaskReady && getAvailableRewards() > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={useCardRewards}
                  className="text-xs"
                >
                  Use Rewards: ${getAvailableRewards().toFixed(2)}
                </Button>
              )}
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Get Quote Button */}
          <Button
            onClick={getBridgeQuote}
            disabled={isLoading || !amount}
            className="w-full"
          >
            {isLoading ? 'Getting Quote...' : 'Get Bridge Quote'}
          </Button>

          {/* Bridge Quote Display */}
          {bridgeQuote && (
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Bridge Quote</span>
                {bridgeQuote.usesCCTP && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Circle CCTP
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Bridge Fee:</span>
                  <p className="font-medium">${bridgeQuote.bridgeFee}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Gas Fee:</span>
                  <p className="font-medium">${bridgeQuote.gasFee}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Fee:</span>
                  <p className="font-medium">${bridgeQuote.totalFee}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Est. Time:</span>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {Math.ceil(bridgeQuote.estimatedTime / 60)}m
                  </p>
                </div>
              </div>

              <Button
                onClick={executeBridge}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Bridging...' : `Bridge to ${getChainName(toChain)}`}
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Yield Optimization Suggestion */}
      {optimalChain && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Yield Optimization
            </CardTitle>
            <CardDescription>
              Maximize your yield by choosing the optimal chain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Best Yield Opportunity</span>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Bridge to <strong>{optimalChain.chainName}</strong> for {optimalChain.estimatedAPY}% APY
                via {optimalChain.protocol}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600">Bridge Cost:</span>
                  <p className="font-medium">${optimalChain.bridgeCost}</p>
                </div>
                <div>
                  <span className="text-green-600">Net APY:</span>
                  <p className="font-medium">{optimalChain.netYield}%</p>
                </div>
              </div>
              {toChain !== optimalChain.chainId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setToChain(optimalChain.chainId)}
                  className="mt-3 w-full"
                >
                  Switch to {optimalChain.chainName}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card Activity Integration */}
      {cardActivity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              MetaMask Card Integration
            </CardTitle>
            <CardDescription>
              Bridge your card rewards for optimal yield
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <span className="text-muted-foreground">Suggested Bridge:</span>
                <p className="font-medium">
                  {getAvailableRewards() > 100 ? 'Recommended' : 'Wait for more rewards'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
