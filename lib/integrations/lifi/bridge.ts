import { getRoutes, executeRoute, getStatus, Route, RoutesRequest } from '@lifi/sdk'
import { Signer } from 'ethers'

// Testnet chain configurations
export const TESTNET_CHAINS = {
  sepolia: {
    id: 11155111,
    name: 'Ethereum Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://ethereum-sepolia.blockpi.network/v1/rpc/public'],
    blockExplorers: ['https://sepolia.etherscan.io'],
    testnet: true
  },
  mumbai: {
    id: 80001,
    name: 'Polygon Mumbai',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorers: ['https://mumbai.polygonscan.com'],
    testnet: true
  },
  bnbTestnet: {
    id: 97,
    name: 'BNB Smart Chain Testnet',
    nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    blockExplorers: ['https://testnet.bscscan.com'],
    testnet: true
  },
  fuji: {
    id: 43113,
    name: 'Avalanche Fuji',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorers: ['https://testnet.snowtrace.io'],
    testnet: true
  }
} as const

// Testnet token addresses
export const TESTNET_TOKENS = {
  ETH: {
    [TESTNET_CHAINS.sepolia.id]: '0x0000000000000000000000000000000000000000', // Native ETH
  },
  MATIC: {
    [TESTNET_CHAINS.mumbai.id]: '0x0000000000000000000000000000000000000000', // Native MATIC
  },
  BNB: {
    [TESTNET_CHAINS.bnbTestnet.id]: '0x0000000000000000000000000000000000000000', // Native BNB
  },
  AVAX: {
    [TESTNET_CHAINS.fuji.id]: '0x0000000000000000000000000000000000000000', // Native AVAX
  },
  USDC: {
    [TESTNET_CHAINS.sepolia.id]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Circle USDC on Sepolia
    [TESTNET_CHAINS.mumbai.id]: '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23', // USDC on Mumbai
    [TESTNET_CHAINS.bnbTestnet.id]: '0x64544969ed7EBf5f083679233325356EbE738930', // USDC on BNB Testnet
    [TESTNET_CHAINS.fuji.id]: '0x5425890298aed601595a70AB815c96711a31Bc65', // USDC on Fuji
  }
} as const

export type SupportedToken = 'ETH' | 'MATIC' | 'BNB' | 'AVAX' | 'USDC'
export type SupportedChainId = keyof typeof TESTNET_CHAINS

export interface BridgeQuote {
  id: string
  route: Route
  fromChain: number
  toChain: number
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  estimatedGas: string
  duration: number
  tool: string
}

export interface BridgeExecutionStatus {
  status: 'idle' | 'loading' | 'success' | 'error'
  txHash?: string
  message?: string
  error?: string
}

class LiFiBridgeService {
  /**
   * Get available bridging routes
   */
  async getRoutes(
    fromChain: number,
    toChain: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    userAddress: string
  ): Promise<BridgeQuote[]> {
    try {
      const routeRequest: RoutesRequest = {
        fromChainId: fromChain,
        toChainId: toChain,
        fromTokenAddress,
        toTokenAddress,
        fromAmount: amount,
        fromAddress: userAddress,
        toAddress: userAddress,
        options: {
          slippage: 0.03,
          allowSwitchChain: true,
          bridges: {
            allow: ['connext', 'hop', 'cbridge', 'multichain', 'anyswap']
          }
        }
      }

      const routesResponse = await getRoutes(routeRequest)
      
      return routesResponse.routes.map((route: any, index: number) => ({
        id: `route-${index}`,
        route,
        fromChain,
        toChain,
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        fromAmount: amount,
        toAmount: route.toAmount,
        estimatedGas: route.gasCosts?.[0]?.estimate || '0',
        duration: route.steps.reduce((acc: number, step: any) => acc + (step.estimate?.executionDuration || 0), 0),
        tool: route.steps[0]?.tool || 'LiFi'
      }))
    } catch (error) {
      console.error('Error fetching routes:', error)
      throw new Error('Failed to fetch bridging routes')
    }
  }

  /**
   * Execute a bridge transaction
   */
  async executeRoute(
    route: Route,
    userAddress: string,
    updateCallback?: (update: any) => void
  ): Promise<{ txHash: string }> {
    try {
      const settings = {
        updateCallback: updateCallback || (() => {}),
        switchChainHook: async (requiredChainId: number) => {
          console.log(`Please switch to chain ${requiredChainId}`)
          // In a real app, this would trigger wagmi chain switching
          return Promise.resolve()
        }
      }

      const execution = await executeRoute(route, settings)
      
      return {
        txHash: execution.txHash
      }
    } catch (error) {
      console.error('Error executing bridge:', error)
      throw new Error('Bridge execution failed')
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string, fromChain: number) {
    try {
      const status = await getStatus({
        txHash,
        bridge: 'lifi',
        fromChain
      })
      return status
    } catch (error) {
      console.error('Error getting transaction status:', error)
      throw error
    }
  }

  /**
   * Get token address for a given chain and symbol
   */
  getTokenAddress(symbol: SupportedToken, chainId: number): string {
    const tokenAddresses = TESTNET_TOKENS[symbol]
    return tokenAddresses?.[chainId as keyof typeof tokenAddresses] || ''
  }

  /**
   * Get native token symbol for a chain
   */
  getNativeTokenSymbol(chainId: number): SupportedToken {
    switch (chainId) {
      case TESTNET_CHAINS.sepolia.id:
        return 'ETH'
      case TESTNET_CHAINS.mumbai.id:
        return 'MATIC'
      case TESTNET_CHAINS.bnbTestnet.id:
        return 'BNB'
      case TESTNET_CHAINS.fuji.id:
        return 'AVAX'
      default:
        return 'ETH'
    }
  }

  /**
   * Check if a token is supported on a chain
   */
  isTokenSupported(symbol: SupportedToken, chainId: number): boolean {
    if (symbol === 'USDC') {
      return !!TESTNET_TOKENS.USDC[chainId as keyof typeof TESTNET_TOKENS.USDC]
    }
    
    // Check if it's the native token for this chain
    return this.getNativeTokenSymbol(chainId) === symbol
  }

  /**
   * Get supported chains
   */
  getSupportedChains() {
    return Object.values(TESTNET_CHAINS)
  }

  /**
   * Get supported tokens for a chain
   */
  getSupportedTokens(chainId: number): SupportedToken[] {
    const nativeToken = this.getNativeTokenSymbol(chainId)
    const tokens: SupportedToken[] = [nativeToken]
    
    // Add USDC if supported
    if (this.isTokenSupported('USDC', chainId)) {
      tokens.push('USDC')
    }
    
    return tokens
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: string, decimals: number = 18): string {
    const num = parseFloat(amount) / Math.pow(10, decimals)
    return num.toFixed(6)
  }

  /**
   * Parse amount to wei
   */
  parseAmount(amount: string, decimals: number = 18): string {
    const num = parseFloat(amount) * Math.pow(10, decimals)
    return Math.floor(num).toString()
  }

  /**
   * Bridge USDC from Ethereum Sepolia to Polygon Mumbai
   * @param signer - The wagmi signer
   * @param amount - Amount in USDC (string or BigNumber)
   * @returns Promise with transaction hash
   */
  async bridgeUSDC(signer: Signer, amount: string): Promise<{ txHash: string }> {
    // Get user address from signer
    const userAddress = await signer.getAddress()
    
    const fromChain = TESTNET_CHAINS.sepolia.id // 11155111
    const toChain = TESTNET_CHAINS.mumbai.id // 80001
    const fromTokenAddress = this.getTokenAddress('USDC', fromChain) // Sepolia USDC
    const toTokenAddress = this.getTokenAddress('USDC', toChain) // Mumbai USDC

    // Convert amount to proper decimals (USDC has 6 decimals)
    const formattedAmount = this.parseAmount(amount, 6)

    // Get routes
    const routes = await this.getRoutes(
      fromChain, 
      toChain, 
      fromTokenAddress, 
      toTokenAddress, 
      formattedAmount, 
      userAddress
    )
    
    if (routes.length === 0) {
      throw new Error('No routes found for bridging USDC from Sepolia to Mumbai')
    }

    // Use the first route (best route by default from LiFi)
    const bestRoute = routes[0]
    
    // Execute the bridge
    const result = await this.executeRoute(bestRoute.route, userAddress, (update) => {
      console.log('Bridge update:', update)
    })

    return result
  }
}

export const lifiService = new LiFiBridgeService()
