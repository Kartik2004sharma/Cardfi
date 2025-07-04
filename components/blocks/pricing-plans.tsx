"use client"

import { Check, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const plans = [
  {
    name: "Free",
    price: "0",
    subtitle: "For beginners",
    description: "Get started with basic USDC management",
    features: [
      "Connect MetaMask Wallet",
      "Monitor USDC balances",
      "Manual rebalancing",
      "Basic APY insights"
    ],
    cta: "Get Started Free",
    popular: false,
    icon: Star,
    gradient: "from-gray-500/20 to-gray-600/20",
    border: "border-gray-600/30",
    ctaStyle: "bg-white/10 hover:bg-white/20 text-white border border-white/30"
  },
  {
    name: "Pro",
    price: "39",
    subtitle: "For yield enthusiasts",
    description: "Automated strategies with card integration",
    features: [
      "Auto strategy rebalancing",
      "Card-linked automation logic",
      "Circle Wallet & LI.FI integration",
      "Rewards tracking dashboard"
    ],
    cta: "Start Pro Trial",
    popular: true,
    icon: Zap,
    gradient: "from-purple-500/20 to-blue-500/20",
    border: "border-purple-500/30",
    ctaStyle: "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
  },
  {
    name: "Enterprise",
    price: "99",
    subtitle: "For treasury teams",
    description: "Advanced features for institutional use",
    features: [
      "Custom strategy support",
      "API access for DeFi analytics",
      "Smart contract templates",
      "Dedicated technical onboarding"
    ],
    cta: "Contact Sales",
    popular: false,
    icon: Check,
    gradient: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
    ctaStyle: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
  }
]

export function PricingPlans() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan to automate your DeFi yield strategy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative bg-gradient-to-br ${plan.gradient} backdrop-blur-sm border ${plan.border} ${plan.popular ? 'ring-2 ring-purple-500/50 scale-105' : ''} transition-all duration-300 hover:scale-105`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br ${plan.gradient} border ${plan.border} flex items-center justify-center`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </CardTitle>
                
                <div className="mb-2">
                  <span className="text-4xl font-bold text-white">
                    ${plan.price}
                  </span>
                  {plan.price !== "0" && (
                    <span className="text-gray-400 text-lg">/month</span>
                  )}
                </div>
                
                <p className="text-purple-400 font-medium mb-2">{plan.subtitle}</p>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.ctaStyle} font-semibold py-3`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm mb-4">
            All plans include 24/7 support and 30-day money-back guarantee
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>✓ No setup fees</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Secure payments</span>
          </div>
        </div>
      </div>
    </section>
  )
}
