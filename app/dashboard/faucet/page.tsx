"use client"

import { TestnetUSDCDashboard } from "@/components/TestnetUSDCDashboard"

export default function FaucetPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Testnet USDC Faucet</h1>
          <p className="text-muted-foreground">
            Get testnet USDC to test the CardFi platform functionality
          </p>
        </div>
        
        <TestnetUSDCDashboard />
      </main>
    </div>
  )
}
