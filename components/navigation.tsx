"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CustomConnectButton } from '@/components/CustomConnectButton'
import { 
  BarChart3, 
  Droplets, 
  ArrowUpDown, 
  FileText, 
  Gift, 
  Settings,
  Home,
  CreditCard
} from 'lucide-react'
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  ]

  const dashboardItems = [
    { href: "/dashboard/strategies", label: "Strategies", icon: BarChart3 },
    { href: "/dashboard/liquidity", label: "Liquidity", icon: Droplets },
    { href: "/dashboard/swap", label: "Swap", icon: ArrowUpDown },
    { href: "/dashboard/contracts", label: "Contracts", icon: FileText },
    { href: "/dashboard/rewards", label: "Rewards", icon: Gift },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const isDashboard = pathname?.startsWith('/dashboard')

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">CardFi</span>
          </Link>

          <div className="flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href === '/dashboard' && pathname?.startsWith('/dashboard'))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            <CustomConnectButton />
          </div>
        </div>

        {/* Dashboard Sub-navigation */}
        {isDashboard && (
          <div className="border-t">
            <div className="flex items-center space-x-6 py-3">
              {dashboardItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}