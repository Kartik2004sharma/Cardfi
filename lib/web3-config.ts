import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, base, sepolia, localhost, polygonMumbai, bscTestnet, avalancheFuji } from 'wagmi/chains';
import { defineChain } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'CardFi Yield Manager',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo_project_id',
  chains: [mainnet, polygon, arbitrum, base, sepolia, polygonMumbai, bscTestnet, avalancheFuji, localhost],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

// Contract addresses for different networks
export const CONTRACT_ADDRESSES: Record<number, {
  strategyVault: `0x${string}`;
  usdc: `0x${string}`;
}> = {
  [mainnet.id]: {
    strategyVault: '0x0000000000000000000000000000000000000000', // Deploy your contract here
    usdc: '0xA0b86a33E6441e600D0aE5d5eE4c0e600d2c7857', // USDC on mainnet
  },
  [polygon.id]: {
    strategyVault: '0x0000000000000000000000000000000000000000', // Deploy your contract here
    usdc: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC on Polygon
  },
  [polygonMumbai.id]: {
    strategyVault: '0x0000000000000000000000000000000000000000', // Deploy your contract here
    usdc: '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23', // USDC on Polygon Mumbai testnet
  },
  [bscTestnet.id]: {
    strategyVault: '0x0000000000000000000000000000000000000000', // Deploy your contract here
    usdc: '0x64544969ed7EBf5f083679233325356EbE738930', // USDC on BSC Testnet
  },
  [avalancheFuji.id]: {
    strategyVault: '0x0000000000000000000000000000000000000000', // Deploy your contract here
    usdc: '0x5425890298aed601595a70AB815c96711a31Bc65', // USDC on Avalanche Fuji
  },
  [sepolia.id]: {
    strategyVault: '0x0000000000000000000000000000000000000000', // Deploy your contract here
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia (Circle's official testnet USDC)
  },
  [localhost.id]: {
    strategyVault: (process.env.NEXT_PUBLIC_LOCAL_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    usdc: (process.env.NEXT_PUBLIC_LOCAL_USDC_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  },
};

// Helper function to get contract addresses safely
export function getContractAddresses(chainId: number) {
  return CONTRACT_ADDRESSES[chainId] || {
    strategyVault: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    usdc: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  };
}

// ABI for the StrategyVault contract
export const STRATEGY_VAULT_ABI = [
  // Core vault functions
  {
    "inputs": [
      {"internalType": "uint256", "name": "_assets", "type": "uint256"},
      {"internalType": "address", "name": "_receiver", "type": "address"}
    ],
    "name": "deposit",
    "outputs": [{"internalType": "uint256", "name": "shares", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_assets", "type": "uint256"},
      {"internalType": "address", "name": "_receiver", "type": "address"},
      {"internalType": "address", "name": "_owner", "type": "address"}
    ],
    "name": "withdraw",
    "outputs": [{"internalType": "uint256", "name": "shares", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_shares", "type": "uint256"},
      {"internalType": "address", "name": "_receiver", "type": "address"},
      {"internalType": "address", "name": "_owner", "type": "address"}
    ],
    "name": "redeem",
    "outputs": [{"internalType": "uint256", "name": "assets", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // View functions
  {
    "inputs": [],
    "name": "totalAssets",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentAPY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVaultInfo",
    "outputs": [
      {"internalType": "uint256", "name": "_totalAssets", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalSupply", "type": "uint256"},
      {"internalType": "uint256", "name": "_sharePrice", "type": "uint256"},
      {"internalType": "uint256", "name": "_currentAPY", "type": "uint256"},
      {"internalType": "uint256", "name": "_performanceFee", "type": "uint256"},
      {"internalType": "uint256", "name": "_managementFee", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_assets", "type": "uint256"}],
    "name": "previewDeposit",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_assets", "type": "uint256"}],
    "name": "previewWithdraw",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_shares", "type": "uint256"}],
    "name": "previewRedeem",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_owner", "type": "address"}],
    "name": "maxWithdraw",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_owner", "type": "address"}],
    "name": "maxRedeem",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_assets", "type": "uint256"}],
    "name": "convertToShares",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_shares", "type": "uint256"}],
    "name": "convertToAssets",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "caller", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "assets", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "shares", "type": "uint256"}
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "caller", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "receiver", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "assets", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "shares", "type": "uint256"}
    ],
    "name": "Withdraw",
    "type": "event"
  }
] as const;

// USDC Token ABI (minimal)
export const USDC_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
