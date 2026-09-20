import { NextRequest, NextResponse } from 'next/server';

// Mock yield strategies data - in production, this would come from a database or external API
const MOCK_STRATEGIES = [
  {
    id: 'aave-usdc-sepolia',
    name: 'AAVE USDC Lending',
    protocol: 'Aave V3',
    chainId: 11155111, // Sepolia
    currentAPY: 4.25,
    tvl: 125000000,
    riskLevel: 'LOW' as const,
    minDeposit: 1,
    maxDeposit: 1000000,
    isActive: true,
    contractAddress: '0x0000000000000000000000000000000000000000',
    description: 'Earn yield by lending USDC on Aave V3 protocol'
  },

  {
    id: 'quickswap-usdc-amoy',
    name: 'QuickSwap USDC Pool',
    protocol: 'QuickSwap',
    chainId: 80002, // Polygon Amoy
    currentAPY: 8.65,
    tvl: 45000000,
    riskLevel: 'MEDIUM' as const,
    minDeposit: 1,
    maxDeposit: 250000,
    isActive: true,
    contractAddress: '0x0000000000000000000000000000000000000000',
    description: 'Provide liquidity to USDC pools on QuickSwap DEX'
  },
  {
    id: 'sushiswap-usdc-amoy',
    name: 'SushiSwap USDC-MATIC',
    protocol: 'SushiSwap',
    chainId: 80002, // Polygon Amoy
    currentAPY: 12.4,
    tvl: 32000000,
    riskLevel: 'HIGH' as const,
    minDeposit: 1,
    maxDeposit: 100000,
    isActive: true,
    contractAddress: '0x0000000000000000000000000000000000000000',
    description: 'High-yield USDC-MATIC liquidity pool on SushiSwap'
  },
  {
    id: 'uniswap-usdc-base',
    name: 'Uniswap V3 USDC Pool',
    protocol: 'Uniswap V3',
    chainId: 84532, // Base Sepolia
    currentAPY: 6.2,
    tvl: 78000000,
    riskLevel: 'MEDIUM' as const,
    minDeposit: 1,
    maxDeposit: 750000,
    isActive: true,
    contractAddress: '0x0000000000000000000000000000000000000000',
    description: 'Concentrated liquidity USDC pool on Uniswap V3'
  },
  {
    id: 'curve-usdc-mainnet',
    name: 'Curve 3Pool',
    protocol: 'Curve Finance',
    chainId: 1, // Ethereum Mainnet
    currentAPY: 5.8,
    tvl: 250000000,
    riskLevel: 'LOW' as const,
    minDeposit: 10,
    maxDeposit: 2000000,
    isActive: false, // Disabled for testnet focus
    contractAddress: '0x0000000000000000000000000000000000000000',
    description: 'Stable yield from Curve Finance 3Pool'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId');
    const riskLevel = searchParams.get('riskLevel');
    const minAPY = searchParams.get('minAPY');

    let filteredStrategies = [...MOCK_STRATEGIES];

    // Filter by chain ID
    if (chainId) {
      const targetChainId = parseInt(chainId);
      filteredStrategies = filteredStrategies.filter(
        strategy => strategy.chainId === targetChainId
      );
    }

    // Filter by risk level
    if (riskLevel) {
      filteredStrategies = filteredStrategies.filter(
        strategy => strategy.riskLevel === riskLevel.toUpperCase()
      );
    }

    // Filter by minimum APY
    if (minAPY) {
      const targetAPY = parseFloat(minAPY);
      filteredStrategies = filteredStrategies.filter(
        strategy => strategy.currentAPY >= targetAPY
      );
    }

    // Sort by APY descending
    filteredStrategies.sort((a, b) => b.currentAPY - a.currentAPY);

    return NextResponse.json({
      success: true,
      data: filteredStrategies,
      meta: {
        totalStrategies: filteredStrategies.length,
        avgAPY: filteredStrategies.reduce((sum, s) => sum + s.currentAPY, 0) / filteredStrategies.length || 0,
        totalTVL: filteredStrategies.reduce((sum, s) => sum + s.tvl, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching yield strategies:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch yield strategies',
        data: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategyId, amount, userAddress } = body;

    // Validate input
    if (!strategyId || !amount || !userAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: strategyId, amount, userAddress' 
        },
        { status: 400 }
      );
    }

    // Find strategy
    const strategy = MOCK_STRATEGIES.find(s => s.id === strategyId);
    if (!strategy) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Strategy not found' 
        },
        { status: 404 }
      );
    }

    // Return the strategy details so the client can construct the on-chain transaction using wagmi.
    // The previous Math.random() txHash mock has been removed (Phase 8).
    // Actual Aave deposit execution must happen client-side via wallet signatures.
    return NextResponse.json({
      success: true,
      data: {
        strategyId,
        amount,
        userAddress,
        contractAddress: strategy.contractAddress,
        protocol: strategy.protocol
      },
      message: 'Deposit parameters validated. Proceed with wallet signature.'
    });

  } catch (error) {
    console.error('Error processing deposit:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process deposit parameters' 
      },
      { status: 500 }
    );
  }
}
