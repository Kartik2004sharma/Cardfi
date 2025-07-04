import { LiFi, createConfig, ChainId, ExtendedChain } from '@lifi/sdk';
import type { Route, Token, Step, LiFiStep } from '@lifi/sdk';

export interface LiFiRoute extends Route {}
export interface LiFiToken extends Token {}
export interface LiFiStep extends Step {}

export interface LiFiQuoteRequest {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
  toAddress: string;
  order?: 'CHEAPEST' | 'FASTEST' | 'SAFEST';
  slippage?: number;
}

export interface CCTPRoute {
  id: string;
  fromChainId: number;
  toChainId: number;
  useCCTP: boolean;
  estimatedDuration: number;
  fee: string;
  bridgeProvider: string;
}

class EnhancedLiFiService {
  private lifi: LiFi;
  private isInitialized = false;

  constructor() {
    // Initialize LiFi SDK with proper configuration
    const config = createConfig({
      // Add RPC providers for better reliability
      rpcs: {
        [ChainId.ETH]: ['https://eth.llamarpc.com'],
        [ChainId.POL]: ['https://polygon.llamarpc.com'],
        [ChainId.ARB]: ['https://arbitrum.llamarpc.com'],
        [ChainId.OPT]: ['https://optimism.llamarpc.com'],
        [ChainId.BAS]: ['https://base.llamarpc.com'],
      },
      // Configure API settings
      apiUrl: 'https://li.quest/v1',
      defaultRouteOptions: {
        order: 'CHEAPEST',
        slippage: 0.03, // 3%
        maxPriceImpact: 0.4, // 40%
        allowSwitchChain: true,
      },
    });

    this.lifi = new LiFi(config);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Test connection to LiFi API
      await this.lifi.getChains();
      this.isInitialized = true;
      console.log('LiFi SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LiFi SDK:', error);
      throw new Error('LiFi SDK initialization failed');
    }
  }

  async getSupportedChains(): Promise<ExtendedChain[]> {
    await this.initialize();
    return await this.lifi.getChains();
  }

  async getTokens(chainId: number): Promise<LiFiToken[]> {
    await this.initialize();
    return await this.lifi.getTokens({ chains: [chainId] });
  }

  async getUSDCToken(chainId: number): Promise<LiFiToken | null> {
    const tokens = await this.getTokens(chainId);
    return tokens.find(token => 
      token.symbol.toUpperCase() === 'USDC' || 
      token.symbol.toUpperCase() === 'USDC.E'
    ) || null;
  }

  async getRoutes(request: LiFiQuoteRequest): Promise<LiFiRoute[]> {
    await this.initialize();

    try {
      const routes = await this.lifi.getRoutes({
        fromChainId: request.fromChain,
        toChainId: request.toChain,
        fromTokenAddress: request.fromToken,
        toTokenAddress: request.toToken,
        fromAmount: request.fromAmount,
        fromAddress: request.fromAddress,
        toAddress: request.toAddress,
        options: {
          order: request.order || 'CHEAPEST',
          slippage: request.slippage || 0.03,
          // Prefer CCTP for USDC transfers
          preferBridges: ['cctp', 'stargate', 'hop'],
          allowSwitchChain: true,
        },
      });

      return routes.routes;
    } catch (error) {
      console.error('Error fetching LiFi routes:', error);
      throw new Error('Failed to fetch cross-chain routes');
    }
  }

  async getOptimalUSDCRoute(
    fromChainId: number,
    toChainId: number,
    amount: string,
    userAddress: string
  ): Promise<LiFiRoute | null> {
    try {
      // Get USDC tokens for both chains
      const [fromUSDC, toUSDC] = await Promise.all([
        this.getUSDCToken(fromChainId),
        this.getUSDCToken(toChainId),
      ]);

      if (!fromUSDC || !toUSDC) {
        throw new Error('USDC not available on one or both chains');
      }

      const routes = await this.getRoutes({
        fromChain: fromChainId,
        toChain: toChainId,
        fromToken: fromUSDC.address,
        toToken: toUSDC.address,
        fromAmount: amount,
        fromAddress: userAddress,
        toAddress: userAddress,
        order: 'CHEAPEST',
      });

      // Prioritize routes using CCTP (Circle's Cross-Chain Transfer Protocol)
      const cctpRoute = routes.find(route => 
        route.steps.some(step => 
          step.tool === 'cctp' || 
          step.toolDetails?.name?.toLowerCase().includes('circle')
        )
      );

      return cctpRoute || routes[0] || null;
    } catch (error) {
      console.error('Error getting optimal USDC route:', error);
      return null;
    }
  }

  async executeRoute(
    route: LiFiRoute,
    signer: any
  ): Promise<{
    txHash: string;
    status: 'PENDING' | 'DONE' | 'FAILED';
  }> {
    await this.initialize();

    try {
      const execution = await this.lifi.executeRoute(signer, route);
      
      return {
        txHash: execution.txHash,
        status: 'PENDING',
      };
    } catch (error) {
      console.error('Error executing route:', error);
      throw new Error('Failed to execute cross-chain transaction');
    }
  }

  async getRouteStatus(
    txHash: string,
    fromChainId: number,
    toChainId: number
  ): Promise<{
    status: 'PENDING' | 'DONE' | 'FAILED';
    fromTxHash?: string;
    toTxHash?: string;
    bridgeTxHash?: string;
  }> {
    await this.initialize();

    try {
      const status = await this.lifi.getStatus({
        txHash,
        bridge: 'cctp', // Monitor CCTP specifically
        fromChain: fromChainId,
        toChain: toChainId,
      });

      return {
        status: status.status as 'PENDING' | 'DONE' | 'FAILED',
        fromTxHash: status.sending?.txHash,
        toTxHash: status.receiving?.txHash,
        bridgeTxHash: status.bridging?.txHash,
      };
    } catch (error) {
      console.error('Error getting route status:', error);
      return { status: 'FAILED' };
    }
  }

  async getCCTPRoutes(
    fromChainId: number,
    toChainId: number,
    amount: string,
    userAddress: string
  ): Promise<CCTPRoute[]> {
    try {
      const routes = await this.getOptimalUSDCRoute(
        fromChainId,
        toChainId,
        amount,
        userAddress
      );

      if (!routes) return [];

      // Filter and format CCTP-specific routes
      const cctpRoutes: CCTPRoute[] = [];

      if (routes.steps.some(step => step.tool === 'cctp')) {
        cctpRoutes.push({
          id: routes.id,
          fromChainId,
          toChainId,
          useCCTP: true,
          estimatedDuration: routes.steps.reduce((total, step) => 
            total + (step.estimate.executionDuration || 0), 0
          ),
          fee: routes.steps.reduce((total, step) => {
            const gasCost = step.estimate.gasCosts?.[0]?.amount || '0';
            return (BigInt(total) + BigInt(gasCost)).toString();
          }, '0'),
          bridgeProvider: 'Circle CCTP v2',
        });
      }

      return cctpRoutes;
    } catch (error) {
      console.error('Error getting CCTP routes:', error);
      return [];
    }
  }

  async estimateBridgeFee(
    fromChainId: number,
    toChainId: number,
    amount: string,
    userAddress: string
  ): Promise<{
    gasFee: string;
    bridgeFee: string;
    totalFee: string;
    estimatedTime: number;
  }> {
    try {
      const route = await this.getOptimalUSDCRoute(
        fromChainId,
        toChainId,
        amount,
        userAddress
      );

      if (!route) {
        throw new Error('No route available');
      }

      const gasFee = route.steps.reduce((total, step) => {
        const gasCost = step.estimate.gasCosts?.[0]?.amount || '0';
        return (BigInt(total) + BigInt(gasCost)).toString();
      }, '0');

      const bridgeFee = route.steps.reduce((total, step) => {
        return (BigInt(total) + BigInt(step.estimate.feeCosts?.[0]?.amount || '0')).toString();
      }, '0');

      const totalFee = (BigInt(gasFee) + BigInt(bridgeFee)).toString();

      const estimatedTime = route.steps.reduce((total, step) => 
        total + (step.estimate.executionDuration || 0), 0
      );

      return {
        gasFee,
        bridgeFee,
        totalFee,
        estimatedTime,
      };
    } catch (error) {
      console.error('Error estimating bridge fee:', error);
      throw new Error('Failed to estimate bridge fee');
    }
  }

  async getOptimalChainForYield(amount: string): Promise<{
    chainId: number;
    chainName: string;
    estimatedAPY: number;
    bridgeCost: string;
    netYield: number;
  }> {
    // This would integrate with DeFi protocols to find the best yield
    // For now, return mock data that demonstrates the concept
    const yieldChains = [
      {
        chainId: ChainId.POL,
        chainName: 'Polygon',
        estimatedAPY: 8.5,
        bridgeCost: '0.50',
        netYield: 8.3,
      },
      {
        chainId: ChainId.ARB,
        chainName: 'Arbitrum',
        estimatedAPY: 7.8,
        bridgeCost: '2.50',
        netYield: 7.5,
      },
      {
        chainId: ChainId.BAS,
        chainName: 'Base',
        estimatedAPY: 9.2,
        bridgeCost: '1.20',
        netYield: 9.0,
      },
    ];

    // Sort by net yield (APY minus bridge costs)
    yieldChains.sort((a, b) => b.netYield - a.netYield);

    return yieldChains[0];
  }

  async bridgeUSDCWithCCTP(
    fromChainId: number,
    toChainId: number,
    amount: string,
    userAddress: string,
    signer: any
  ): Promise<{
    txHash: string;
    routeId: string;
    estimatedArrival: number;
  }> {
    try {
      const route = await this.getOptimalUSDCRoute(
        fromChainId,
        toChainId,
        amount,
        userAddress
      );

      if (!route) {
        throw new Error('No CCTP route available');
      }

      const execution = await this.executeRoute(route, signer);

      return {
        txHash: execution.txHash,
        routeId: route.id,
        estimatedArrival: Date.now() + (route.steps.reduce((total, step) => 
          total + (step.estimate.executionDuration || 0), 0
        ) * 1000),
      };
    } catch (error) {
      console.error('Error bridging USDC with CCTP:', error);
      throw new Error('Failed to bridge USDC using CCTP');
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.getSupportedChains();
      return true;
    } catch (error) {
      console.error('LiFi health check failed:', error);
      return false;
    }
  }

  // Get SDK configuration
  getConfig() {
    return {
      isInitialized: this.isInitialized,
      apiUrl: 'https://li.quest/v1',
      supportedFeatures: ['CCTP', 'Bridge Status', 'Multi-chain Routing'],
    };
  }
}

export const enhancedLiFiService = new EnhancedLiFiService();
export default enhancedLiFiService;
