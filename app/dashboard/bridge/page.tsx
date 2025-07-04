"use client"

import { Navigation } from "@/components/navigation"
import { BridgeWidget } from '@/components/defi/BridgeWidget'

export default function BridgePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cross-Chain Bridge</h1>
          <p className="text-muted-foreground">
            Bridge tokens across testnets using LiFi protocol with wagmi and MetaMask integration
          </p>
        </div>

        <BridgeWidget />
      </main>
    </div>
  )
}
