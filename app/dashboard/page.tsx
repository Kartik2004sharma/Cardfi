"use client"

import { LiveVaultDashboard } from "@/components/LiveVaultDashboard"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CardFi Yield Manager</h1>
          <p className="text-muted-foreground">
            Manage your DeFi yield strategies and MetaMask Card rewards
          </p>
        </div>
        
        <LiveVaultDashboard />
      </main>
    </div>
  )
}