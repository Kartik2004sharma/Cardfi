'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';

interface Strategy {
  id: string;
  name: string;
  protocol: string;
  chainId: number;
  currentAPY: number;
  tvl: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  minDeposit: number;
  maxDeposit: number;
  isActive: boolean;
  contractAddress: string;
  description: string;
}

export default function StrategiesPage() {
  const { address, isConnected } = useAccount();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStrategies();
  }, [selectedChain]);

  const fetchStrategies = async () => {
    try {
      const url = selectedChain 
        ? `/api/yield?chainId=${selectedChain}`
        : '/api/yield';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setStrategies(data.data);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChainName = (chainId: number) => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      8453: 'Base',
      11155111: 'Sepolia',
      80002: 'Polygon Amoy',
      84532: 'Base Sepolia'
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  const handleDeposit = async () => {
    if (!selectedStrategy || !depositAmount || !address) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount < selectedStrategy.minDeposit || amount > selectedStrategy.maxDeposit) {
      toast.error(`Amount must be between $${selectedStrategy.minDeposit} and $${selectedStrategy.maxDeposit}`);
      return;
    }

    setIsDepositing(true);
    try {
      const response = await fetch('/api/yield', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strategyId: selectedStrategy.id,
          amount: amount,
          userAddress: address,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Deposit of $${amount} initiated successfully!`);
        setIsModalOpen(false);
        setDepositAmount('');
        setSelectedStrategy(null);
        // Refresh strategies
        fetchStrategies();
      } else {
        toast.error(data.error || 'Failed to initiate deposit');
      }
    } catch (error) {
      console.error('Error initiating deposit:', error);
      toast.error('Failed to initiate deposit');
    } finally {
      setIsDepositing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Yield Strategies</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Yield Strategies</h1>
        <div className="flex gap-2">
          <Button
            variant={selectedChain === null ? "default" : "outline"}
            onClick={() => setSelectedChain(null)}
          >
            All Chains
          </Button>
          {[11155111, 80002, 84532, 1, 137, 42161, 10, 8453].map((chainId) => (
            <Button
              key={chainId}
              variant={selectedChain === chainId ? "default" : "outline"}
              onClick={() => setSelectedChain(chainId)}
            >
              {getChainName(chainId)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{strategy.name}</CardTitle>
                  <CardDescription>{strategy.protocol} • {getChainName(strategy.chainId)}</CardDescription>
                </div>
                <Badge className={getRiskColor(strategy.riskLevel)}>
                  {strategy.riskLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current APY</span>
                <span className="text-2xl font-bold text-green-600">
                  {strategy.currentAPY.toFixed(2)}%
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>TVL</span>
                  <span>${(strategy.tvl / 1000000).toFixed(1)}M</span>
                </div>
                <Progress value={Math.min((strategy.tvl / 5000000000) * 100, 100)} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Min Deposit</span>
                  <p className="font-medium">${strategy.minDeposit}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Deposit</span>
                  <p className="font-medium">${strategy.maxDeposit.toLocaleString()}</p>
                </div>
              </div>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    disabled={!strategy.isActive || !isConnected}
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    {!isConnected ? 'Connect Wallet' : strategy.isActive ? 'Deposit' : 'Unavailable'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Deposit to {selectedStrategy?.name}</DialogTitle>
                    <DialogDescription>
                      {selectedStrategy?.description}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (USDC)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        min={selectedStrategy?.minDeposit}
                        max={selectedStrategy?.maxDeposit}
                        step="0.01"
                      />
                      <p className="text-xs text-muted-foreground">
                        Min: ${selectedStrategy?.minDeposit} • Max: ${selectedStrategy?.maxDeposit?.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Expected APY:</span>
                        <span className="font-medium text-green-600">{selectedStrategy?.currentAPY.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Risk Level:</span>
                        <Badge className={getRiskColor(selectedStrategy?.riskLevel || 'LOW')}>
                          {selectedStrategy?.riskLevel}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Chain:</span>
                        <span>{selectedStrategy ? getChainName(selectedStrategy.chainId) : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setIsModalOpen(false);
                        setDepositAmount('');
                        setSelectedStrategy(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={handleDeposit}
                      disabled={isDepositing || !depositAmount}
                    >
                      {isDepositing ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Depositing...
                        </>
                      ) : (
                        'Confirm Deposit'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {strategies.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">
            No strategies available
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Try selecting a different chain or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
