import { useState, useCallback } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import toast from 'react-hot-toast'
import { lifiService, BridgeQuote, BridgeExecutionStatus, SupportedToken } from '@/lib/integrations/lifi/bridge'

export interface UseBridgeProps {
  fromChain: number
  toChain: number
  fromToken: SupportedToken
  toToken: SupportedToken
  amount: string
}

export interface UseBridgeReturn {
  quotes: BridgeQuote[]
  isLoadingQuotes: boolean
  executionStatus: BridgeExecutionStatus
  isExecuting: boolean
  error: string | null
  
  // Actions
  fetchQuotes: (params: UseBridgeProps) => Promise<void>
  executeRoute: (quote: BridgeQuote) => Promise<void>
  clearError: () => void
  reset: () => void
}

export function useBridge(): UseBridgeReturn {
  const { address, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  
  const [quotes, setQuotes] = useState<BridgeQuote[]>([])
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<BridgeExecutionStatus>({ status: 'idle' })
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bridgeParams, setBridgeParams] = useState<UseBridgeProps | null>(null)

  const fetchQuotes = useCallback(async (params: UseBridgeProps) => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return
    }

    if (params.fromChain === params.toChain) {
      setError('Source and destination chains must be different')
      return
    }

    if (!params.amount || parseFloat(params.amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setIsLoadingQuotes(true)
    setError(null)
    setBridgeParams(params)

    try {
      const fromTokenAddress = lifiService.getTokenAddress(params.fromToken, params.fromChain)
      const toTokenAddress = lifiService.getTokenAddress(params.toToken, params.toChain)

      if (!fromTokenAddress || !toTokenAddress) {
        throw new Error('Token not supported on selected chain')
      }

      // Parse amount based on token decimals
      const decimals = params.fromToken === 'USDC' ? 6 : 18
      const amountWei = lifiService.parseAmount(params.amount, decimals)

      const bridgeQuotes = await lifiService.getRoutes(
        params.fromChain,
        params.toChain,
        fromTokenAddress,
        toTokenAddress,
        amountWei,
        address
      )

      setQuotes(bridgeQuotes)
      
      if (bridgeQuotes.length === 0) {
        setError('No bridging routes found for this combination')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch bridging quotes'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoadingQuotes(false)
    }
  }, [isConnected, address])

  const executeRoute = useCallback(async (quote: BridgeQuote) => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return
    }

    setIsExecuting(true)
    setExecutionStatus({ status: 'loading', message: 'Preparing transaction...' })

    try {
      // Switch to source chain if needed
      if (switchChain) {
        await switchChain({ chainId: quote.fromChain })
      }

      setExecutionStatus({ status: 'loading', message: 'Executing bridge transaction...' })

      const result = await lifiService.executeRoute(
        quote.route,
        address,
        (update) => {
          setExecutionStatus({ 
            status: 'loading', 
            message: `Transaction status: ${update.status}`,
            txHash: update.txHash 
          })
        }
      )

      setExecutionStatus({
        status: 'success',
        message: 'Bridge transaction completed successfully!',
        txHash: result.txHash
      })

      toast.success('Bridge transaction completed!')

      // Poll for final status
      setTimeout(async () => {
        try {
          const status = await lifiService.getTransactionStatus(result.txHash, quote.fromChain)
          setExecutionStatus({
            status: status.status === 'DONE' ? 'success' : 'loading',
            message: `Final status: ${status.status}`,
            txHash: result.txHash
          })
        } catch (err) {
          console.error('Error checking final status:', err)
        }
      }, 5000)

    } catch (err: any) {
      const errorMessage = err.message || 'Bridge execution failed'
      setError(errorMessage)
      setExecutionStatus({ 
        status: 'error', 
        error: errorMessage 
      })
      toast.error(errorMessage)
    } finally {
      setIsExecuting(false)
    }
  }, [isConnected, address, switchChain])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setQuotes([])
    setError(null)
    setExecutionStatus({ status: 'idle' })
    setIsExecuting(false)
    setIsLoadingQuotes(false)
    setBridgeParams(null)
  }, [])

  return {
    quotes,
    isLoadingQuotes,
    executionStatus,
    isExecuting,
    error,
    fetchQuotes,
    executeRoute,
    clearError,
    reset
  }
}
