import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { useAccount, useChainId } from 'wagmi';
import { getContractAddresses, STRATEGY_VAULT_ABI, USDC_ABI } from '@/lib/web3-config';
import { formatUnits, parseUnits } from 'viem';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Hook for reading vault information
export function useVaultInfo() {
  const chainId = useChainId();
  const { strategyVault: vaultAddress } = getContractAddresses(chainId);

  const { data: vaultInfo, isLoading, refetch } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: STRATEGY_VAULT_ABI,
    functionName: 'getVaultInfo',
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  return {
    totalAssets: vaultInfo ? formatUnits(vaultInfo[0], 6) : '0', // USDC has 6 decimals
    totalSupply: vaultInfo ? formatUnits(vaultInfo[1], 18) : '0',
    sharePrice: vaultInfo ? formatUnits(vaultInfo[2], 18) : '1',
    currentAPY: vaultInfo ? Number(vaultInfo[3]) / 100 : 0, // Convert from basis points to percentage
    performanceFee: vaultInfo ? Number(vaultInfo[4]) / 100 : 0,
    managementFee: vaultInfo ? Number(vaultInfo[5]) / 100 : 0,
    isLoading,
    refetch,
  };
}

// Hook for user's vault balance
export function useUserVaultBalance() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { strategyVault: vaultAddress } = getContractAddresses(chainId);

  const { data: balance, isLoading, refetch } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: STRATEGY_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!vaultAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  return {
    balance: balance ? formatUnits(balance, 18) : '0',
    isLoading,
    refetch,
  };
}

// Hook for user's USDC balance
export function useUSDCBalance() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { usdc: usdcAddress } = getContractAddresses(chainId);

  const { data: balance, isLoading, refetch } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!usdcAddress,
      refetchInterval: 10000,
    },
  });

  return {
    balance: balance ? formatUnits(balance, 6) : '0',
    isLoading,
    refetch,
  };
}

// Hook for USDC allowance
export function useUSDCAllowance() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { usdc: usdcAddress, strategyVault: vaultAddress } = getContractAddresses(chainId);

  const { data: allowance, isLoading, refetch } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address && vaultAddress ? [address, vaultAddress] : undefined,
    query: {
      enabled: !!address && !!usdcAddress && !!vaultAddress,
    },
  });

  return {
    allowance: allowance ? formatUnits(allowance, 6) : '0',
    isLoading,
    refetch,
  };
}

// Hook for deposit preview
export function useDepositPreview(amount: string) {
  const chainId = useChainId();
  const { strategyVault: vaultAddress } = getContractAddresses(chainId);

  const { data: shares } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: STRATEGY_VAULT_ABI,
    functionName: 'previewDeposit',
    args: amount ? [parseUnits(amount, 6)] : undefined,
    query: {
      enabled: !!amount && !!vaultAddress && parseFloat(amount) > 0,
    },
  });

  return shares ? formatUnits(shares, 18) : '0';
}

// Hook for redeem preview
export function useRedeemPreview(shares: string) {
  const chainId = useChainId();
  const { strategyVault: vaultAddress } = getContractAddresses(chainId);

  const { data: assets } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: STRATEGY_VAULT_ABI,
    functionName: 'previewRedeem',
    args: shares ? [parseUnits(shares, 18)] : undefined,
    query: {
      enabled: !!shares && !!vaultAddress && parseFloat(shares) > 0,
    },
  });

  return assets ? formatUnits(assets, 6) : '0';
}

// Hook for writing contracts with transaction handling
export function useVaultOperations() {
  const { writeContract, isPending, error } = useWriteContract();
  const chainId = useChainId();
  const { usdc: usdcAddress, strategyVault: vaultAddress } = getContractAddresses(chainId);
  const { address } = useAccount();

  const approveUSDC = async (amount: string) => {
    if (!usdcAddress || !vaultAddress || !amount) return;

    const loadingToast = toast.loading('Approving USDC...');
    
    try {
      await writeContract({
        address: usdcAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [vaultAddress, parseUnits(amount, 6)],
      });
      
      toast.success('USDC approved successfully!', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to approve USDC', { id: loadingToast });
      throw err;
    }
  };

  const deposit = async (amount: string) => {
    if (!vaultAddress || !address || !amount) return;

    const loadingToast = toast.loading('Depositing USDC...');
    
    try {
      await writeContract({
        address: vaultAddress as `0x${string}`,
        abi: STRATEGY_VAULT_ABI,
        functionName: 'deposit',
        args: [parseUnits(amount, 6), address],
      });
      
      toast.success('Deposit successful!', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to deposit', { id: loadingToast });
      throw err;
    }
  };

  const redeem = async (shares: string) => {
    if (!vaultAddress || !address || !shares) return;

    const loadingToast = toast.loading('Withdrawing assets...');
    
    try {
      await writeContract({
        address: vaultAddress as `0x${string}`,
        abi: STRATEGY_VAULT_ABI,
        functionName: 'redeem',
        args: [parseUnits(shares, 18), address, address],
      });
      
      toast.success('Withdrawal successful!', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to withdraw', { id: loadingToast });
      throw err;
    }
  };

  return {
    approveUSDC,
    deposit,
    redeem,
    isPending,
    error,
  };
}

// Hook for real-time event listening
export function useVaultEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const chainId = useChainId();
  const { strategyVault: vaultAddress } = getContractAddresses(chainId);
  const { address } = useAccount();

  // Listen for deposit events
  useWatchContractEvent({
    address: vaultAddress as `0x${string}`,
    abi: STRATEGY_VAULT_ABI,
    eventName: 'Deposit',
    onLogs(logs) {
      const userDeposits = logs.filter(log => 
        log.args.caller?.toLowerCase() === address?.toLowerCase() ||
        log.args.owner?.toLowerCase() === address?.toLowerCase()
      );
      
      userDeposits.forEach(log => {
        toast.success(`Deposit confirmed: ${formatUnits(log.args.assets || BigInt(0), 6)} USDC`);
        setEvents(prev => [...prev, {
          type: 'deposit',
          amount: formatUnits(log.args.assets || BigInt(0), 6),
          shares: formatUnits(log.args.shares || BigInt(0), 18),
          timestamp: Date.now(),
          txHash: log.transactionHash,
        }]);
      });
    },
  });

  // Listen for withdraw events
  useWatchContractEvent({
    address: vaultAddress as `0x${string}`,
    abi: STRATEGY_VAULT_ABI,
    eventName: 'Withdraw',
    onLogs(logs) {
      const userWithdrawals = logs.filter(log => 
        log.args.caller?.toLowerCase() === address?.toLowerCase() ||
        log.args.owner?.toLowerCase() === address?.toLowerCase()
      );
      
      userWithdrawals.forEach(log => {
        toast.success(`Withdrawal confirmed: ${formatUnits(log.args.assets || BigInt(0), 6)} USDC`);
        setEvents(prev => [...prev, {
          type: 'withdraw',
          amount: formatUnits(log.args.assets || BigInt(0), 6),
          shares: formatUnits(log.args.shares || BigInt(0), 18),
          timestamp: Date.now(),
          txHash: log.transactionHash,
        }]);
      });
    },
  });

  return { events };
}
