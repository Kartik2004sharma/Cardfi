import { NextRequest, NextResponse } from 'next/server';
import { enhancedLiFiService } from '@/lib/enhanced-lifi-v2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'chains':
        const chains = await enhancedLiFiService.getSupportedChains();
        return NextResponse.json({
          success: true,
          data: chains,
        });

      case 'optimal-chain':
        const amount = searchParams.get('amount');
        if (!amount) {
          return NextResponse.json(
            {
              success: false,
              error: 'Amount is required for optimal chain calculation',
            },
            { status: 400 }
          );
        }
        const optimalChain = await enhancedLiFiService.getOptimalChainForYield(amount);
        return NextResponse.json({
          success: true,
          data: optimalChain,
        });

      case 'bridge-status':
        const txHash = searchParams.get('txHash');
        const bridge = searchParams.get('bridge');
        if (!txHash || !bridge) {
          return NextResponse.json(
            {
              success: false,
              error: 'Transaction hash and bridge name are required',
            },
            { status: 400 }
          );
        }
        const fromChain = searchParams.get('fromChain');
        const toChain = searchParams.get('toChain');
        if (!fromChain || !toChain) {
          return NextResponse.json(
            {
              success: false,
              error: 'From chain and to chain are required for status check',
            },
            { status: 400 }
          );
        }
        const status = await enhancedLiFiService.getRouteStatus(
          txHash, 
          parseInt(fromChain), 
          parseInt(toChain)
        );
        return NextResponse.json({
          success: true,
          data: status,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in LiFi GET endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process request',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'quote':
        const {
          fromChain,
          toChain,
          fromToken,
          toToken,
          fromAmount,
          fromAddress,
          toAddress,
          order,
          slippage,
        } = body;

        if (!fromChain || !toChain || !fromToken || !toToken || !fromAmount || !fromAddress || !toAddress) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing required parameters for quote',
            },
            { status: 400 }
          );
        }

        const routes = await enhancedLiFiService.getRoutes({
          fromChain,
          toChain,
          fromToken,
          toToken,
          fromAmount,
          fromAddress,
          toAddress,
          order,
          slippage,
        });

        return NextResponse.json({
          success: true,
          data: routes,
        });

      case 'bridge-for-yield':
        const { fromChainId, toChainId, userAddress, amount, signer } = body;

        if (!fromChainId || !toChainId || !userAddress || !amount) {
          return NextResponse.json(
            {
              success: false,
              error: 'From chain ID, to chain ID, user address, and amount are required',
            },
            { status: 400 }
          );
        }

        const bridgeResult = await enhancedLiFiService.bridgeUSDCWithCCTP(
          fromChainId,
          toChainId,
          amount,
          userAddress,
          signer
        );

        return NextResponse.json({
          success: true,
          data: bridgeResult,
        });

      case 'estimate-cost':
        const {
          fromChainId: fromId,
          toChainId: toId,
          amount: estimateAmount,
          userAddress: estimateAddress,
        } = body;

        if (!fromId || !toId || !estimateAmount || !estimateAddress) {
          return NextResponse.json(
            {
              success: false,
              error: 'All parameters are required for cost estimation',
            },
            { status: 400 }
          );
        }

        const costEstimate = await enhancedLiFiService.estimateBridgeFee(
          fromId,
          toId,
          estimateAmount,
          estimateAddress
        );

        return NextResponse.json({
          success: true,
          data: costEstimate,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in LiFi POST endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process request',
      },
      { status: 500 }
    );
  }
}
