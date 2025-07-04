'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useUSDCBalance } from '@/hooks/useVault';
import { getContractAddresses } from '@/lib/web3-config';
import { Wallet, ExternalLink, RefreshCw, Info, AlertCircle, ArrowLeft } from 'lucide-react';
import { sepolia, polygonMumbai } from 'wagmi/chains';
import Link from 'next/link';

export function TestnetUSDCDashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const usdcBalance = useUSDCBalance();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { usdc: usdcAddress } = getContractAddresses(chainId);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await usdcBalance.refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getSupportedTestnets = () => [
    {
      id: sepolia.id,
      name: 'Sepolia',
      faucetUrl: 'https://faucet.circle.com/',
      explorerUrl: 'https://sepolia.etherscan.io',
      usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    },
    {
      id: polygonMumbai.id,
      name: 'Polygon Mumbai',
      faucetUrl: 'https://faucet.circle.com/',
      explorerUrl: 'https://mumbai.polygonscan.com',
      usdcAddress: '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23',
    },
  ];

  const getCurrentTestnet = () => {
    return getSupportedTestnets().find(testnet => testnet.id === chainId);
  };

  const isOnSupportedTestnet = () => {
    return getSupportedTestnets().some(testnet => testnet.id === chainId);
  };

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5" />
            Testnet USDC Dashboard
          </CardTitle>
          <CardDescription>
            Connect your wallet to check your testnet USDC balance
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Testnet USDC Faucet
            </span>
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Get testnet USDC to test the CardFi platform functionality
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            Network Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Current Network:</span>
            <Badge variant={isOnSupportedTestnet() ? "default" : "destructive"}>
              {getCurrentTestnet()?.name || `Chain ID: ${chainId}`}
            </Badge>
          </div>
          
          {!isOnSupportedTestnet() && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-yellow-800 font-medium">
                    Switch to a supported testnet
                  </p>
                  <p className="text-sm text-yellow-700">
                    To test USDC functionality, please switch to one of the supported testnets.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => switchChain({ chainId: sepolia.id })}
                    >
                      Switch to Sepolia
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => switchChain({ chainId: polygonMumbai.id })}
                    >
                      Switch to Mumbai
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* USDC Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">USDC Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {parseFloat(usdcBalance.balance).toFixed(2)} USDC
          </div>
          <p className="text-xs text-muted-foreground">
            Testnet USDC available for testing
          </p>
          {isOnSupportedTestnet() && (
            <div className="mt-2 text-xs text-muted-foreground">
              Contract: <code className="bg-gray-100 px-1 rounded">{usdcAddress}</code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Get Testnet USDC */}
      {isOnSupportedTestnet() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Get Testnet USDC</CardTitle>
            <CardDescription>
              {parseFloat(usdcBalance.balance) === 0 
                ? "You need testnet USDC to test the platform. Get some from the faucet below."
                : "Need more testnet USDC? Get additional tokens from the faucet."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How to get testnet USDC:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Visit the Circle testnet faucet</li>
                <li>Connect your wallet (same address: {address?.slice(0, 6)}...{address?.slice(-4)})</li>
                <li>Request testnet USDC for {getCurrentTestnet()?.name}</li>
                <li>Wait for the transaction to confirm</li>
                <li>Refresh this page to see your balance</li>
              </ol>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => window.open(getCurrentTestnet()?.faucetUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open USDC Faucet
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open(`${getCurrentTestnet()?.explorerUrl}/address/${address}`, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View in Explorer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supported Networks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Supported Testnets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getSupportedTestnets().map((testnet) => (
              <div key={testnet.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{testnet.name}</p>
                  <p className="text-sm text-muted-foreground">
                    USDC: {testnet.usdcAddress.slice(0, 6)}...{testnet.usdcAddress.slice(-4)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {chainId === testnet.id && (
                    <Badge variant="default" className="text-xs">Current</Badge>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => switchChain({ chainId: testnet.id })}
                    disabled={chainId === testnet.id}
                  >
                    Switch
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
