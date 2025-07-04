"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, Shield, AlertTriangle, Zap, DollarSign, Activity, BarChart2, Hash, Copy } from 'lucide-react'
import Link from "next/link"
import { mockStrategies, type YieldStrategy } from "@/lib/strategy"

interface StrategyPosition {
  id: string
  amount: number
  shares: number
  entryDate: string
  currentValue: number
  unrealizedPnL: number
}

interface StrategyTransaction {
  id: string
  type: 'deposit' | 'withdraw' | 'harvest'
  amount: number
  timestamp: string
  txHash: string
}

export default function StrategyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [strategy, setStrategy] = useState<YieldStrategy | null>(null)
  const [position, setPosition] = useState<StrategyPosition | null>(null)
  const [transactions, setTransactions] = useState<StrategyTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadStrategyDetails(params.id as string)
    }
  }, [params.id])

  const loadStrategyDetails = async (strategyId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Find strategy by ID
      const strategies = mockStrategies()
      const foundStrategy = strategies.find(s => s.id === strategyId)
      
      if (!foundStrategy) {
        setError("Strategy not found")
        return
      }
      
      setStrategy(foundStrategy)

      // Mock position data
      setPosition({
        id: `pos-${strategyId}`,
        amount: 15000,
        shares: 14850,
        entryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        currentValue: 15645.50,
        unrealizedPnL: 645.50
      })

      // Mock transaction history
      setTransactions([
        {
          id: "tx-1",
          type: "deposit",
          amount: 10000,
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          txHash: "0x1234567890abcdef1234567890abcdef12345678"
        },
        {
          id: "tx-2",
          type: "deposit",
          amount: 5000,
          timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          txHash: "0xabcdef1234567890abcdef1234567890abcdef12"
        },
        {
          id: "tx-3",
          type: "harvest",
          amount: 125.30,
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          txHash: "0x567890abcdef1234567890abcdef1234567890ab"
        }
      ])

    } catch (error) {
      console.error("Failed to load strategy details:", error)
      setError("Failed to load strategy details")
    } finally {
      setLoading(false)
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return <Shield className="w-4 h-4 text-green-400" />
      case 'MEDIUM':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'HIGH':
        return <Zap className="w-4 h-4 text-red-400" />
      default:
        return <Shield className="w-4 h-4 text-green-400" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'HIGH':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-green-500/10 text-green-400 border-green-500/20'
    }
  }

  const formatTVL = (tvl: number) => {
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(1)}M`
    if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(1)}K`
    return `$${tvl.toFixed(0)}`
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-white/10 rounded w-1/2 mb-6"></div>
          <div className="h-32 bg-white/10 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Error Loading Strategy</h2>
          <p className="text-red-400">{error}</p>
          <Link href="/dashboard">
            <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!strategy) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Strategy Not Found</h2>
          <Link href="/dashboard">
            <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-gray-400 hover:text-white mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mb-4">
              {strategy.name} Strategy
            </h1>

            <div className="flex flex-wrap gap-3 mb-6">
              <Badge className={`${getRiskColor(strategy.riskLevel)} border`}>
                <span className="flex items-center gap-1">
                  {getRiskIcon(strategy.riskLevel)}
                  {strategy.riskLevel} Risk
                </span>
              </Badge>
              <Badge className="bg-gray-800 text-gray-300 border-gray-700">
                <Hash className="w-4 h-4 mr-2" />
                {strategy.protocol}
              </Badge>
              <Badge className="bg-gray-800 text-gray-300 border-gray-700">
                Chain ID: {strategy.chainId}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{strategy.currentAPY.toFixed(2)}%</div>
                <div className="text-sm text-gray-400">Current APY</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{formatTVL(strategy.tvl)}</div>
                <div className="text-sm text-gray-400">Total TVL</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">${strategy.minDeposit.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Min Deposit</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">${strategy.maxDeposit.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Max Deposit</div>
              </div>
            </div>
          </div>

          <div className="lg:w-80">
            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-8 border border-white/10">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/40 to-blue-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{strategy.protocol.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{strategy.protocol}</h3>
                <p className="text-white/60 text-sm mb-4">DeFi Yield Strategy</p>
                
                {position && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Your Position:</span>
                      <span className="text-white font-medium">${position.currentValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">P&L:</span>
                      <span className={`font-medium ${position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {position.unrealizedPnL >= 0 ? '+' : ''}${position.unrealizedPnL.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="details" className="data-[state=active]:bg-gray-800 text-gray-400 data-[state=active]:text-white">
              <BarChart2 className="w-4 h-4 mr-2" />
              Strategy Details
            </TabsTrigger>
            <TabsTrigger value="position" className="data-[state=active]:bg-gray-800 text-gray-400 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Your Position
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-gray-800 text-gray-400 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Transactions ({transactions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Strategy Information</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30"
                  >
                    Deposit
                  </Button>
                  {position && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Strategy ID</label>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-mono text-sm bg-gray-800 p-2 rounded border border-gray-700 flex-1 break-all">
                          {strategy.id}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigator.clipboard.writeText(strategy.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Token Contract</label>
                      <p className="text-white font-mono text-sm bg-gray-800 p-2 rounded border border-gray-700 break-all">
                        {strategy.tokenAddress}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Protocol</label>
                      <p className="text-white font-mono text-sm bg-gray-800 p-2 rounded border border-gray-700">
                        {strategy.protocol}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-white/60">Chain ID</label>
                      <p className="text-white text-sm bg-black/30 p-2 rounded border border-white/20">
                        {strategy.chainId}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/60">Risk Level</label>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getRiskColor(strategy.riskLevel)} border`}>
                          <span className="flex items-center gap-1">
                            {getRiskIcon(strategy.riskLevel)}
                            {strategy.riskLevel}
                          </span>
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/60">Status</label>
                      <Badge className={`${strategy.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} border`}>
                        {strategy.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="position">
            <Card className="bg-black/50 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Position Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {position ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">${position.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Initial Deposit</div>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">${position.currentValue.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Current Value</div>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <div className={`text-2xl font-bold ${position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {position.unrealizedPnL >= 0 ? '+' : ''}${position.unrealizedPnL.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">Unrealized P&L</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-white/60">Shares Owned</label>
                        <p className="text-white text-lg font-medium">{position.shares.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white/60">Entry Date</label>
                        <p className="text-white text-lg font-medium">
                          {new Date(position.entryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white/80 mb-2">No Position</h3>
                    <p className="text-white/60">You haven't deposited into this strategy yet.</p>
                    <Button className="mt-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30">
                      Make First Deposit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <Card key={tx.id} className="bg-black/50 border-white/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            tx.type === 'deposit' ? 'bg-green-500/20' :
                            tx.type === 'withdraw' ? 'bg-red-500/20' : 'bg-blue-500/20'
                          }`}>
                            {tx.type === 'deposit' ? <TrendingUp className="w-5 h-5 text-green-400" /> :
                             tx.type === 'withdraw' ? <TrendingUp className="w-5 h-5 text-red-400 rotate-180" /> :
                             <DollarSign className="w-5 h-5 text-blue-400" />}
                          </div>
                          <div>
                            <p className="text-white font-medium capitalize">{tx.type}</p>
                            <p className="text-white/60 text-sm">
                              {new Date(tx.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">${tx.amount.toLocaleString()}</p>
                          <p className="text-white/60 text-sm font-mono">{tx.txHash.slice(0, 10)}...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-black/50 border-white/20 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <Activity className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white/80 mb-2">No Transactions</h3>
                    <p className="text-white/60">No transaction history for this strategy.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
