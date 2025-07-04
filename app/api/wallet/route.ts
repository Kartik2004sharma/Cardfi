import { NextRequest, NextResponse } from 'next/server';
import { circleService } from '@/lib/circle';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');
    const action = searchParams.get('action');

    if (!walletId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Wallet ID is required',
        },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'balance':
        result = await circleService.getWalletBalance(walletId);
        break;
      case 'usdc-balance':
        result = await circleService.getUSDCBalance(walletId);
        break;
      case 'transactions':
        result = await circleService.getWalletTransactions(walletId);
        break;
      case 'info':
      default:
        result = await circleService.getWallet(walletId);
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch wallet data',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, walletId, name, destinationAddress, amount } = body;

    let result;

    switch (action) {
      case 'create':
        result = await circleService.createWallet(name);
        break;

      case 'transfer':
        if (!walletId || !destinationAddress || !amount) {
          return NextResponse.json(
            {
              success: false,
              error: 'Wallet ID, destination address, and amount are required for transfer',
            },
            { status: 400 }
          );
        }
        result = await circleService.transferUSDC(walletId, destinationAddress, amount);
        break;

      case 'auto-topup':
        const { cardAddress, thresholdAmount, topUpAmount } = body;
        if (!walletId || !cardAddress || !thresholdAmount || !topUpAmount) {
          return NextResponse.json(
            {
              success: false,
              error: 'Wallet ID, card address, threshold amount, and top-up amount are required',
            },
            { status: 400 }
          );
        }
        result = await circleService.autoTopUpCard(
          walletId,
          cardAddress,
          thresholdAmount,
          topUpAmount
        );
        break;

      case 'estimate-fee':
        if (!walletId || !destinationAddress || !amount) {
          return NextResponse.json(
            {
              success: false,
              error: 'Wallet ID, destination address, and amount are required for fee estimation',
            },
            { status: 400 }
          );
        }
        result = await circleService.estimateTransferFee(walletId, destinationAddress, amount);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error executing wallet action:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute wallet action',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transaction ID is required',
        },
        { status: 400 }
      );
    }

    const transactionStatus = await circleService.getTransactionStatus(transactionId);

    return NextResponse.json({
      success: true,
      data: transactionStatus,
    });
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check transaction status',
      },
      { status: 500 }
    );
  }
}
