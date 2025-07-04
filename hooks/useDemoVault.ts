import { useAccount, useChainId } from 'wagmi';
import { useUSDCBalance } from './useVault';
import { useState, useEffect } from 'react';

// Demo vault data for testnets when contracts aren't deployed
export function useDemoVaultData() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const usdcBalance = useUSDCBalance();
  const [demoDeposits, setDemoDeposits] = useState<number>(0);

  // Check if we're on a testnet and contracts aren't deployed
  const isTestnetDemo = chainId === 11155111 || chainId === 80001; // Sepolia or Mumbai
  
  // Load demo deposits from localStorage
  useEffect(() => {
    if (isConnected && address) {
      const saved = localStorage.getItem(`cardfi_demo_deposits_${address}_${chainId}`);
      if (saved) {
        setDemoDeposits(parseFloat(saved));
      }
    }
  }, [address, chainId, isConnected]);

  // Save demo deposits to localStorage
  const saveDemoDeposits = (amount: number) => {
    if (address) {
      localStorage.setItem(`cardfi_demo_deposits_${address}_${chainId}`, amount.toString());
      setDemoDeposits(amount);
    }
  };

  // Simulate realistic vault data
  const getDemoVaultInfo = () => {
    const userUSDC = parseFloat(usdcBalance.balance);
    const totalDeposited = demoDeposits;
    
    // Simulate total vault assets (user deposits + some simulated community deposits)
    const communityDeposits = Math.max(1000, totalDeposited * 5); // At least $1000 in the vault
    const totalAssets = totalDeposited + communityDeposits;
    
    // Simulate APY based on vault size (larger vaults = lower APY, more realistic)
    const baseAPY = 8.5;
    const sizeMultiplier = Math.max(0.5, 1 - (totalAssets / 50000)); // APY decreases as vault grows
    const currentAPY = baseAPY * sizeMultiplier;
    
    return {
      totalAssets: totalAssets.toFixed(2),
      totalSupply: (totalAssets * 0.95).toFixed(4), // Slightly less supply than assets (typical for vaults)
      sharePrice: '1.0234', // Slightly above 1 to show yield accrual
      currentAPY: currentAPY,
      performanceFee: 2,
      managementFee: 0.5,
      userBalance: totalDeposited > 0 ? (totalDeposited * 0.98).toFixed(4) : '0.0000', // Vault tokens
      userBalanceUSD: totalDeposited > 0 ? (totalDeposited * 1.0234).toFixed(2) : '0.00', // USD value with yield
    };
  };

  // Demo operations
  const demoDeposit = (amount: string) => {
    const depositAmount = parseFloat(amount);
    if (depositAmount > 0 && depositAmount <= parseFloat(usdcBalance.balance)) {
      const newTotal = demoDeposits + depositAmount;
      saveDemoDeposits(newTotal);
      return true;
    }
    return false;
  };

  const demoWithdraw = (shares: string) => {
    const shareAmount = parseFloat(shares);
    const maxShares = parseFloat(getDemoVaultInfo().userBalance);
    if (shareAmount > 0 && shareAmount <= maxShares) {
      // Convert shares back to USDC (with some yield)
      const usdcValue = shareAmount * 1.0234; // Share price
      const newTotal = Math.max(0, demoDeposits - usdcValue);
      saveDemoDeposits(newTotal);
      return true;
    }
    return false;
  };

  return {
    isTestnetDemo: isTestnetDemo && !isConnected ? false : isTestnetDemo,
    demoVaultInfo: getDemoVaultInfo(),
    demoDeposit,
    demoWithdraw,
    demoDeposits,
  };
}
