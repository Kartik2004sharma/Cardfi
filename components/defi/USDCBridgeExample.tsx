import React, { useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { lifiService } from '@/lib/integrations/lifi/bridge'
import { toast } from 'react-hot-toast'

export function USDCBridgeExample() {
  const { isConnected, address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [amount, setAmount] = useState('1.0')
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState('')

  const handleBridge = async () => {
    if (!walletClient || !isConnected || !address) {
      toast.error('Please connect your wallet')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setIsLoading(true)
    try {
      toast.loading('Initiating USDC bridge from Sepolia to Mumbai...')
      
      // For now, we'll use the address directly since we don't have a signer
      // In a real implementation, you'd convert walletClient to ethers signer
      const mockSigner = {
        getAddress: async () => address,
        // Add other signer methods as needed
      } as any
      
      const result = await lifiService.bridgeUSDC(mockSigner, amount)
      
      setTxHash(result.txHash)
      toast.success(`Bridge initiated! Transaction: ${result.txHash}`)
      
      // You can add polling for transaction status here
      console.log('Bridge transaction hash:', result.txHash)
      
    } catch (error: any) {
      console.error('Bridge failed:', error)
      toast.error(error.message || 'Bridge failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>USDC Bridge</CardTitle>
          <CardDescription>
            Please connect your wallet to bridge USDC
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Bridge USDC</CardTitle>
        <CardDescription>
          Bridge USDC from Ethereum Sepolia to Polygon Mumbai
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (USDC)</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1.0"
            step="0.1"
            min="0"
          />
          <p className="text-xs text-muted-foreground">
            Bridging from Sepolia (11155111) to Mumbai (80001)
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>From:</span>
            <span className="font-medium">Ethereum Sepolia</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>To:</span>
            <span className="font-medium">Polygon Mumbai</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Token:</span>
            <span className="font-medium">USDC</span>
          </div>
        </div>

        <Button 
          onClick={handleBridge}
          disabled={isLoading || !amount}
          className="w-full"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Bridging...
            </>
          ) : (
            'Bridge USDC'
          )}
        </Button>

        {txHash && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              Bridge Initiated!
            </p>
            <p className="text-xs text-green-600 mt-1 break-all">
              Tx: {txHash}
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View on Etherscan →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
