'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LiquidityPool {
  id: string;
  name: string;
  tokens: string[];
  tvl: number;
  apy: number;
  userLiquidity: number;
  volume24h: number;
  chain: string;
}

export default function LiquidityPage() {
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChain, setSelectedChain] = useState('all');

  useEffect(() => {
    // Mock data for liquidity pools
    const mockPools: LiquidityPool[] = [
      {
        id: '1',
        name: 'USDC/USDT',
        tokens: ['USDC', 'USDT'],
        tvl: 45000000,
        apy: 8.5,
        userLiquidity: 5000,
        volume24h: 2500000,
        chain: 'Ethereum'
      },
      {
        id: '2',
        name: 'USDC/DAI',
        tokens: ['USDC', 'DAI'],
        tvl: 32000000,
        apy: 7.2,
        userLiquidity: 0,
        volume24h: 1800000,
        chain: 'Polygon'
      },
      {
        id: '3',
        name: 'USDC/FRAX',
        tokens: ['USDC', 'FRAX'],
        tvl: 18000000,
        apy: 9.1,
        userLiquidity: 2500,
        volume24h: 980000,
        chain: 'Arbitrum'
      }
    ];

    setTimeout(() => {
      setPools(mockPools);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPools = selectedChain === 'all' 
    ? pools 
    : pools.filter(pool => pool.chain.toLowerCase() === selectedChain);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
          <h1 className="text-3xl font-bold">Liquidity Pools</h1>
          <p className="text-muted-foreground">
            Provide liquidity to earn fees and optimize USDC yield
          </p>
        </div>
        <Button>
          Add Liquidity
        </Button>
      </div>

      <Tabs value={selectedChain} onValueChange={setSelectedChain}>
        <TabsList>
          <TabsTrigger value="all">All Chains</TabsTrigger>
          <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
          <TabsTrigger value="polygon">Polygon</TabsTrigger>
          <TabsTrigger value="arbitrum">Arbitrum</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedChain} className="space-y-4">
          <div className="grid gap-4">
            {filteredPools.map((pool) => (
              <Card key={pool.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {pool.name}
                  </CardTitle>
                  <Badge variant="secondary">{pool.chain}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">TVL</p>
                      <p className="text-lg font-bold">{formatCurrency(pool.tvl)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">APY</p>
                      <p className="text-lg font-bold text-green-600">{pool.apy}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">24h Volume</p>
                      <p className="text-lg font-bold">{formatCurrency(pool.volume24h)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Your Liquidity</p>
                      <p className="text-lg font-bold">
                        {pool.userLiquidity > 0 ? formatCurrency(pool.userLiquidity) : '-'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {pool.userLiquidity > 0 ? (
                        <>
                          <Button variant="outline" size="sm">
                            Remove
                          </Button>
                          <Button size="sm">
                            Add More
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="w-full">
                          Add Liquidity
                        </Button>
                      )}
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
