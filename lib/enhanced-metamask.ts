'use client';

import { MetaMaskSDK, MetaMaskSDKOptions } from '@metamask/sdk';

interface CardActivity {
  id: string;
  amount: number;
  currency: string;
  merchant: string;
  category: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

interface DelegatePermissions {
  canSign: boolean;
  canSpend: boolean;
  maxAmount: string;
  expiration: Date;
}

class EnhancedMetaMaskService {
  private sdk: MetaMaskSDK | null = null;
  private isInitialized = false;
  private delegates: Map<string, DelegatePermissions> = new Map();

  // Get the current provider (either from window.ethereum or SDK)
  private getProvider() {
    // First try to use the existing window.ethereum provider (used by Wagmi)
    if (typeof window !== 'undefined' && window.ethereum) {
      return window.ethereum;
    }
    
    // Fallback to SDK provider
    return this.sdk?.getProvider();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // If window.ethereum exists, we don't need to initialize SDK
    if (typeof window !== 'undefined' && window.ethereum) {
      console.log('Using existing MetaMask provider from window.ethereum');
      this.isInitialized = true;
      this.setupEventListeners();
      return;
    }

    // Only initialize SDK if window.ethereum is not available
    const options: MetaMaskSDKOptions = {
      dappMetadata: {
        name: 'CardFi Yield Manager',
        url: typeof window !== 'undefined' ? window.location.href : 'https://cardfi.app',
        iconUrl: 'https://cardfi.app/icon.png',
      },
      // Enable all MetaMask features including card integration
      extensionOnly: false,
      preferDesktop: true,
      openDeeplink: (link: string) => {
        if (typeof window !== 'undefined') {
          window.open(link, '_blank');
        }
      },
      checkInstallationImmediately: false,
      checkInstallationOnAllCalls: true,
      logging: {
        developerMode: process.env.NODE_ENV === 'development',
        sdk: process.env.NODE_ENV === 'development',
      },
    };

    this.sdk = new MetaMaskSDK(options);
    this.isInitialized = true;

    // Set up event listeners for account and network changes
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const provider = this.getProvider();
    if (!provider) return;

    // Listen for account changes
    provider.on('accountsChanged', (...args: unknown[]) => {
      const accounts = args[0] as string[];
      console.log('MetaMask accounts changed:', accounts);
      // Emit custom event for the app to handle
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('metamask:accountsChanged', { 
          detail: { accounts }
        }));
      }
    });

    // Listen for network changes
    provider.on('chainChanged', (...args: unknown[]) => {
      const chainId = args[0] as string;
      console.log('MetaMask chain changed:', chainId);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('metamask:chainChanged', { 
          detail: { chainId }
        }));
      }
    });

    // Listen for connection status
    provider.on('connect', (connectInfo: any) => {
      console.log('MetaMask connected:', connectInfo);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('metamask:connected', { 
          detail: connectInfo 
        }));
      }
    });

    // Listen for disconnection
    provider.on('disconnect', (error: any) => {
      console.log('MetaMask disconnected:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('metamask:disconnected', { 
          detail: error 
        }));
      }
    });
  }

  async connect(): Promise<string[]> {
    if (!this.sdk) {
      throw new Error('MetaMask SDK not initialized. Call initialize() first.');
    }

    try {
      // Use SDK's connect method which handles installation prompts
      const accounts = await this.sdk.connect();
      return accounts as string[];
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      throw new Error('Failed to connect to MetaMask');
    }
  }

  async signTransaction(transaction: any): Promise<string> {
    if (!this.sdk?.getProvider()) {
      throw new Error('MetaMask not connected');
    }

    const provider = this.sdk.getProvider();
    
    try {
      const txHash = await provider!.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      });

      return txHash as string;
    } catch (error) {
      console.error('Transaction signing failed:', error);
      throw error;
    }
  }

  // Delegation Toolkit functionality
  async createDelegate(
    delegateAddress: string, 
    permissions: DelegatePermissions
  ): Promise<void> {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error('MetaMask SDK not available');
    }

    try {
      // Check if we have connected accounts
      const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
      if (!accounts || accounts.length === 0) {
        throw new Error('MetaMask not connected - please connect your wallet first');
      }

      // Store delegate permissions
      this.delegates.set(delegateAddress, permissions);

      // In a real implementation, this would interact with MetaMask's Delegation Toolkit
      console.log('Delegate created:', { delegateAddress, permissions });
    } catch (error: any) {
      if (error.message.includes('not connected')) {
        throw error;
      }
      throw new Error('Failed to create delegate: ' + error.message);
    }
  }

  async revokeDelegate(delegateAddress: string): Promise<void> {
    this.delegates.delete(delegateAddress);
    console.log('Delegate revoked:', delegateAddress);
  }

  async signWithDelegate(
    delegateAddress: string, 
    transaction: any
  ): Promise<string> {
    const permissions = this.delegates.get(delegateAddress);
    if (!permissions) {
      throw new Error('Delegate not found or permissions revoked');
    }

    if (!permissions.canSign) {
      throw new Error('Delegate does not have signing permissions');
    }

    // Check amount limits
    const txAmount = parseFloat(transaction.value || '0');
    const maxAmount = parseFloat(permissions.maxAmount);
    if (txAmount > maxAmount) {
      throw new Error('Transaction amount exceeds delegate limit');
    }

    // Check expiration
    if (new Date() > permissions.expiration) {
      throw new Error('Delegate permissions have expired');
    }

    return this.signTransaction(transaction);
  }

  // MetaMask Card integration
  async getCardActivity(address: string): Promise<CardActivity[]> {
    // TODO: Replace with actual MetaMask Card API when available
    // For now, return mock data that demonstrates the structure
    const mockActivity: CardActivity[] = [
      {
        id: 'tx_1',
        amount: 25.99,
        currency: 'USD',
        merchant: 'Coffee Shop',
        category: 'Food & Dining',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        status: 'completed'
      },
      {
        id: 'tx_2',
        amount: 89.50,
        currency: 'USD',
        merchant: 'Gas Station',
        category: 'Transportation',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        status: 'completed'
      },
      {
        id: 'tx_3',
        amount: 12.75,
        currency: 'USD',
        merchant: 'Streaming Service',
        category: 'Entertainment',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        status: 'completed'
      }
    ];

    return mockActivity;
  }

  async getCardSpendingAnalytics(address: string): Promise<{
    totalSpent: number;
    averageTransaction: number;
    categoryBreakdown: Record<string, number>;
    lastActivityDate: Date;
    yieldEarned: number;
  }> {
    const activities = await this.getCardActivity(address);
    
    const totalSpent = activities.reduce((sum, activity) => sum + activity.amount, 0);
    const averageTransaction = activities.length > 0 ? totalSpent / activities.length : 0;
    
    const categoryBreakdown: Record<string, number> = {};
    activities.forEach(activity => {
      categoryBreakdown[activity.category] = 
        (categoryBreakdown[activity.category] || 0) + activity.amount;
    });

    const lastActivityDate = activities.length > 0 
      ? activities[0].timestamp 
      : new Date();

    // Calculate estimated yield earned based on spending
    const yieldEarned = totalSpent * 0.025; // 2.5% yield simulation

    return {
      totalSpent,
      averageTransaction,
      categoryBreakdown,
      lastActivityDate,
      yieldEarned
    };
  }

  async switchNetwork(chainId: string): Promise<void> {
    if (!this.sdk?.getProvider()) {
      throw new Error('MetaMask not connected');
    }

    const provider = this.sdk.getProvider();
    
    try {
      await provider!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError: any) {
      // Network not added to MetaMask
      if (switchError.code === 4902) {
        throw new Error(`Network ${chainId} not added to MetaMask`);
      }
      throw switchError;
    }
  }

  async addNetwork(networkConfig: {
    chainId: string;
    chainName: string;
    rpcUrls: string[];
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    blockExplorerUrls: string[];
  }): Promise<void> {
    if (!this.sdk?.getProvider()) {
      throw new Error('MetaMask not connected');
    }

    const provider = this.sdk.getProvider();
    
    await provider!.request({
      method: 'wallet_addEthereumChain',
      params: [networkConfig],
    });
  }

  async isConnected(): Promise<boolean> {
    try {
      const provider = this.getProvider();
      if (!provider) return false;
      
      const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
      return accounts && accounts.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Synchronous version for quick checks (less reliable)
  isProviderAvailable(): boolean {
    const provider = this.getProvider();
    return provider?.isConnected?.() || false;
  }

  isInstalled(): boolean {
    // First check for window.ethereum (most common case)
    if (typeof window !== 'undefined' && window.ethereum) {
      // Check if it's MetaMask specifically
      return window.ethereum.isMetaMask === true;
    }
    
    // Fallback to SDK check
    return this.sdk?.isExtensionActive() || false;
  }

  async getAccounts(): Promise<string[]> {
    try {
      const provider = this.getProvider();
      if (!provider) {
        return [];
      }

      const accounts = await provider.request({
        method: 'eth_accounts',
        params: [],
      });

      return accounts as string[];
    } catch (error) {
      console.error('Error getting accounts:', error);
      return [];
    }
  }

  async disconnect(): Promise<void> {
    if (this.sdk) {
      await this.sdk.terminate();
      this.sdk = null;
      this.isInitialized = false;
    }
  }

  // Get SDK instance for advanced usage
  getSDK(): MetaMaskSDK | null {
    return this.sdk;
  }
}

// Export singleton instance
export const enhancedMetaMaskService = new EnhancedMetaMaskService();
export default enhancedMetaMaskService;
