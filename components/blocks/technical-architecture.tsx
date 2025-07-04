"use client"

import { 
  Globe2, 
  Cpu, 
  CreditCard, 
  Shield, 
  Network, 
  TrendingUp,
  Layers,
  Lock,
  Zap,
  Database,
  ArrowUpDown,
  CheckCircle2
} from 'lucide-react'

const architectureLayers = [
  {
    layer: "Presentation Layer",
    components: [
      {
        icon: Globe2,
        title: "Next.js Frontend",
        description: "Server-side rendering with optimized performance",
        tech: "React 18, TypeScript, Tailwind CSS"
      },
      {
        icon: CreditCard,
        title: "MetaMask Card UI",
        description: "Seamless card management and spending controls",
        tech: "MetaMask SDK, Web3 Integration"
      }
    ]
  },
  {
    layer: "Application Layer",
    components: [
      {
        icon: Cpu,
        title: "Smart Agents",
        description: "Autonomous yield optimization and rebalancing",
        tech: "Solidity, OpenZeppelin, Chainlink"
      },
      {
        icon: Network,
        title: "Cross-Chain Bridge",
        description: "Multi-chain USDC routing and liquidity optimization",
        tech: "LI.FI Protocol, Wormhole, LayerZero"
      }
    ]
  },
  {
    layer: "Infrastructure Layer",
    components: [
      {
        icon: Shield,
        title: "Circle Custody",
        description: "Enterprise-grade asset custody and compliance",
        tech: "Circle APIs, MPC Wallets, KYC/AML"
      },
      {
        icon: Database,
        title: "Data Analytics",
        description: "Real-time APY tracking and risk assessment",
        tech: "DeFiLlama, CoinGecko, Custom APIs"
      }
    ]
  }
]

export function TechnicalArchitecture() {
  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900/50 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Enterprise-Grade Architecture
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Built with security, scalability, and performance at its core. Our multi-layered architecture 
            ensures institutional-grade reliability for your DeFi automation.
          </p>
        </div>

        {/* Architecture Layers */}
        <div className="space-y-12">
          {architectureLayers.map((layer, layerIndex) => (
            <div key={layerIndex} className="relative">
              {/* Layer Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white font-bold text-sm">
                  {layerIndex + 1}
                </div>
                <h3 className="text-2xl font-bold text-white">{layer.layer}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></div>
              </div>

              {/* Components Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {layer.components.map((component, componentIndex) => (
                  <div 
                    key={componentIndex}
                    className="group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                        <component.icon className="w-6 h-6 text-purple-400" />
                      </div>

                      {/* Content */}
                      <h4 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                        {component.title}
                      </h4>
                      <p className="text-gray-400 mb-4 leading-relaxed">
                        {component.description}
                      </p>
                      
                      {/* Tech Stack */}
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-500 font-mono">
                          {component.tech}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Connection Line to Next Layer */}
              {layerIndex < architectureLayers.length - 1 && (
                <div className="flex justify-center mt-8">
                  <div className="w-px h-8 bg-gradient-to-b from-purple-500 to-blue-500"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Architecture Flow Diagram */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Data Flow Architecture</h3>
            <p className="text-gray-400">How CardFi processes and optimizes your DeFi transactions</p>
          </div>

          <div className="relative">
            {/* Flow Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: CreditCard, title: "Card Transaction", desc: "MetaMask Card activity triggers automation" },
                { icon: Cpu, title: "Smart Analysis", desc: "AI agents analyze optimal yield strategies" },
                { icon: Network, title: "Cross-Chain Routing", desc: "LI.FI finds best liquidity pools" },
                { icon: TrendingUp, title: "Yield Optimization", desc: "Funds deployed to highest APY protocols" }
              ].map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mx-auto w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-8 h-8 text-purple-400" />
                    {index < 3 && (
                      <div className="hidden md:block absolute left-full top-1/2 w-8 h-px bg-gradient-to-r from-purple-500 to-blue-500 transform -translate-y-1/2"></div>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Compliance Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-8 py-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">SOC 2 Compliant</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-semibold">Multi-Sig Security</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-semibold">Audited Smart Contracts</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
