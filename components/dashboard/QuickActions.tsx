"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus,
  Repeat2,
  CreditCard,
  Activity,
  BarChart3,
  Settings,
  ArrowUpDown,
  Zap
} from 'lucide-react'
import Link from "next/link"

export interface QuickAction {
  title: string
  description: string
  icon: any
  href: string
  accent: 'purple' | 'green' | 'blue' | 'orange'
  disabled?: boolean
}

interface QuickActionsProps {
  onAction?: (actionId: string) => void
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      title: "Add Strategy",
      description: "Deposit into yield protocols",
      icon: Plus,
      href: "/dashboard/strategies",
      accent: "purple"
    },
    {
      title: "Bridge USDC",
      description: "Cross-chain USDC transfers",
      icon: Repeat2,
      href: "/dashboard/bridge",
      accent: "green"
    },
    {
      title: "Trigger Rebalance",
      description: "Optimize your positions",
      icon: ArrowUpDown,
      href: "#",
      accent: "blue"
    },
    {
      title: "Card Activity",
      description: "View MetaMask Card spending",
      icon: CreditCard,
      href: "/dashboard/wallet",
      accent: "orange"
    }
  ]

  const getAccentClasses = (accent: string) => {
    const classes = {
      purple: "border-purple-500/30 group-hover:border-purple-500/50 group-hover:bg-purple-500/5",
      green: "border-green-500/30 group-hover:border-green-500/50 group-hover:bg-green-500/5",
      blue: "border-blue-500/30 group-hover:border-blue-500/50 group-hover:bg-blue-500/5",
      orange: "border-orange-500/30 group-hover:border-orange-500/50 group-hover:bg-orange-500/5"
    }
    return classes[accent as keyof typeof classes] || classes.blue
  }

  const getIconAccentClasses = (accent: string) => {
    const classes = {
      purple: "text-purple-400 group-hover:text-purple-300",
      green: "text-green-400 group-hover:text-green-300",
      blue: "text-blue-400 group-hover:text-blue-300",
      orange: "text-orange-400 group-hover:text-orange-300"
    }
    return classes[accent as keyof typeof classes] || classes.blue
  }

  const handleAction = (action: QuickAction, e: React.MouseEvent) => {
    if (action.href === "#") {
      e.preventDefault()
      if (onAction) {
        onAction(action.title.toLowerCase().replace(/\s+/g, '-'))
      }
    }
  }

  return (
    <Card className="bg-black/50 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          Quick Actions
        </CardTitle>
      </CardHeader>      <CardContent className="space-y-3">
        {quickActions.map((action) => {
          if (action.href === "#") {
            return (
              <div key={action.title}>
                <div 
                  className={`group p-3 rounded-lg border border-white/20 hover:border-white/40 ${getAccentClasses(action.accent)} transition-all duration-300 cursor-pointer ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => handleAction(action, e)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${action.accent}-500/20 to-${action.accent}-600/20 flex items-center justify-center`}>
                      <action.icon className={`w-5 h-5 ${getIconAccentClasses(action.accent)}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{action.title}</h4>
                      <p className="text-xs text-white/60">{action.description}</p>
                    </div>
                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white/60" />
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          
          return (
            <Link key={action.title} href={action.href}>
              <div 
                className={`group p-3 rounded-lg border border-white/20 hover:border-white/40 ${getAccentClasses(action.accent)} transition-all duration-300 cursor-pointer ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${action.accent}-500/20 to-${action.accent}-600/20 flex items-center justify-center`}>
                    <action.icon className={`w-5 h-5 ${getIconAccentClasses(action.accent)}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">{action.title}</h4>
                    <p className="text-xs text-white/60">{action.description}</p>
                  </div>
                  <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                    <Activity className="w-3 h-3 text-white/60" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}

        <div className="pt-2 border-t border-white/10">
          <Link href="/dashboard/settings">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-white/60 hover:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Strategy Settings
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
