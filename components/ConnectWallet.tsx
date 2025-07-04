"use client"

import { useState } from 'react'
import { Wallet, AlertCircle, CheckCircle2, Copy, ExternalLink } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'

export function ConnectWallet() {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    chainId, 
    balance, 
    connectWallet, 
    disconnect, 
    error 
  } = useWallet()
  
  const [showFullAddress, setShowFullAddress] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      // Could add a toast notification here
    }
  }

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum'
      case 137: return 'Polygon'
      case 42161: return 'Arbitrum'
      case 10: return 'Optimism'
      case 56: return 'BSC'
      case 43114: return 'Avalanche'
      default: return `Chain ${chainId}`
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return ''
    return showFullAddress 
      ? address 
      : `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnected) {
    return (
      <div className="flex flex-col gap-3">
        {/* Connected Wallet Display */}
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-400 font-medium">Connected</span>
              {chainId && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  {getChainName(chainId)}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFullAddress(!showFullAddress)}
              className="text-white font-mono text-sm hover:text-green-400 transition-colors truncate"
            >
              {formatAddress(address)}
            </button>
            {balance && (
              <div className="text-xs text-gray-400">
                Balance: {parseFloat(balance).toFixed(4)} ETH
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={copyAddress}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Copy address"
            >
              <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="View on Etherscan"
            >
              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={disconnect}
          className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium transition-all duration-200"
        >
          Disconnect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Connect Button */}
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-400 font-medium text-sm">Connection Failed</div>
            <div className="text-red-300 text-sm">{error}</div>
            {error.includes('MetaMask is not installed') && (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm mt-2 underline"
              >
                Download MetaMask <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* MetaMask Info */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Connect your MetaMask wallet to start earning yield on your USDC
        </p>
      </div>
    </div>
  )
}
