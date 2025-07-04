"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, TrendingUp, Zap, DollarSign, BarChart3, ExternalLink } from 'lucide-react'

interface Strategy {
  id: string
  name: string
  protocol: string
  apy: number
  tvl: string
  risk: 'Low' | 'Medium' | 'High'
  chain: string
  description: string
}

const mockStrategies: Strategy[] = [
  {
    id: '1',
    name: 'USDC Lending',
    protocol: 'Aave',
    apy: 8.5,
    tvl: '$2.1B',
    risk: 'Low',
    chain: 'Ethereum',
    description: 'Earn yield by lending USDC on Aave protocol'
  },
  {
    id: '2',
    name: 'USDC Yield Farm',
    protocol: 'Compound',
    apy: 12.3,
    tvl: '$890M',
    risk: 'Medium',
    chain: 'Polygon',
    description: 'Compound USDC lending with additional COMP rewards'
  },
  {
    id: '3',
    name: 'Liquidity Pool',
    protocol: 'Uniswap V3',
    apy: 15.8,
    tvl: '$450M',
    risk: 'High',
    chain: 'Arbitrum',
    description: 'Provide liquidity to USDC/ETH pool'
  }
]

export default function StrategiesPage() {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yield Strategies</h1>
          <p className="text-gray-600 mt-2">
            Discover and deploy yield-generating strategies for your USDC
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <TrendingUp className="w-3 h-3 mr-1" />
            Active Strategies: {mockStrategies.length}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Strategies</TabsTrigger>
          <TabsTrigger value="low-risk">Low Risk</TabsTrigger>
          <TabsTrigger value="medium-risk">Medium Risk</TabsTrigger>
          <TabsTrigger value="high-risk">High Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockStrategies.map((strategy) => (
              <Card key={strategy.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <Badge className={getRiskColor(strategy.risk)}>
                      {strategy.risk}
                    </Badge>
                  </div>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">APY</span>
                      <span className="font-semibold text-green-600">
                        {strategy.apy}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">TVL</span>
                      <span className="font-medium">{strategy.tvl}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Protocol</span>
                      <span className="font-medium">{strategy.protocol}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Chain</span>
                      <Badge variant="outline">{strategy.chain}</Badge>
                    </div>
                    <Button className="w-full" onClick={() => setSelectedStrategy(strategy)}>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Deploy Strategy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="low-risk">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockStrategies.filter(s => s.risk === 'Low').map((strategy) => (
              <Card key={strategy.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <Badge className={getRiskColor(strategy.risk)}>
                      {strategy.risk}
                    </Badge>
                  </div>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">APY</span>
                      <span className="font-semibold text-green-600">
                        {strategy.apy}%
                      </span>
                    </div>
                    <Button className="w-full" onClick={() => setSelectedStrategy(strategy)}>
                      <Shield className="w-4 h-4 mr-2" />
                      Deploy Safe Strategy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="medium-risk">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockStrategies.filter(s => s.risk === 'Medium').map((strategy) => (
              <Card key={strategy.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <Badge className={getRiskColor(strategy.risk)}>
                      {strategy.risk}
                    </Badge>
                  </div>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">APY</span>
                      <span className="font-semibold text-green-600">
                        {strategy.apy}%
                      </span>
                    </div>
                    <Button className="w-full" onClick={() => setSelectedStrategy(strategy)}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Deploy Strategy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="high-risk">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockStrategies.filter(s => s.risk === 'High').map((strategy) => (
              <Card key={strategy.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <Badge className={getRiskColor(strategy.risk)}>
                      {strategy.risk}
                    </Badge>
                  </div>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">APY</span>
                      <span className="font-semibold text-green-600">
                        {strategy.apy}%
                      </span>
                    </div>
                    <Button className="w-full" onClick={() => setSelectedStrategy(strategy)}>
                      <Zap className="w-4 h-4 mr-2" />
                      Deploy High-Yield Strategy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedStrategy && (
        <Card className="mt-8 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Deploy {selectedStrategy.name}
            </CardTitle>
            <CardDescription>
              Configure your investment in {selectedStrategy.protocol} on {selectedStrategy.chain}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Strategy Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>APY: <span className="font-semibold text-green-600">{selectedStrategy.apy}%</span></div>
                  <div>Risk: <span className={`px-2 py-1 rounded text-xs ${getRiskColor(selectedStrategy.risk)}`}>{selectedStrategy.risk}</span></div>
                  <div>Protocol: <span className="font-medium">{selectedStrategy.protocol}</span></div>
                  <div>Chain: <span className="font-medium">{selectedStrategy.chain}</span></div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Deploy Strategy
                </Button>
                <Button variant="outline" onClick={() => setSelectedStrategy(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
