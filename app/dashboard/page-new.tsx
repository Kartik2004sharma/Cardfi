"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  ArrowLeftRight, 
  Droplets, 
  ArrowUpDown, 
  TrendingUp,
  Activity,
  ExternalLink,
  Copy,
  DollarSign,
  Plus,
  BarChart2,
  Coins,
  Users,
  Clock,
  FileText,
  Eye,
  ChevronRight
} from 'lucide-react'
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PriceData {
  timestamp: number
  price: number
  date: string
}

export default function DashboardHomePage() {
  const [ethPrice, setEthPrice] = useState<number | null>(null)
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    totalStrategies: 0,
    totalValue: "0.00",
    totalRewards: "0.00",
    totalTransactions: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Mock data for DeFi dashboard
      setEthPrice(3200.45)
      setPriceHistory([
        { timestamp: Date.now() - 24 * 60 * 60 * 1000, price: 3150, date: '24h ago' },
        { timestamp: Date.now() - 12 * 60 * 60 * 1000, price: 3180, date: '12h ago' },
        { timestamp: Date.now() - 6 * 60 * 60 * 1000, price: 3220, date: '6h ago' },
        { timestamp: Date.now(), price: 3200, date: 'Now' }
      ])
      setStats({
        totalStrategies: 3,
        totalValue: "12,450.32",
        totalRewards: "245.67",
        totalTransactions: 15
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const quickActions = [
    {
      title: "Create Strategy",
      description: "Set up new yield strategy",
      icon: Plus,
      href: "/dashboard/strategies",
      accent: "purple"
    },
    {
      title: "Add Liquidity",
      description: "Provide liquidity to pools",
      icon: Droplets,
      href: "/dashboard/liquidity",
      accent: "green"
    },
    {
      title: "Swap Tokens",
      description: "Exchange digital assets",
      icon: ArrowUpDown,
      href: "/dashboard/swap",
      accent: "blue"
    },
    {
      title: "View Activity",
      description: "Check transaction history",
      icon: ArrowLeftRight,
      href: "/dashboard/transactions",
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CardFi Dashboard</h1>
          <p className="text-muted-foreground">Manage your DeFi portfolio</p>
        </div>
        <Button onClick={refreshData} disabled={refreshing} variant="outline">
          <Activity className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStrategies}</div>
            <p className="text-xs text-muted-foreground">Earning yield</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue}</div>
            <p className="text-xs text-muted-foreground">Portfolio value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Coins className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRewards}</div>
            <p className="text-xs text-muted-foreground">Rewards earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Total txns</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ETH Price Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>ETH Price</span>
              {ethPrice && (
                <Badge variant="secondary">
                  ${ethPrice.toLocaleString()}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className={`group flex flex-col items-center p-4 rounded-lg border transition-all hover:shadow-md ${getAccentClasses(action.accent)}`}
                  >
                    <Icon className="w-8 h-8 mb-2 text-muted-foreground group-hover:text-foreground" />
                    <h3 className="font-medium text-sm text-center">{action.title}</h3>
                    <p className="text-xs text-muted-foreground text-center mt-1">{action.description}</p>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
