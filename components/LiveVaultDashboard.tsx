'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  useVaultInfo, 
  useUserVaultBalance, 
  useUSDCBalance, 
  useUSDCAllowance,
  useDepositPreview,
  useRedeemPreview,
  useVaultOperations,
  useVaultEvents
} from '@/hooks/useVault';
import { useDemoVaultData } from '@/hooks/useDemoVault';
import { useAccount, useChainId } from 'wagmi';
import { getContractAddresses } from '@/lib/web3-config';
import { Wallet, TrendingUp, DollarSign, PieChart, Activity, ArrowUpRight, ArrowDownRight, ExternalLink, Info } from 'lucide-react';
import { CustomConnectButton } from '@/components/CustomConnectButton';
import { MetaMaskCardDashboard } from '@/components/MetaMaskCardDashboard';
import { EnhancedMetaMaskStatus } from '@/components/EnhancedMetaMaskStatus';
import Link from 'next/link';
import toast from 'react-hot-toast';

export function LiveVaultDashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');

  // Hooks for live data
  const vaultInfo = useVaultInfo();
  const userBalance = useUserVaultBalance();
  const usdcBalance = useUSDCBalance();
  const usdcAllowance = useUSDCAllowance();
  const depositPreview = useDepositPreview(depositAmount);
  const redeemPreview = useRedeemPreview(withdrawShares);
  const { approveUSDC, deposit, redeem, isPending } = useVaultOperations();
  const { events } = useVaultEvents();

  // Demo vault data for testnets
  const { isTestnetDemo, demoVaultInfo, demoDeposit, demoWithdraw } = useDemoVaultData();

  const { strategyVault: vaultAddress } = getContractAddresses(chainId);
  const needsApproval = parseFloat(usdcAllowance.allowance) < parseFloat(depositAmount || '0');

  // Choose between real vault data or demo data
  const displayVaultInfo = isTestnetDemo ? demoVaultInfo : vaultInfo;
  const displayUserBalance = isTestnetDemo ? demoVaultInfo.userBalance : userBalance.balance;

  // Demo deposit handler
  const handleDemoDeposit = async () => {
    if (!depositAmount) return;
    
    const success = demoDeposit(depositAmount);
    if (success) {
      toast.success(`Deposited ${depositAmount} USDC to demo vault!`);
      setDepositAmount('');
      await usdcBalance.refetch(); // Refresh USDC balance
    } else {
      toast.error('Insufficient USDC balance or invalid amount');
    }
  };

  // Demo withdraw handler
  const handleDemoWithdraw = async () => {
    if (!withdrawShares) return;
    
    const success = demoWithdraw(withdrawShares);
    if (success) {
      const usdcValue = (parseFloat(withdrawShares) * 1.0234).toFixed(2);
      toast.success(`Withdrew ${withdrawShares} shares for ~${usdcValue} USDC!`);
      setWithdrawShares('');
      await usdcBalance.refetch(); // Refresh USDC balance
    } else {
      toast.error('Insufficient shares or invalid amount');
    }
  };

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="w-6 h-6" />
            Connect Your Wallet
          </CardTitle>
          <CardDescription>
            Connect your wallet to start earning yield on your USDC
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <CustomConnectButton />
        </CardContent>
      </Card>
    );
  }

  if (!vaultAddress && !isTestnetDemo) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-500">Network Not Supported</CardTitle>
          <CardDescription>
            Please switch to a supported network (Mainnet, Polygon, or Sepolia)
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced MetaMask Status */}
      <EnhancedMetaMaskStatus />

      {/* Demo Mode Notice */}
      {isTestnetDemo && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Demo Mode Active</p>
                <p className="text-sm text-blue-700">
                  You're using testnet USDC. Vault operations are simulated until contracts are deployed.
                  <Link href="/dashboard/faucet" className="text-blue-600 hover:text-blue-800 ml-1">
                    Need testnet USDC? →
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vault Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(displayVaultInfo.totalAssets).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              USDC in vault
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {displayVaultInfo.currentAPY.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Annual percentage yield
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(displayUserBalance).toFixed(4)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isTestnetDemo && parseFloat(displayUserBalance) > 0 
                ? `~$${demoVaultInfo.userBalanceUSD} USD value`
                : "Vault tokens"
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">USDC Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(usdcBalance.balance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available to deposit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MetaMask Card Integration */}
      <MetaMaskCardDashboard />

      {/* Deposit and Withdraw Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-green-500" />
              Deposit USDC
            </CardTitle>
            <CardDescription>
              Stake your USDC to start earning yield
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Amount (USDC)</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <div className="text-sm text-muted-foreground">
                Available: {parseFloat(usdcBalance.balance).toFixed(2)} USDC
                {parseFloat(usdcBalance.balance) < 5 && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-xs">
                      {parseFloat(usdcBalance.balance) === 0 
                        ? "Need testnet USDC?"
                        : "Need more testnet USDC?"
                      }
                      <Link href="/dashboard/faucet" className="text-blue-600 hover:text-blue-800 ml-1 inline-flex items-center gap-1">
                        Visit our faucet <ExternalLink className="h-3 w-3" />
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {depositAmount && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <div>You will receive: <span className="font-medium">{parseFloat(depositPreview).toFixed(4)} vault tokens</span></div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {isTestnetDemo ? (
                <Button 
                  onClick={handleDemoDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) > parseFloat(usdcBalance.balance)}
                  className="w-full"
                >
                  Demo Deposit
                </Button>
              ) : needsApproval && depositAmount ? (
                <Button 
                  onClick={() => approveUSDC(depositAmount)}
                  disabled={isPending || !depositAmount}
                  className="w-full"
                >
                  {isPending ? 'Approving...' : `Approve ${depositAmount} USDC`}
                </Button>
              ) : (
                <Button 
                  onClick={() => deposit(depositAmount)}
                  disabled={isPending || !depositAmount || needsApproval}
                  className="w-full"
                >
                  {isPending ? 'Depositing...' : 'Deposit'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Withdraw Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-orange-500" />
              Withdraw
            </CardTitle>
            <CardDescription>
              Redeem your vault tokens for USDC
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-shares">Shares to Redeem</Label>
              <Input
                id="withdraw-shares"
                type="number"
                placeholder="0.00"
                value={withdrawShares}
                onChange={(e) => setWithdrawShares(e.target.value)}
              />
              <div className="text-sm text-muted-foreground">
                Available: {parseFloat(displayUserBalance).toFixed(4)} shares
              </div>
            </div>

            {withdrawShares && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <div>You will receive: <span className="font-medium">
                    {isTestnetDemo 
                      ? (parseFloat(withdrawShares) * 1.0234).toFixed(2)
                      : parseFloat(redeemPreview).toFixed(2)
                    } USDC</span></div>
                </div>
              </div>
            )}

            <Button 
              onClick={isTestnetDemo ? handleDemoWithdraw : () => redeem(withdrawShares)}
              disabled={isPending || !withdrawShares}
              className="w-full"
              variant="outline"
            >
              {isPending ? 'Withdrawing...' : isTestnetDemo ? 'Demo Withdraw' : 'Withdraw'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Vault Information */}
      <Card>
        <CardHeader>
          <CardTitle>Vault Information</CardTitle>
          <CardDescription>Real-time vault statistics and fees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Share Price</div>
              <div className="text-lg font-semibold">${parseFloat(displayVaultInfo.sharePrice).toFixed(6)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Performance Fee</div>
              <div className="text-lg font-semibold">{displayVaultInfo.performanceFee.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Management Fee</div>
              <div className="text-lg font-semibold">{displayVaultInfo.managementFee.toFixed(2)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {events.slice(0, 5).map((event, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    {event.type === 'deposit' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-orange-500" />
                    )}
                    <span className="capitalize">{event.type}</span>
                    <Badge variant="secondary">
                      {parseFloat(event.amount).toFixed(2)} USDC
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
