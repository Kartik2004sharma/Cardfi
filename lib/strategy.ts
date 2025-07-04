export interface YieldStrategy {
  id: string;
  name: string;
  protocol: string;
  chainId: number;
  tokenAddress: string;
  currentAPY: number;
  tvl: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  minDeposit: number;
  maxDeposit: number;
  isActive: boolean;
}

export interface YieldPosition {
  id: string;
  strategyId: string;
  userAddress: string;
  amount: number;
  shares: number;
  entryPrice: number;
  entryDate: Date;
  currentValue: number;
  unrealizedPnL: number;
  harvestedRewards: number;
}

export interface RebalanceConfig {
  thresholdAPYDrop: number; // Percentage drop in APY to trigger rebalance
  minRebalanceAmount: number; // Minimum USDC amount to rebalance
  maxSlippage: number; // Maximum slippage tolerance
  rebalanceFrequency: number; // Hours between automatic checks
  emergencyExitEnabled: boolean;
}

export interface ProtocolIntegration {
  name: string;
  chainId: number;
  contractAddress: string;
  depositFunction: string;
  withdrawFunction: string;
  getBalanceFunction: string;
  getAPYFunction: string;
}

class StrategyService {
  private strategies: YieldStrategy[] = [];
  private positions: YieldPosition[] = [];
  private protocolIntegrations: ProtocolIntegration[] = [];

  constructor() {
    this.initializeStrategies();
    this.initializeProtocolIntegrations();
  }

  private initializeStrategies() {
    // Mock yield strategies - in production, these would be fetched from DeFi protocols
    this.strategies = [
      {
        id: 'aave-eth-usdc',
        name: 'Aave USDC Lending',
        protocol: 'Aave',
        chainId: 1,
        tokenAddress: '0xA0b86a33E6441e8dd7b6ba15b7b77c01b', // USDC on Ethereum
        currentAPY: 8.5,
        tvl: 2500000000, // $2.5B
        riskLevel: 'LOW',
        minDeposit: 10,
        maxDeposit: 1000000,
        isActive: true,
      },
      {
        id: 'compound-eth-usdc',
        name: 'Compound USDC Market',
        protocol: 'Compound',
        chainId: 1,
        tokenAddress: '0xA0b86a33E6441e8dd7b6ba15b7b77c01b',
        currentAPY: 7.8,
        tvl: 1800000000, // $1.8B
        riskLevel: 'LOW',
        minDeposit: 10,
        maxDeposit: 1000000,
        isActive: true,
      },
      {
        id: 'aave-polygon-usdc',
        name: 'Aave Polygon USDC',
        protocol: 'Aave',
        chainId: 137,
        tokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        currentAPY: 12.3,
        tvl: 450000000, // $450M
        riskLevel: 'MEDIUM',
        minDeposit: 5,
        maxDeposit: 500000,
        isActive: true,
      },
      {
        id: 'compound-arbitrum-usdc',
        name: 'Compound Arbitrum USDC',
        protocol: 'Compound',
        chainId: 42161,
        tokenAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        currentAPY: 9.8,
        tvl: 320000000, // $320M
        riskLevel: 'MEDIUM',
        minDeposit: 5,
        maxDeposit: 500000,
        isActive: true,
      },
    ];
  }

  private initializeProtocolIntegrations() {
    this.protocolIntegrations = [
      {
        name: 'Aave',
        chainId: 1,
        contractAddress: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', // Aave Lending Pool
        depositFunction: 'deposit',
        withdrawFunction: 'withdraw',
        getBalanceFunction: 'balanceOf',
        getAPYFunction: 'getReserveData',
      },
      {
        name: 'Compound',
        chainId: 1,
        contractAddress: '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // cUSDC
        depositFunction: 'mint',
        withdrawFunction: 'redeem',
        getBalanceFunction: 'balanceOf',
        getAPYFunction: 'supplyRatePerBlock',
      },
    ];
  }

  async getAllStrategies(): Promise<YieldStrategy[]> {
    return this.strategies.filter(strategy => strategy.isActive);
  }

  async getStrategiesByChain(chainId: number): Promise<YieldStrategy[]> {
    return this.strategies.filter(
      strategy => strategy.chainId === chainId && strategy.isActive
    );
  }

  async getBestStrategy(
    amount: number,
    riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
  ): Promise<YieldStrategy | null> {
    const availableStrategies = this.strategies.filter(
      strategy =>
        strategy.isActive &&
        strategy.minDeposit <= amount &&
        strategy.maxDeposit >= amount &&
        this.getRiskScore(strategy.riskLevel) <= this.getRiskScore(riskTolerance)
    );

    if (availableStrategies.length === 0) return null;

    // Return strategy with highest APY
    return availableStrategies.reduce((best, current) =>
      current.currentAPY > best.currentAPY ? current : best
    );
  }

  private getRiskScore(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'): number {
    switch (riskLevel) {
      case 'LOW': return 1;
      case 'MEDIUM': return 2;
      case 'HIGH': return 3;
      default: return 1;
    }
  }

  async executeDeposit(
    strategyId: string,
    userAddress: string,
    amount: number,
    signer: any
  ): Promise<string> {
    const strategy = this.strategies.find(s => s.id === strategyId);
    if (!strategy) {
      throw new Error('Strategy not found');
    }

    const integration = this.protocolIntegrations.find(
      p => p.name === strategy.protocol && p.chainId === strategy.chainId
    );
    
    if (!integration) {
      throw new Error('Protocol integration not found');
    }

    // TODO: Implement actual smart contract interaction
    // This would use ethers.js or web3.js to call the deposit function
    console.log(`Depositing ${amount} USDC to ${strategy.name}`);
    
    // Mock transaction hash
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    // Create position record
    const position: YieldPosition = {
      id: `pos_${Date.now()}`,
      strategyId,
      userAddress,
      amount,
      shares: amount / strategy.currentAPY, // Simplified share calculation
      entryPrice: 1, // USDC = $1
      entryDate: new Date(),
      currentValue: amount,
      unrealizedPnL: 0,
      harvestedRewards: 0,
    };

    this.positions.push(position);

    return txHash;
  }

  async executeWithdraw(
    positionId: string,
    amount: number,
    signer: any
  ): Promise<string> {
    const position = this.positions.find(p => p.id === positionId);
    if (!position) {
      throw new Error('Position not found');
    }

    const strategy = this.strategies.find(s => s.id === position.strategyId);
    if (!strategy) {
      throw new Error('Strategy not found');
    }

    // TODO: Implement actual smart contract interaction
    console.log(`Withdrawing ${amount} USDC from ${strategy.name}`);
    
    // Update position
    position.amount -= amount;
    if (position.amount <= 0) {
      // Remove position if fully withdrawn
      const index = this.positions.findIndex(p => p.id === positionId);
      this.positions.splice(index, 1);
    }

    // Mock transaction hash
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  async rebalancePortfolio(
    userAddress: string,
    config: RebalanceConfig,
    signer: any
  ): Promise<{
    executed: boolean;
    fromStrategy?: string;
    toStrategy?: string;
    amount?: number;
    txHash?: string;
    reason?: string;
  }> {
    const userPositions = this.positions.filter(p => p.userAddress === userAddress);
    
    if (userPositions.length === 0) {
      return { executed: false, reason: 'No positions to rebalance' };
    }

    // Find best current strategy
    const totalAmount = userPositions.reduce((sum, pos) => sum + pos.amount, 0);
    const bestStrategy = await this.getBestStrategy(totalAmount);
    
    if (!bestStrategy) {
      return { executed: false, reason: 'No suitable strategy found' };
    }

    // Check if current strategy is still optimal
    const currentPositions = userPositions.filter(pos => 
      pos.strategyId === bestStrategy.id
    );

    if (currentPositions.length > 0 && currentPositions[0].amount >= totalAmount * 0.8) {
      return { executed: false, reason: 'Current allocation is already optimal' };
    }

    // Find position with lowest APY to rebalance from
    let lowestAPYPosition = null;
    let lowestAPY = Infinity;

    for (const position of userPositions) {
      const strategy = this.strategies.find(s => s.id === position.strategyId);
      if (strategy && strategy.currentAPY < lowestAPY) {
        lowestAPY = strategy.currentAPY;
        lowestAPYPosition = position;
      }
    }

    if (!lowestAPYPosition) {
      return { executed: false, reason: 'No position to rebalance from' };
    }

    // Check if APY improvement is significant enough
    const apyImprovement = bestStrategy.currentAPY - lowestAPY;
    if (apyImprovement < config.thresholdAPYDrop) {
      return { 
        executed: false, 
        reason: `APY improvement ${apyImprovement}% below threshold ${config.thresholdAPYDrop}%` 
      };
    }

    // Execute rebalance
    const rebalanceAmount = Math.min(lowestAPYPosition.amount, config.minRebalanceAmount);
    
    // Withdraw from old strategy
    await this.executeWithdraw(lowestAPYPosition.id, rebalanceAmount, signer);
    
    // Deposit to new strategy
    const txHash = await this.executeDeposit(
      bestStrategy.id,
      userAddress,
      rebalanceAmount,
      signer
    );

    return {
      executed: true,
      fromStrategy: lowestAPYPosition.strategyId,
      toStrategy: bestStrategy.id,
      amount: rebalanceAmount,
      txHash,
      reason: `Rebalanced for ${apyImprovement}% APY improvement`,
    };
  }

  async getUserPositions(userAddress: string): Promise<YieldPosition[]> {
    return this.positions.filter(p => p.userAddress === userAddress);
  }

  async getPortfolioSummary(userAddress: string): Promise<{
    totalValue: number;
    totalDeposited: number;
    unrealizedPnL: number;
    weightedAPY: number;
    positions: YieldPosition[];
  }> {
    const positions = await this.getUserPositions(userAddress);
    
    const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
    const totalDeposited = positions.reduce((sum, pos) => sum + pos.amount, 0);
    const unrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
    
    // Calculate weighted APY
    let weightedAPY = 0;
    for (const position of positions) {
      const strategy = this.strategies.find(s => s.id === position.strategyId);
      if (strategy) {
        const weight = position.amount / totalDeposited;
        weightedAPY += strategy.currentAPY * weight;
      }
    }

    return {
      totalValue,
      totalDeposited,
      unrealizedPnL,
      weightedAPY,
      positions,
    };
  }

  async updateStrategyAPYs(): Promise<void> {
    // TODO: Implement real-time APY updates from DeFi protocols
    // This would fetch current rates from Aave, Compound, etc.
    console.log('Updating strategy APYs...');
    
    // Mock APY updates
    this.strategies.forEach(strategy => {
      const variance = (Math.random() - 0.5) * 0.02; // ±1% variance
      strategy.currentAPY = Math.max(0.1, strategy.currentAPY + variance);
    });
  }

  async emergencyExit(userAddress: string, signer: any): Promise<string[]> {
    const positions = await this.getUserPositions(userAddress);
    const txHashes: string[] = [];

    for (const position of positions) {
      const txHash = await this.executeWithdraw(position.id, position.amount, signer);
      txHashes.push(txHash);
    }

    return txHashes;
  }
}

// Mock data functions for dashboard
export const mockStrategies = (): YieldStrategy[] => [
  {
    id: "aave-usdc",
    name: "USDC Supply",
    protocol: "Aave V3",
    chainId: 1,
    tokenAddress: "0xa0b86a33e6df4f6a98a10f2b8b2aef7d2b8c5c19",
    currentAPY: 8.45,
    tvl: 125000000,
    riskLevel: "LOW",
    minDeposit: 10,
    maxDeposit: 1000000,
    isActive: true
  },
  {
    id: "compound-usdc",
    name: "USDC Lending",
    protocol: "Compound V3",
    chainId: 1,
    tokenAddress: "0xc3f739c03a18c13bb08ad8b9e2de5d9ac6c46b51",
    currentAPY: 7.82,
    tvl: 89000000,
    riskLevel: "LOW",
    minDeposit: 10,
    maxDeposit: 1000000,
    isActive: true
  },
  {
    id: "pendle-pt",
    name: "PT-stETH-Dec24",
    protocol: "Pendle",
    chainId: 1,
    tokenAddress: "0x848d2e0e6b6f15b0ca2b3d8d0e1a8b9c5d8a4e2d",
    currentAPY: 12.67,
    tvl: 45000000,
    riskLevel: "MEDIUM",
    minDeposit: 100,
    maxDeposit: 500000,
    isActive: true
  }
]

export const mockAPYHistory = () => {
  const data = []
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  for (let i = 30; i >= 0; i--) {
    const timestamp = now - i * dayMs
    const baseAPY = 8.5
    const volatility = (Math.random() - 0.5) * 2 // ±1% volatility
    const apy = Math.max(5, baseAPY + volatility)
    
    data.push({
      timestamp,
      apy: parseFloat(apy.toFixed(2)),
      date: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })
  }

  return data
}

export const mockRebalanceHistory = () => [
  {
    id: "rebalance-1",
    fromProtocol: "Aave V3",
    toProtocol: "Compound V3",
    amount: 15000,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    gasUsed: "0.0045"
  },
  {
    id: "rebalance-2",
    fromProtocol: "Compound V3",
    toProtocol: "Pendle",
    amount: 8500,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    gasUsed: "0.0067"
  },
  {
    id: "rebalance-3",
    fromProtocol: "Pendle",
    toProtocol: "Aave V3",
    amount: 22000,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    gasUsed: "0.0052"
  }
]

export const mockRewards = () => [
  {
    id: "reward-1",
    source: "Card Spend" as const,
    amount: 12.45,
    token: "USDC",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: "reward-2",
    source: "Yield" as const,
    amount: 8.92,
    token: "USDC",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    protocol: "Aave V3"
  },
  {
    id: "reward-3",
    source: "Yield" as const,
    amount: 15.67,
    token: "USDC",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    protocol: "Compound V3"
  },
  {
    id: "reward-4",
    source: "Card Spend" as const,
    amount: 5.23,
    token: "USDC",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
  },
  {
    id: "reward-5",
    source: "Liquidity" as const,
    amount: 28.91,
    token: "USDC",
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    protocol: "Pendle"
  }
]

export const strategyService = new StrategyService();
export default strategyService;
