"use client"

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Wallet, 
  CreditCard, 
  Send, 
  Eye, 
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle2 
} from 'lucide-react'

export function WalletDemo() {
  const { 
    address, 
    isConnected, 
    chainId, 
    balance, 
    provider,
    signer,
    error 
  } = useWallet()
  
  const [txHash, setTxHash] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const sendTestTransaction = async () => {
    if (!signer) return
    
    setIsLoading(true)
    try {
      // Send a small test transaction to yourself (0.001 ETH)
      const tx = await signer.sendTransaction({
        to: address,
        value: '1000000000000000' // 0.001 ETH in wei
      })
      
      setTxHash(tx.hash)
      console.log('Transaction sent:', tx.hash)
      
      // Wait for confirmation
      await tx.wait()
      console.log('Transaction confirmed!')
    } catch (err) {
      console.error('Transaction failed:', err)
    }
    setIsLoading(false)
  }

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet'
      case 11155111: return 'Sepolia Testnet'
      case 137: return 'Polygon'
      case 42161: return 'Arbitrum'
      case 10: return 'Optimism'
      default: return `Chain ${chainId}`
    }
  }

  if (!isConnected) {
    return (
      <Card className="bg-black/50 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Wallet className="w-5 h-5" />
            Wallet Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              Connect your wallet to test MetaMask integration
            </p>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Wallet not connected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/50 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          Wallet Connected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <label className="text-sm text-gray-400">Address</label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-white text-sm">
                  {`${address.slice(0, 8)}...${address.slice(-6)}`}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(address)}
                  className="p-1 h-auto"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                  className="p-1 h-auto"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <label className="text-sm text-gray-400">Network</label>
              <p className="font-semibold text-white">
                {chainId ? getChainName(chainId) : 'Unknown'}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <label className="text-sm text-gray-400">Balance</label>
              <p className="font-semibold text-white">
                {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0 ETH'}
              </p>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Test Web3 Actions</h4>
          
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={sendTestTransaction}
              disabled={isLoading || !balance || parseFloat(balance) < 0.001}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Sending...' : 'Send Test Transaction (0.001 ETH)'}
            </Button>
            
            {txHash && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Transaction Sent
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-400">
                    {`${txHash.slice(0, 10)}...${txHash.slice(-8)}`}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}
                    className="p-1 h-auto"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Integration Status */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h5 className="text-blue-400 font-medium mb-2">Integration Status</h5>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">MetaMask SDK</span>
              <span className="text-green-400">✓ Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Ethers.js Provider</span>
              <span className="text-green-400">✓ Ready</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Signer Available</span>
              <span className="text-green-400">✓ Active</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
