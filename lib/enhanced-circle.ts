import axios from 'axios';

export interface CircleWallet {
  walletId: string;
  blockchain: string;
  address: string;
  state: 'LIVE' | 'FROZEN';
  name?: string;
  custodyType?: 'DEVELOPER' | 'END_USER';
}

export interface CircleBalance {
  tokenId: string;
  amount: string;
  symbol: string;
  decimals?: number;
}

export interface CircleTransaction {
  id: string;
  blockchain: string;
  tokenId: string;
  walletId: string;
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
  state: 'INITIATED' | 'PENDING_RISK_SCREENING' | 'DENIED' | 'QUEUED' | 'SENT' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';
  txHash?: string;
  createDate: string;
  updateDate: string;
  estimatedFee?: {
    gasLimit: string;
    baseFee: string;
    priorityFee: string;
  };
}

export interface CircleTransferRequest {
  destinationAddress: string;
  amount: string;
  tokenId?: string;
  fee?: {
    type: 'level' | 'unit';
    config: {
      feeLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
      gasLimit?: string;
      gasPrice?: string;
    };
  };
}

class CircleService {
  private apiKey: string;
  private baseUrl: string;
  private isTestnet: boolean;

  constructor() {
    this.apiKey = process.env.CIRCLE_API_KEY || process.env.NEXT_PUBLIC_CIRCLE_API_KEY || '';
    this.baseUrl = process.env.CIRCLE_API_URL || 'https://api.circle.com/v1';
    this.isTestnet = process.env.CIRCLE_ENVIRONMENT === 'sandbox';
    
    // Use sandbox URL for testing
    if (this.isTestnet) {
      this.baseUrl = 'https://api-sandbox.circle.com/v1';
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-User-Agent': 'CardFi-Yield-Manager/1.0.0',
    };
  }

  async createWallet(name?: string): Promise<CircleWallet> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/w3s/wallets`,
        {
          blockchains: ['ETH', 'MATIC-AMOY'],
          name: name || 'CardFi Wallet',
          description: 'Automated yield management wallet created by CardFi',
        },
        { headers: this.getHeaders() }
      );

      return response.data.data.wallet;
    } catch (error: any) {
      console.error('Error creating Circle wallet:', error?.response?.data || error);
      
      if (error?.response?.status === 401) {
        throw new Error('Invalid Circle API key');
      } else if (error?.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later');
      }
      
      throw new Error('Failed to create Circle wallet');
    }
  }

  async getWallet(walletId: string): Promise<CircleWallet> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/w3s/wallets/${walletId}`,
        { headers: this.getHeaders() }
      );

      return response.data.data.wallet;
    } catch (error: any) {
      console.error('Error fetching Circle wallet:', error?.response?.data || error);
      throw new Error('Failed to fetch Circle wallet');
    }
  }

  async getWalletBalance(walletId: string): Promise<CircleBalance[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/w3s/wallets/${walletId}/balances`,
        { headers: this.getHeaders() }
      );

      return response.data.data.tokenBalances || [];
    } catch (error: any) {
      console.error('Error fetching wallet balance:', error?.response?.data || error);
      throw new Error('Failed to fetch wallet balance');
    }
  }

  async getUSDCBalance(walletId: string): Promise<number> {
    try {
      const balances = await this.getWalletBalance(walletId);
      const usdcBalance = balances.find(balance => 
        balance.symbol.toUpperCase() === 'USDC'
      );
      
      return usdcBalance ? parseFloat(usdcBalance.amount) : 0;
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
      return 0;
    }
  }

  async transferUSDC(
    walletId: string,
    destinationAddress: string,
    amount: string
  ): Promise<CircleTransaction> {
    try {
      const transferRequest: CircleTransferRequest = {
        destinationAddress,
        amount,
        tokenId: this.isTestnet ? 'USDC-TEST' : 'USDC',
        fee: {
          type: 'level',
          config: {
            feeLevel: 'MEDIUM'
          }
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/w3s/wallets/${walletId}/transactions`,
        transferRequest,
        { headers: this.getHeaders() }
      );

      return response.data.data.transaction;
    } catch (error: any) {
      console.error('Error transferring USDC:', error?.response?.data || error);
      throw new Error('Failed to transfer USDC');
    }
  }

  async getTransactionStatus(transactionId: string): Promise<CircleTransaction> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/w3s/transactions/${transactionId}`,
        { headers: this.getHeaders() }
      );

      return response.data.data.transaction;
    } catch (error: any) {
      console.error('Error fetching transaction status:', error?.response?.data || error);
      throw new Error('Failed to fetch transaction status');
    }
  }

  async estimateTransferFee(
    walletId: string,
    destinationAddress: string,
    amount: string
  ): Promise<CircleTransaction | null> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/w3s/wallets/${walletId}/transactions/estimate`,
        {
          destinationAddress,
          amount,
          tokenId: this.isTestnet ? 'USDC-TEST' : 'USDC',
        },
        { headers: this.getHeaders() }
      );

      return response.data.data.transaction;
    } catch (error: any) {
      console.error('Error estimating transfer fee:', error?.response?.data || error);
      return null;
    }
  }

  async getWalletTransactions(walletId: string): Promise<CircleTransaction[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/w3s/wallets/${walletId}/transactions`,
        { 
          headers: this.getHeaders(),
          params: {
            pageSize: 50,
            orderBy: 'createDate',
            direction: 'desc'
          }
        }
      );

      return response.data.data.transactions || [];
    } catch (error: any) {
      console.error('Error fetching wallet transactions:', error?.response?.data || error);
      return [];
    }
  }

  async autoTopUpCard(
    walletId: string,
    cardId: string,
    amount: string,
    threshold: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/cards/${cardId}/topup`,
        {
          walletId,
          amount,
          threshold,
          autoTopUp: true
        },
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error setting up auto top-up:', error?.response?.data || error);
      throw new Error('Failed to set up auto top-up');
    }
  }

  async createProgrammableWallet(
    userAddress: string,
    permissions: {
      canTransfer: boolean;
      dailyLimit: string;
      monthlyLimit: string;
      allowedTokens: string[];
    }
  ): Promise<CircleWallet> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/w3s/developer/wallets`,
        {
          blockchains: ['ETH', 'MATIC'],
          name: `CardFi Programmable Wallet for ${userAddress}`,
          description: 'Programmable wallet with automated yield management',
          permissions,
          userAddress
        },
        { headers: this.getHeaders() }
      );

      return response.data.data.wallet;
    } catch (error: any) {
      console.error('Error creating programmable wallet:', error?.response?.data || error);
      throw new Error('Failed to create programmable wallet');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/ping`,
        { headers: this.getHeaders() }
      );
      
      return response.status === 200;
    } catch (error) {
      console.error('Circle API health check failed:', error);
      return false;
    }
  }

  getConfig() {
    return {
      apiKey: this.apiKey ? '***' + this.apiKey.slice(-4) : 'Not configured',
      baseUrl: this.baseUrl,
      isTestnet: this.isTestnet,
      isConfigured: !!this.apiKey
    };
  }
}

export const circleService = new CircleService();
export default circleService;
