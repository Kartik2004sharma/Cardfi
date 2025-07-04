"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DollarSign,
  TrendingUp,
  CreditCard,
  Coins,
  ArrowUpRight,
  Gift
} from 'lucide-react'

export interface RewardData {
  id: string
  source: 'Card Spend' | 'Yield' | 'Liquidity'
  amount: number
  token: string
  timestamp: string
  protocol?: string
}

interface RewardsPanelProps {
  rewards: RewardData[]
  totalRewards: number
  monthlyRewards: number
  onClaim?: () => void
}

export function RewardsPanel({ rewards, totalRewards, monthlyRewards, onClaim }: RewardsPanelProps) {
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Card Spend':
        return <CreditCard className="w-4 h-4 text-blue-400" />
      case 'Yield':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'Liquidity':
        return <Coins className="w-4 h-4 text-purple-400" />
      default:
        return <Gift className="w-4 h-4 text-white/60" />
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'Card Spend':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'Yield':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'Liquidity':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      default:
        return 'bg-white/10 text-white/60 border-white/20'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    return 'Just now'
  }

  return (
    <Card className="bg-black/50 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            Rewards Earned
          </CardTitle>
          {onClaim && (
            <Button 
              size="sm" 
              className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30"
              onClick={onClaim}
            >
              Claim All
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-white/60">Total Earned</p>
            <p className="text-2xl font-bold text-green-400">${totalRewards.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-white/60">This Month</p>
            <div className="flex items-center gap-1">
              <p className="text-xl font-bold text-white">${monthlyRewards.toLocaleString()}</p>
              <ArrowUpRight className="w-4 h-4 text-green-400" />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {rewards.length > 0 ? rewards.slice(0, 5).map((reward) => (
          <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                {getSourceIcon(reward.source)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    +{reward.amount.toFixed(2)} {reward.token}
                  </span>
                  <Badge className={`${getSourceColor(reward.source)} border text-xs`}>
                    {reward.source}
                  </Badge>
                </div>
                <p className="text-xs text-white/60">
                  {reward.protocol && `${reward.protocol} • `}{formatTimeAgo(reward.timestamp)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-400">
                ${(reward.amount * (reward.token === 'USDC' ? 1 : 1.05)).toFixed(2)}
              </p>
            </div>
          </div>
        )) : (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-white/30" />
            <p className="text-white/60 text-sm">No rewards yet</p>
            <p className="text-xs text-white/40 mt-1">Start using your MetaMask Card or deposit into yield strategies to earn rewards</p>
          </div>
        )}
        
        {rewards.length > 5 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-white/60 hover:text-white mt-4"
          >
            View All Rewards ({rewards.length})
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
