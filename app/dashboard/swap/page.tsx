'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowDownUp, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SwapQuote {
  fromAmount: string;
  toAmount: string;
  fromToken: string;
  toToken: string;
  fromChain: string;
  toChain: string;
  gasCost: number;
  bridgeFee: number;
  exchangeRate: number;
  estimatedTime: string;
}

const TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism'] },
  { symbol: 'USDT', name: 'Tether USD', chains: ['Ethereum', 'Polygon', 'Arbitrum'] },
  { symbol: 'DAI', name: 'Dai Stablecoin', chains: ['Ethereum', 'Polygon', 'Arbitrum'] },
  { symbol: 'FRAX', name: 'Frax', chains: ['Ethereum', 'Polygon', 'Arbitrum'] }
];

const CHAINS = ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base'];

export default function SwapPage() {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('USDT');
  const [fromChain, setFromChain] = useState('Ethereum');
  const [toChain, setToChain] = useState('Polygon');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const getQuote = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;
    
    setLoading(true);
    try {
      // Mock quote calculation
      setTimeout(() => {
        const exchangeRate = fromToken === toToken ? 1 : 0.998;
        const calculatedToAmount = (parseFloat(fromAmount) * exchangeRate).toFixed(6);
        
        const mockQuote: SwapQuote = {
          fromAmount,
          toAmount: calculatedToAmount,
          fromToken,
          toToken,
          fromChain,
          toChain,
          gasCost: fromChain === toChain ? 5 : 25,
          bridgeFee: fromChain === toChain ? 0 : 10,
          exchangeRate,
          estimatedTime: fromChain === toChain ? '30 seconds' : '5-10 minutes'
        };
        
        setQuote(mockQuote);
        setToAmount(calculatedToAmount);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting quote:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fromAmount) {
      const debounceTimer = setTimeout(getQuote, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [fromAmount, fromToken, toToken, fromChain, toChain]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromChain(toChain);
    setToChain(fromChain);
    setFromAmount(toAmount);
    setToAmount('');
  };

  const handleSwap = async () => {
    if (!quote) return;
    
    setIsSwapping(true);
    try {
      // Mock swap execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Show success message
      alert('Swap completed successfully!');
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed. Please try again.');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Cross-Chain Swap</h1>
        <p className="text-muted-foreground">
          Swap tokens across different chains with optimal routing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Swap Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Section */}
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                />
              </div>
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.map(token => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={fromChain} onValueChange={setFromChain}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHAINS.filter(chain => 
                  TOKENS.find(t => t.symbol === fromToken)?.chains.includes(chain)
                ).map(chain => (
                  <SelectItem key={chain} value={chain}>
                    {chain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapTokens}
              className="rounded-full"
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          {/* To Section */}
          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.map(token => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={toChain} onValueChange={setToChain}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHAINS.filter(chain => 
                  TOKENS.find(t => t.symbol === toToken)?.chains.includes(chain)
                ).map(chain => (
                  <SelectItem key={chain} value={chain}>
                    {chain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quote Details */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner />
              <span className="ml-2">Getting best quote...</span>
            </div>
          )}

          {quote && !loading && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Exchange Rate</span>
                <span className="text-sm">1 {fromToken} = {quote.exchangeRate} {toToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Gas Cost</span>
                <span className="text-sm">${quote.gasCost}</span>
              </div>
              {quote.bridgeFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bridge Fee</span>
                  <span className="text-sm">${quote.bridgeFee}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estimated Time</span>
                <span className="text-sm">{quote.estimatedTime}</span>
              </div>
              {fromChain !== toChain && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Route</span>
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className="text-xs">{fromChain}</Badge>
                    <span className="text-xs">→</span>
                    <Badge variant="outline" className="text-xs">{toChain}</Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Swap Button */}
          <Button 
            className="w-full" 
            onClick={handleSwap}
            disabled={!quote || isSwapping || !fromAmount}
          >
            {isSwapping ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : (
              'Swap'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
