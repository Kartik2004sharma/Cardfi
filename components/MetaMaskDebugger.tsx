'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { enhancedMetaMaskService } from '@/lib/enhanced-metamask';

export function MetaMaskDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  const checkMetaMaskStatus = async () => {
    const info = {
      windowEthereum: !!(typeof window !== 'undefined' && window.ethereum),
      isMetaMask: !!(typeof window !== 'undefined' && window.ethereum?.isMetaMask),
      sdkInstalled: enhancedMetaMaskService.isInstalled(),
      isConnected: await enhancedMetaMaskService.isConnected(),
      accounts: await enhancedMetaMaskService.getAccounts(),
      timestamp: new Date().toLocaleTimeString()
    };
    
    setDebugInfo(info);
    console.log('MetaMask Debug Info:', info);
  };

  useEffect(() => {
    checkMetaMaskStatus();
  }, []);

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">MetaMask Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>window.ethereum: {debugInfo.windowEthereum ? '✅' : '❌'}</div>
        <div>isMetaMask: {debugInfo.isMetaMask ? '✅' : '❌'}</div>
        <div>SDK Installed: {debugInfo.sdkInstalled ? '✅' : '❌'}</div>
        <div>Is Connected: {debugInfo.isConnected ? '✅' : '❌'}</div>
        <div>Accounts: {debugInfo.accounts?.length || 0}</div>
        <div>Last Check: {debugInfo.timestamp}</div>
        <Button onClick={checkMetaMaskStatus} size="sm" className="mt-2">
          Refresh Debug
        </Button>
      </CardContent>
    </Card>
  );
}
