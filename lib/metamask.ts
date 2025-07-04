import { MetaMaskSDK } from '@metamask/sdk';

class MetaMaskService {
  private sdk: MetaMaskSDK | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    this.sdk = new MetaMaskSDK({
      dappMetadata: {
        name: 'CardFi Yield Manager',
        url: window.location.href,
      },
      // Enable card features
      extensionOnly: false,
    });

    this.isInitialized = true;
  }

  async connect(): Promise<string[]> {
    if (!this.sdk) {
      throw new Error('MetaMask SDK not initialized');
    }

    const accounts = await this.sdk.connect();
    return accounts as string[];
  }

  async getCardActivity(address: string): Promise<any[]> {
    // TODO: Implement MetaMask Card activity tracking
    // This would integrate with MetaMask's card API when available
    return [];
  }

  async getBalance(address: string): Promise<string> {
    if (!this.sdk?.getProvider()) {
      throw new Error('MetaMask not connected');
    }

    const provider = this.sdk.getProvider();
    if (!provider) {
      throw new Error('MetaMask provider not available');
    }

    const balance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });

    return balance as string;
  }

  async switchToNetwork(chainId: string): Promise<void> {
    if (!this.sdk?.getProvider()) {
      throw new Error('MetaMask not connected');
    }

    const provider = this.sdk.getProvider();
    if (!provider) {
      throw new Error('MetaMask provider not available');
    }
    
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        throw new Error('Network not added to MetaMask');
      }
      throw switchError;
    }
  }

  async signTransaction(transactionConfig: any): Promise<string> {
    if (!this.sdk?.getProvider()) {
      throw new Error('MetaMask not connected');
    }

    const provider = this.sdk.getProvider();
    if (!provider) {
      throw new Error('MetaMask provider not available');
    }

    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [transactionConfig],
    });

    return txHash as string;
  }

  async getCardSpendingAnalytics(address: string): Promise<{
    totalSpent: number;
    averageTransaction: number;
    categoryBreakdown: Record<string, number>;
    lastActivityDate: Date;
  }> {
    // TODO: Implement card spending analytics
    // This would fetch data from MetaMask Card API
    return {
      totalSpent: 0,
      averageTransaction: 0,
      categoryBreakdown: {},
      lastActivityDate: new Date(),
    };
  }

  isConnected(): boolean {
    return this.sdk?.getProvider() != null && this.isInitialized;
  }

  async disconnect(): Promise<void> {
    if (this.sdk) {
      await this.sdk.terminate();
      this.isInitialized = false;
      this.sdk = null;
    }
  }
}

export const metaMaskService = new MetaMaskService();
export default metaMaskService;
