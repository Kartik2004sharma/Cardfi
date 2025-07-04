"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle, 
  Zap,
  ExternalLink
} from 'lucide-react'

export interface YieldStrategy {
  id: string
  name: string
  protocol: string
  apy: number
  tvl: number
  chain: string
  risk: 'Low' | 'Medium' | 'High'
  icon: string
  deposited?: number
  change24h?: number
}

interface StrategyCardProps {
  strategy: YieldStrategy
  onDeposit?: (strategyId: string) => void
  onWithdraw?: (strategyId: string) => void
}

export function StrategyCard({ strategy, onDeposit, onWithdraw }: StrategyCardProps) {
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low':
        return <Shield className="w-4 h-4 text-green-400" />
      case 'Medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'High':
        return <Zap className="w-4 h-4 text-red-400" />
      default:
        return <Shield className="w-4 h-4 text-green-400" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'High':
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

  return (
    <Card className="bg-black/50 border-white/20 backdrop-blur-sm hover:border-white/40 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">{strategy.protocol.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">{strategy.name}</h3>
              <p className="text-sm text-white/60">{strategy.protocol} • {strategy.chain}</p>
            </div>
          </div>
          <Badge className={`${getRiskColor(strategy.risk)} border`}>
            <span className="flex items-center gap-1">
              {getRiskIcon(strategy.risk)}
              {strategy.risk}
            </span>
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">Current APY</span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-green-400">{strategy.apy.toFixed(2)}%</span>
              {strategy.change24h && (
                <span className={`text-xs flex items-center gap-1 ${strategy.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {strategy.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(strategy.change24h).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">TVL</span>
            <span className="text-sm font-medium text-white">{formatTVL(strategy.tvl)}</span>
          </div>

          {strategy.deposited && strategy.deposited > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Your Deposit</span>
              <span className="text-sm font-medium text-purple-400">${strategy.deposited.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {onDeposit && (
            <Button 
              size="sm" 
              className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30"
              onClick={() => onDeposit(strategy.id)}
            >
              Deposit
            </Button>
          )}
          {onWithdraw && strategy.deposited && strategy.deposited > 0 && (
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 text-white/60 border-white/30 hover:border-white/50"
              onClick={() => onWithdraw(strategy.id)}
            >
              Withdraw
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost"
            className="text-white/60 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
