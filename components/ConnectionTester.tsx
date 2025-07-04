'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { enhancedMetaMaskService } from '@/lib/enhanced-metamask';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export function ConnectionTester() {
  const { address, isConnected: wagmiConnected } = useAccount();
  const [enhancedConnected, setEnhancedConnected] = useState<boolean | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const [lastTest, setLastTest] = useState<string>('');

  const checkConnections = async () => {
    setTesting(true);
    try {
      const connected = await enhancedMetaMaskService.isConnected();
      const accountList = await enhancedMetaMaskService.getAccounts();
      
      setEnhancedConnected(connected);
      setAccounts(accountList);
      setLastTest(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Connection test failed:', error);
      setEnhancedConnected(false);
      setAccounts([]);
    }
    setTesting(false);
  };

  const testDelegation = async () => {
    if (!enhancedConnected) {
      alert('MetaMask not connected. Please connect your wallet first.');
      return;
    }

    try {
      await enhancedMetaMaskService.createDelegate('0x456', {
        canSign: true,
        canSpend: true,
        maxAmount: '1000',
        expiration: new Date(Date.now() + 86400000)
      });
      alert('✅ Delegation test successful!');
    } catch (error: any) {
      alert(`❌ Delegation test failed: ${error.message}`);
    }
  };

  useEffect(() => {
    checkConnections();
  }, [wagmiConnected, address]);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    if (status) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="outline">Unknown</Badge>;
    if (status) return <Badge className="bg-green-500">Connected</Badge>;
    return <Badge variant="destructive">Disconnected</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          MetaMask Connection Tester
          {testing && <Loader2 className="w-4 h-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(wagmiConnected)}
              <span className="font-medium">Wagmi Connection</span>
              {getStatusBadge(wagmiConnected)}
            </div>
            <p className="text-sm text-gray-600">
              Address: {address || 'Not connected'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(enhancedConnected)}
              <span className="font-medium">Enhanced MetaMask</span>
              {getStatusBadge(enhancedConnected)}
            </div>
            <p className="text-sm text-gray-600">
              Accounts: {accounts.length}
            </p>
          </div>
        </div>

        {accounts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Connected Accounts:</h4>
            {accounts.map((account, index) => (
              <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                {account}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={checkConnections} disabled={testing}>
            {testing ? 'Testing...' : 'Refresh Connection Status'}
          </Button>
          <Button 
            onClick={testDelegation} 
            disabled={!enhancedConnected || testing}
            variant="outline"
          >
            Test Delegation
          </Button>
        </div>

        {lastTest && (
          <p className="text-xs text-gray-500">
            Last tested: {lastTest}
          </p>
        )}

        {!wagmiConnected && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Please connect your MetaMask wallet using the Connect Wallet button to test enhanced features.
            </p>
          </div>
        )}

        {wagmiConnected && !enhancedConnected && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              ❌ Wagmi shows connected but enhanced MetaMask service cannot detect the connection. 
              This might indicate an integration issue.
            </p>
          </div>
        )}

        {wagmiConnected && enhancedConnected && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Both Wagmi and enhanced MetaMask are properly connected! 
              Enhanced features like delegation and card activity are available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
