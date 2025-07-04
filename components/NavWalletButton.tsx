"use client"

import { useState } from 'react'
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, User } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function NavWalletButton() {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    chainId, 
    balance, 
    connectWallet, 
    disconnect 
  } = useWallet()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum'
      case 11155111: return 'Sepolia'
      case 137: return 'Polygon'
      case 42161: return 'Arbitrum'
      case 10: return 'Optimism'
      default: return `Chain ${chainId}`
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setIsDialogOpen(false)
  }

  if (isConnected && address) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-black hover:bg-gray-900 border-gray-600 text-white hover:text-white"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {formatAddress(address)}
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-black border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Wallet Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Address */}
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <label className="text-sm text-gray-400 block mb-2">Address</label>
              <div className="flex items-center justify-between">
                <span className="font-mono text-white text-sm">{formatAddress(address)}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyAddress}
                    className="p-2 h-auto hover:bg-gray-800"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                    className="p-2 h-auto hover:bg-gray-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Network and Balance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-900/50 rounded-lg">
                <label className="text-sm text-gray-400 block mb-1">Network</label>
                <span className="text-blue-400 font-medium">
                  {chainId ? getChainName(chainId) : 'Unknown'}
                </span>
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg">
                <label className="text-sm text-gray-400 block mb-1">Balance</label>
                <span className="text-green-400 font-medium">
                  {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0 ETH'}
                </span>
              </div>
            </div>

            {/* Disconnect Button */}
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      size="sm"
      className="bg-black hover:bg-gray-900 border border-gray-600 text-white hover:text-white"
    >
      {isConnecting ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </>
      )}
    </Button>
  )
}
