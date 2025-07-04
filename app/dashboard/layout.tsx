"use client"

import { Navigation } from "@/components/navigation"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  )
}
