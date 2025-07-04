"use client"

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useBridge } from '@/hooks/defi/useBridge'
import { lifiService, TESTNET_CHAINS, SupportedToken } from '@/lib/integrations/lifi/bridge'
import { ArrowUpDown, Clock, Zap, Shield, ExternalLink, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export function BridgeWidget() {
  const { address, isConnected } = useAccount()
  const {
    quotes,
    isLoadingQuotes,
    executionStatus,
    isExecuting,
    error,
    fetchQuotes,
    executeRoute,
    clearError,
    reset
  } = useBridge()

  const [fromChain, setFromChain] = useState<number>(11155111) // Sepolia
  const [toChain, setToChain] = useState<number>(80001) // Mumbai
  const [fromToken, setFromToken] = useState<SupportedToken>('ETH')
  const [toToken, setToToken] = useState<SupportedToken>('USDC')
  const [amount, setAmount] = useState<string>('1')
  const [selectedQuote, setSelectedQuote] = useState<number>(0)

  const supportedChains = lifiService.getSupportedChains()

  // Update supported tokens when chains change
  useEffect(() => {
    const fromTokens = lifiService.getSupportedTokens(fromChain)
    const toTokens = lifiService.getSupportedTokens(toChain)
    
    if (!fromTokens.includes(fromToken)) {
      setFromToken(fromTokens[0])
    }
    if (!toTokens.includes(toToken)) {
      setToToken(toTokens[0])
    }
  }, [fromChain, toChain, fromToken, toToken])

  const handleSwapChains = () => {
    const tempChain = fromChain
    const tempToken = fromToken
    setFromChain(toChain)
    setToChain(tempChain)
    setFromToken(toToken)
    setToToken(tempToken)
    reset()
  }

  const handleGetQuotes = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet')
      return
    }

    await fetchQuotes({
      fromChain,
      toChain,
      fromToken,
      toToken,
      amount
    })
  }

  const handleExecuteBridge = async () => {
    if (quotes.length === 0) return
    await executeRoute(quotes[selectedQuote])
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  const getExplorerLink = (txHash: string, chainId: number) => {
    const chain = supportedChains.find(c => c.id === chainId)
    return chain ? `${chain.blockExplorers[0]}/tx/${txHash}` : '#'
  }

  const getChainName = (chainId: number) => {
    return supportedChains.find(c => c.id === chainId)?.name || `Chain ${chainId}`
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Testnet Bridge
          </CardTitle>
          <CardDescription>
            Please connect your wallet to start bridging
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bridge Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Cross-Chain Bridge
          </CardTitle>
          <CardDescription>
            Bridge tokens across testnets using LiFi protocol
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chain Selection */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Chain</label>
              <Select value={fromChain.toString()} onValueChange={(value) => setFromChain(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapChains}
                className="mb-2"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Chain</label>
              <Select value={toChain.toString()} onValueChange={(value) => setToChain(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Token Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Token</label>
              <Select value={fromToken} onValueChange={(value: SupportedToken) => setFromToken(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lifiService.getSupportedTokens(fromChain).map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Token</label>
              <Select value={toToken} onValueChange={(value: SupportedToken) => setToToken(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lifiService.getSupportedTokens(toChain).map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.000001"
                min="0"
              />
              <Button
                variant="outline"
                onClick={() => setAmount(fromToken === 'USDC' ? '100' : '1')}
              >
                Default
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Bridging {amount} {fromToken} from {getChainName(fromChain)} to {getChainName(toChain)}
            </p>
          </div>

          {/* Get Quotes Button */}
          <Button
            onClick={handleGetQuotes}
            disabled={!amount || isLoadingQuotes || fromChain === toChain}
            className="w-full"
          >
            {isLoadingQuotes ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Finding Routes...
              </>
            ) : (
              'Get Bridge Quotes'
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                ×
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bridge Quotes */}
      {quotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Routes</CardTitle>
            <CardDescription>
              Choose the best route for your bridge transaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quotes.map((quote, index) => {
              const decimals = toToken === 'USDC' ? 6 : 18
              const receivedAmount = lifiService.formatAmount(quote.toAmount, decimals)
              
              return (
                <div
                  key={quote.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedQuote === index
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedQuote(index)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        {receivedAmount} {toToken}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You'll receive
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(quote.duration)}
                      </Badge>
                      <p className="text-xs text-muted-foreground">Via {quote.tool}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Gas: ~{lifiService.formatAmount(quote.estimatedGas)} ETH</span>
                    <span>Route #{index + 1}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Execute Bridge */}
      {quotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Execute Bridge
            </CardTitle>
            <CardDescription>
              Review and confirm your bridge transaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">From</p>
                <p className="font-medium">{getChainName(fromChain)}</p>
                <p className="text-xs">{amount} {fromToken}</p>
              </div>
              <div>
                <p className="text-muted-foreground">To</p>
                <p className="font-medium">{getChainName(toChain)}</p>
                <p className="text-xs">
                  {lifiService.formatAmount(quotes[selectedQuote].toAmount, toToken === 'USDC' ? 6 : 18)} {toToken}
                </p>
              </div>
            </div>

            <Button
              onClick={handleExecuteBridge}
              disabled={isExecuting}
              className="w-full"
            >
              {isExecuting ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Bridging...
                </>
              ) : (
                'Execute Bridge'
              )}
            </Button>

            {/* Execution Status */}
            {executionStatus.status !== 'idle' && (
              <div className={`p-4 rounded-md ${
                executionStatus.status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                executionStatus.status === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {executionStatus.status === 'loading' && <LoadingSpinner className="h-4 w-4" />}
                  <span className="font-medium">
                    {executionStatus.status === 'success' ? 'Success!' :
                     executionStatus.status === 'error' ? 'Error' : 'Processing'}
                  </span>
                </div>
                
                {executionStatus.message && (
                  <p className="text-sm mb-2">{executionStatus.message}</p>
                )}
                
                {executionStatus.error && (
                  <p className="text-sm mb-2">{executionStatus.error}</p>
                )}
                
                {executionStatus.txHash && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Transaction:</span>
                    <a
                      href={getExplorerLink(executionStatus.txHash, fromChain)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline flex items-center gap-1"
                    >
                      {executionStatus.txHash.slice(0, 10)}...{executionStatus.txHash.slice(-8)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bridge Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Example Bridge Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium">ETH (Sepolia) → USDC (Mumbai)</p>
              <p className="text-muted-foreground">Cross-chain with token conversion</p>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium">USDC (Sepolia) → USDC (BNB Testnet)</p>
              <p className="text-muted-foreground">Same token, different chains</p>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium">ETH (Fuji) → ETH (Mumbai)</p>
              <p className="text-muted-foreground">Native token bridging</p>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium">USDC (Mumbai) → ETH (Sepolia)</p>
              <p className="text-muted-foreground">Stablecoin to native token</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
